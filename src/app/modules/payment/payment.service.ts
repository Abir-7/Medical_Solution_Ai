/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { appConfig } from "../../config";
import TokenPackage from "../TokenPackages/tokenPackages.model";
import UserToken from "../users/userToken/userToken.model";
import AppError from "../../errors/AppError";
import status from "http-status";

import Payment from "./payment.model";
import logger from "../../utils/serverTools/logger";

const stripe = new Stripe(appConfig.payment.stripe.secret_key as string);

const createPaymentIntent = async (tokenPackageId: string, userId: string) => {
  const tokenPackage = await TokenPackage.findOne({
    _id: tokenPackageId,
  }).lean();

  if (!tokenPackage) throw new Error("Token package not found!");

  const amount = Math.round(tokenPackage.price * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tokenPackage._id}`,
              description: `${tokenPackage.tokenAmount} at ${tokenPackage.price}$`,
            },
            unit_amount: amount, // $20.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: userId,
        tokenPackageId: tokenPackageId,
      },
      payment_intent_data: {
        metadata: {
          userId: userId,
          tokenPackageId: tokenPackageId,
        },
      },
      success_url: "https://4d9frmqz-4005.asse.devtunnels.ms/", //! replace with your frontend success URL
      cancel_url: "https://4d9frmqz-4005.asse.devtunnels.ms/", //! replace with your frontend cancel URL
    });

    return { url: session.url };
  } catch (err: any) {
    throw new Error(err);
  }
};

const stripeWebhook = async (rawBody: Buffer, sig: string) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      appConfig.payment.stripe.webhook?.trim() as string
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
  logger.info(event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const txId = session.payment_intent as string;

    const existingPayment = await Payment.findOne({ txId });
    if (existingPayment) {
      return { status: "already processed" };
    }

    let metadata = session.metadata;
    if (!metadata) {
      const paymentIntent = await stripe.paymentIntents.retrieve(txId);
      metadata = paymentIntent.metadata;
    }

    const { userId, tokenPackageId } = metadata;
    const actualPrice = session.amount_total ? session.amount_total / 100 : 0;

    // Fetch user token and token package in parallel
    const [userToken, tokenPackage] = await Promise.all([
      UserToken.findOne({ user: userId }),
      TokenPackage.findOne({ _id: tokenPackageId }),
    ]);
    if (!userToken || !tokenPackage) {
      throw new AppError(
        status.NOT_FOUND,
        "User-token data or Token-package data not found."
      );
    }

    await Payment.create({
      txId,
      tokenPackageId,
      priceAtBuyTime: actualPrice,
      userTokenId: userToken._id,
      user: userId,
    });

    userToken.token = userToken.token + tokenPackage.tokenAmount;
    await userToken.save();

    return { event: event.type, status: "processed" };
  }

  // For other event types, return not processed
  return { event: event.type, status: "not processed" };
};

export const PaymentService = { stripeWebhook, createPaymentIntent };
