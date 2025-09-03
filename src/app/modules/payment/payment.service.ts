/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { appConfig } from "../../config";
import TokenPackage from "../TokenPackages/tokenPackages.model";
import UserToken from "../users/userToken/userToken.model";
import AppError from "../../errors/AppError";
import status from "http-status";
import crypto from "crypto";
import axios from "axios";

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

interface PayUPaymentResult {
  referenceCode: string;
  transactionUrl: string;
}

const createPayUPaymentIntent = async (
  tokenPackageId: string,
  userId: string,
  userEmail: string
): Promise<PayUPaymentResult> => {
  // 1️⃣ Fetch token package
  const tokenPackage = await TokenPackage.findOne({
    _id: tokenPackageId,
  }).lean();
  if (!tokenPackage) throw new AppError(404, "Token package not found!");

  const amount = Math.round(tokenPackage.price); // PayU expects integer value
  const currency = "COP";
  const referenceCode = `ORD-${Date.now()}`;

  // 2️⃣ Generate PayU signature
  const signature = crypto
    .createHash("md5")
    .update(
      `${appConfig.payment.payu.apiKey}~${appConfig.payment.payu.merchantId}~${referenceCode}~${amount}~${currency}`
    )
    .digest("hex");

  // 3️⃣ Create transaction payload
  const payload = {
    language: "en",
    command: "SUBMIT_TRANSACTION",
    test: true,
    merchant: {
      apiKey: appConfig.payment.payu.apiKey,
      apiLogin: appConfig.payment.payu.apiLogin,
    },
    transaction: {
      order: {
        accountId: appConfig.payment.payu.accountId,
        referenceCode,
        description: `${tokenPackage.tokenAmount} tokens at ${tokenPackage.price} COP`,
        language: "en",
        signature,
        additionalValues: {
          TX_VALUE: {
            value: amount,
            currency: currency,
          },
          TX_TAX: {
            value: 0,
            currency: currency,
          },
          TX_TAX_RETURN_BASE: {
            value: 0,
            currency: currency,
          },
        },
        buyer: {
          merchantBuyerId: userId,
          fullName: "Md Tazwarul Islam",
          emailAddress: userEmail,
          contactPhone: "1234567890",
          dniNumber: "1234567890",
          shippingAddress: {
            street1: "Street name",
            city: "City",
            state: "State",
            country: "CO",
            postalCode: 110111,
            phone: 1234567890,
          },
        },
      },
      payer: {
        merchantPayerId: userId,
        fullName: "Md Tazwarul Islam",
        emailAddress: userEmail,
        contactPhone: "1234567890",
        dniNumber: "1234567890",
        billingAddress: {
          street1: "Street name",
          city: "City",
          state: "State",
          country: "CO",
          postalCode: 110111,
          phone: 1234567890,
        },
      },
      paymentMethod: "CARD",
      paymentCountry: "CO",
      type: "AUTHORIZATION_AND_CAPTURE",
      ipAddress: "127.0.0.1",
      deviceSessionId: `SESSION-${Date.now()}`,
      cookie: `COOKIE-${Date.now()}`,
      userAgent: "Mozilla/5.0",
      extraParameters: {
        RESPONSE_URL: "https://yourfrontend.com/success",
        CONFIRMATION_URL: "https://yourbackend.com/api/payu-webhook",
      },
    },
  };

  // 4️⃣ Call PayU API
  try {
    const response = await axios.post(
      appConfig.payment.payu.apiUrl as string,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const transactionUrl =
      response.data?.transactionResponse?.extraParameters
        ?.URL_PAYMENT_RECEIPT_HTML;

    if (!transactionUrl)
      throw new AppError(400, "Failed to create PayU transaction");

    return { referenceCode, transactionUrl };
  } catch (err: any) {
    throw new AppError(500, err.response?.data || err.message);
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

export const PaymentService = {
  stripeWebhook,
  createPaymentIntent,
  createPayUPaymentIntent,
};
