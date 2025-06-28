import Stripe from "stripe";
import { appConfig } from "../../config";
import { myDataSource } from "../../db/database";
import { TokenPackage } from "../TokenPackages/tokenPackages.entity";
import { UserToken } from "../userToken/userToken.entity";
import { Payment } from "./payment.entity";
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
      appConfig.payment.stripe.webhook as string
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

    const userTokenRepo = myDataSource.getRepository(UserToken);
    const tokenPackageRepo = myDataSource.getRepository(TokenPackage);
    const paymentRepo = myDataSource.getRepository(Payment);

    // Fetch userToken and tokenPackage from the DB
    const userToken = await userTokenRepo.findOne({ where: { id: userId } });
    const tokenPackage = await tokenPackageRepo.findOne({
      where: { id: packageId },
    });

    // Check if the user or token package was not found
    if (!userToken || !tokenPackage)
      throw new Error("User or package not found");

    // Prepare the payment record to save
    const newPayment = paymentRepo.create({
      txId: paymentIntent.id,
      tokenPackageId: tokenPackage,
      priceAtBuyTime: amount / 100, // Convert to dollars if using cents
      userTokenId: userToken,
    });

    // Save payment to DB
    const savedPayment = await paymentRepo.save(newPayment);

    // Add tokens to the user (increment them)
    userToken.token += tokenPackage.tokenAmount; // Increment tokens
    await userTokenRepo.save(userToken); // Save the updated userToken

    return {
      userId,
      amount,
      event: event.type,
      status: "tokens granted",
      paymentId: savedPayment.id,
    };
  }

  // Handle other event types if needed (e.g., payment failed, refunds, etc.)
  return { event: event.type, status: "not processed" };
};

export const PaymentService = { stripeWebhook, createPaymentIntent };
