import { myDataSource } from "./../../db/database";
import Stripe from "stripe";
import { appConfig } from "../../config";

import { TokenPackage } from "../TokenPackages/tokenPackages.entity";
import { UserToken } from "../userToken/userToken.entity";
import { Payment } from "./payment.entity";
import AppError from "../../errors/AppError";
import status from "http-status";
const stripe = new Stripe(appConfig.payment.stripe.secret_key as string);

const createPaymentIntent = async (tokenPackageId: string, userId: string) => {
  const tokenPackageRepo = myDataSource.getRepository(TokenPackage);
  const tokenPackage = await tokenPackageRepo.findOne({
    where: { id: tokenPackageId },
  });

  if (!tokenPackage) throw new Error("Token package not found!");

  // Stripe needs amount in *cents*
  const amount = Math.round(tokenPackage.price * 100);

  // Create the PaymentIntent with metadata for later identification
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd", // or your preferred currency

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

  // Handle successful payment event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata.userId;
    const packageId = paymentIntent.metadata.tokenPackageId;
    const amount = paymentIntent.amount;

    // Prevent re-processing of already handled events
    if (paymentIntent.status !== "succeeded") {
      return { status: "skipping, not succeeded yet" };
    }

    const userTokenRepo = myDataSource.getRepository(UserToken);
    const tokenPackageRepo = myDataSource.getRepository(TokenPackage);

    console.log("User ID:", userId);
    const userTokenData = await userTokenRepo.findOneBy({ id: `${userId}` });
    console.log("Token-repo", userTokenData);

    console.log("Token Package ID:", packageId);
    const tokenPackageData = await tokenPackageRepo.findOneOrFail({
      where: { id: `${packageId}` },
    });

    console.log("Token-Package-repo", tokenPackageData);
  }

  // Handle other event types if needed (e.g., payment failed, refunds, etc.)
  return { event: event.type, status: "not processed" };
};

export const PaymentService = { stripeWebhook, createPaymentIntent };
