/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { appConfig } from "../../config";
import TokenPackage from "../TokenPackages/tokenPackages.model";
import UserToken from "../userToken/userToken.model";
import AppError from "../../errors/AppError";
import status from "http-status";
import logger from "../../utils/serverTools/logger";

const stripe = new Stripe(appConfig.payment.stripe.secret_key as string);

const createPaymentIntent = async (tokenPackageId: string, userId: string) => {
  const tokenPackage = await TokenPackage.findOne({
    _id: tokenPackageId,
  }).lean();

  if (!tokenPackage) throw new Error("Token package not found!");

  const amount = Math.round(tokenPackage.price * 100);

  // Step 3: Create a new PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      userId,
      tokenPackageId,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: tokenPackage.price,
    tokenAmount: tokenPackage.tokenAmount,
    packageId: tokenPackageId,
  };
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
  // Handle successful payment event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata.userId;
    const packageId = paymentIntent.metadata.tokenPackageId;
    // ! TODO:  Add requied variable to save or fine data...

    if (paymentIntent.status !== "succeeded") {
      return { status: "skipping, not succeeded yet" };
    }

    const userToken = await UserToken.findOne({ user: userId });
    const tokenPackage = await TokenPackage.findOne({ _id: packageId });

    if (!userToken || !tokenPackage)
      throw new AppError(
        status.NOT_FOUND,
        "User-token data or Token-package data not found."
      );
  }

  // ! TODO:  DB operation required.....

  return { event: event.type, status: "not processed" };
};

export const PaymentService = { stripeWebhook, createPaymentIntent };
