/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { appConfig } from "../../config";
import TokenPackage from "../TokenPackages/tokenPackages.model";
import UserToken from "../userToken/userToken.model";
import AppError from "../../errors/AppError";
import status from "http-status";

import Payment from "./payment.model";

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
      success_url: "http://localhost:3000/success", // replace with your frontend success URL
      cancel_url: "http://localhost:3000/cancel", // replace with your frontend cancel URL
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

  // --- PAYMENT INTENT SUCCEEDED ---
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    if (paymentIntent.status !== "succeeded") {
      return { status: "skipping, not succeeded yet" };
    }

    const { userId, tokenPackageId } = paymentIntent.metadata;
    const amountInCents = paymentIntent.amount;
    const actualPrice = amountInCents / 100;

    // Find user token and token package in parallel
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

    // Idempotency: avoid double creation if Payment with this txId already exists
    const existingPayment = await Payment.findOne({ txId: paymentIntent.id });
    if (existingPayment) {
      return { status: "already processed" };
    }

    await Payment.create({
      txId: paymentIntent.id,
      tokenPackageId,
      priceAtBuyTime: actualPrice,
      userTokenId: userToken._id,
      user: userId,
    });

    return { event: event.type, status: "processed" };
  }

  // --- CHECKOUT SESSION COMPLETED ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Use session.payment_intent as transaction ID
    const txId = session.payment_intent as string;

    // Idempotency: check if payment already exists
    const existingPayment = await Payment.findOne({ txId });
    if (existingPayment) {
      return { status: "already processed" };
    }

    // You might need to fetch metadata from PaymentIntent if not included in session
    let metadata = session.metadata;
    if (!metadata) {
      // Optional: fetch PaymentIntent if you store userId/packageId there
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

    return { event: event.type, status: "processed" };
  }

  // For other event types, return not processed
  return { event: event.type, status: "not processed" };
};

export const PaymentService = { stripeWebhook, createPaymentIntent };
