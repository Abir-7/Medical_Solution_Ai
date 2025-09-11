/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { appConfig } from "../../config";
import TokenPackage from "../TokenPackages/tokenPackages.model";

import AppError from "../../errors/AppError";

import crypto from "crypto";
import axios from "axios";
import { PaymentStatus } from "./payment.interface";
import Payment from "./payment.model";
import UserToken from "../users/userToken/userToken.model";

const mapPayUStateToPaymentStatus = (payUState: string): PaymentStatus => {
  switch (payUState.toUpperCase()) {
    case "APPROVED":
      return PaymentStatus.PAID;
    case "PENDING":
    case "DECLINED":
    case "ERROR":
    default:
      return PaymentStatus.UNPAID;
  }
};

const createPayUPayment = async (
  tokenPackageId: string,
  userId: string,
  userEmail: string,
  paymentData: {
    cardNumber: string;
    expDate: string; // "2030/12"
    cvv: string;
    name: string;
    paymentMethod: string; // "VISA", "MASTERCARD"
  }
) => {
  // 1️⃣ Fetch token package
  const tokenPackage = await TokenPackage.findById(tokenPackageId).lean();
  if (!tokenPackage) throw new AppError(404, "Token package not found!");

  const amount = Number(tokenPackage.price.toFixed(2));
  const currency = "COP"; // ⚠️ Change to the real currency you charge in production
  const referenceCode = `ORD-${Date.now()}`; // ✅ Unique per transaction

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
    test: true, // ⚠️ CHANGE TO false in production
    merchant: {
      apiKey: appConfig.payment.payu.apiKey, // ⚠️ Use PRODUCTION API Key
      apiLogin: appConfig.payment.payu.apiLogin, // ⚠️ Use PRODUCTION API Login
    },
    transaction: {
      order: {
        accountId: appConfig.payment.payu.accountId, // ⚠️ Use PRODUCTION Account ID
        referenceCode,
        description: `${tokenPackage.tokenAmount} tokens at ${tokenPackage.price} ${currency}`,
        language: "en",
        signature,
        notifyUrl:
          "https://01t71ck4-4005.inc1.devtunnels.ms/api/payment/payu-webhook", // ⚠️ Set your LIVE webhook URL
        additionalValues: {
          TX_VALUE: { value: amount, currency },
          TX_TAX: { value: 0, currency },
          TX_TAX_RETURN_BASE: { value: 0, currency },
        },
        buyer: {
          merchantBuyerId: userId,
          fullName: "Buyer Name", // ⚠️ Replace with real buyer full name
          emailAddress: userEmail,
        },
      },
      payer: {
        merchantPayerId: userId,
        fullName: "Buyer Name", // ⚠️ Replace with real payer full name
        emailAddress: userEmail,
      },
      creditCard: {
        number: paymentData.cardNumber, // ⚠️ Never log this in prod
        securityCode: paymentData.cvv,
        expirationDate: paymentData.expDate, // format "YYYY/MM"
        name: paymentData.name, // Cardholder name
      },
      paymentMethod: paymentData.paymentMethod, // VISA, MASTERCARD, etc.
      paymentCountry: appConfig.payment.payu.paymentCountry, // ⚠️ Ensure correct prod country (CO, CL, etc.)
      type: "AUTHORIZATION_AND_CAPTURE",
      ipAddress: "127.0.0.1", // ⚠️ Pass real client IP in prod
      deviceSessionId: `SESSION-${Date.now()}`,
      cookie: `COOKIE-${Date.now()}`,
      userAgent: "Mozilla/5.0", // ⚠️ Pass real UA in prod
    },
  };

  // 4️⃣ Call PayU API
  try {
    const response = await axios.post(appConfig.payment.payu.apiUrl!, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const result = response.data;
    if (response.data.code === "ERROR") {
      throw Error(response.data.error || "Failed to make payment.");
    }

    const payment = await Payment.create({
      user: userId,
      tokenPackageId,
      priceAtBuyTime: tokenPackage.price,
      referenceCode,
      status: mapPayUStateToPaymentStatus(
        result.transactionResponse?.state || "UNPAID"
      ),
      txId: result.transactionResponse?.transactionId,
    });

    return {
      referenceCode: payment.referenceCode,
      orderId: result.transactionResponse?.orderId,
      state: payment.status,
      transactionId: payment.txId,
    };
  } catch (err: any) {
    throw new AppError(500, err.response?.data || err.message);
  }
};

const handlePayUWebhook = async (webhookData: any) => {
  // 1️⃣ Extract main fields
  const referenceCode = webhookData.reference_sale; // your referenceCode
  const statePol = webhookData.response_message_pol; // e.g., "APPROVED"
  const txId = webhookData.transaction_id;
  const userEmail = webhookData.email_buyer; // you may need to map this to userId
  const description = webhookData.description; // contains token info, e.g., "60 tokens at 10 COP"

  if (!referenceCode || !txId || !userEmail) {
    throw new AppError(400, "Missing required webhook fields");
  }

  // 2️⃣ Find the payment in DB
  const payment = await Payment.findOne({ referenceCode });
  if (!payment) return;

  // 3️⃣ Map state to PaymentStatus
  payment.status =
    statePol.toUpperCase() === "APPROVED"
      ? PaymentStatus.PAID
      : PaymentStatus.UNPAID;
  payment.txId = txId;

  await payment.save();

  // 4️⃣ Issue tokens if payment approved
  if (payment.status === PaymentStatus.PAID) {
    // Parse token amount from description like "60 tokens at 10 COP"
    const tokenMatch = description?.match(/^(\d+)\s+tokens/);
    const tokenAmount = tokenMatch ? Number(tokenMatch[1]) : 0;

    if (tokenAmount > 0) {
      const data = await UserToken.findOneAndUpdate(
        { user: payment.user }, // increment user's tokens
        { $inc: { token: tokenAmount } },
        { upsert: true, new: true }
      );
      console.log(data);
    }
  }

  return payment;
};
export const PaymentService = {
  createPayUPayment,
  handlePayUWebhook,
};
