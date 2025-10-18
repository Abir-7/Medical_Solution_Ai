"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const config_1 = require("../../config");
const tokenPackages_model_1 = __importDefault(require("../TokenPackages/tokenPackages.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = __importDefault(require("./payment.model"));
const userToken_model_1 = __importDefault(require("../users/userToken/userToken.model"));
const mapPayUStateToPaymentStatus = (payUState) => {
    switch (payUState.toUpperCase()) {
        case "APPROVED":
            return payment_interface_1.PaymentStatus.PAID;
        case "PENDING":
        case "DECLINED":
        case "ERROR":
        default:
            return payment_interface_1.PaymentStatus.UNPAID;
    }
};
const createPayUPayment = (tokenPackageId, userId, userEmail, paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // 1️⃣ Fetch token package
    const tokenPackage = yield tokenPackages_model_1.default.findById(tokenPackageId).lean();
    if (!tokenPackage)
        throw new AppError_1.default(404, "Token package not found!");
    const amount = Number(tokenPackage.price.toFixed(2));
    const currency = "COP"; // ⚠️ Change to the real currency you charge in production
    const referenceCode = `ORD-${Date.now()}`; // ✅ Unique per transaction
    // 2️⃣ Generate PayU signature
    const signature = crypto_1.default
        .createHash("md5")
        .update(`${config_1.appConfig.payment.payu.apiKey}~${config_1.appConfig.payment.payu.merchantId}~${referenceCode}~${amount}~${currency}`)
        .digest("hex");
    // 3️⃣ Create transaction payload
    const payload = {
        language: "en",
        command: "SUBMIT_TRANSACTION",
        test: true, // ⚠️ CHANGE TO false in production
        merchant: {
            apiKey: config_1.appConfig.payment.payu.apiKey, // ⚠️ Use PRODUCTION API Key
            apiLogin: config_1.appConfig.payment.payu.apiLogin, // ⚠️ Use PRODUCTION API Login
        },
        transaction: {
            order: {
                accountId: config_1.appConfig.payment.payu.accountId, // ⚠️ Use PRODUCTION Account ID
                referenceCode,
                description: `${tokenPackage.tokenAmount} tokens at ${tokenPackage.price} ${currency}`,
                language: "en",
                signature,
                notifyUrl: "https://01t71ck4-4005.inc1.devtunnels.ms/api/payment/payu-webhook", // ⚠️ Set your LIVE webhook URL
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
            paymentCountry: config_1.appConfig.payment.payu.paymentCountry, // ⚠️ Ensure correct prod country (CO, CL, etc.)
            type: "AUTHORIZATION_AND_CAPTURE",
            ipAddress: "127.0.0.1", // ⚠️ Pass real client IP in prod
            deviceSessionId: `SESSION-${Date.now()}`,
            cookie: `COOKIE-${Date.now()}`,
            userAgent: "Mozilla/5.0", // ⚠️ Pass real UA in prod
        },
    };
    // 4️⃣ Call PayU API
    try {
        const response = yield axios_1.default.post(config_1.appConfig.payment.payu.apiUrl, payload, {
            headers: { "Content-Type": "application/json" },
        });
        const result = response.data;
        if (response.data.code === "ERROR") {
            throw Error(response.data.error || "Failed to make payment.");
        }
        const payment = yield payment_model_1.default.create({
            user: userId,
            tokenPackageId,
            priceAtBuyTime: tokenPackage.price,
            referenceCode,
            status: mapPayUStateToPaymentStatus(((_a = result.transactionResponse) === null || _a === void 0 ? void 0 : _a.state) || "UNPAID"),
            txId: (_b = result.transactionResponse) === null || _b === void 0 ? void 0 : _b.transactionId,
        });
        return {
            referenceCode: payment.referenceCode,
            orderId: (_c = result.transactionResponse) === null || _c === void 0 ? void 0 : _c.orderId,
            state: payment.status,
            transactionId: payment.txId,
        };
    }
    catch (err) {
        throw new AppError_1.default(500, ((_d = err.response) === null || _d === void 0 ? void 0 : _d.data) || err.message);
    }
});
const handlePayUWebhook = (webhookData) => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Extract main fields
    const referenceCode = webhookData.reference_sale; // your referenceCode
    const statePol = webhookData.response_message_pol; // e.g., "APPROVED"
    const txId = webhookData.transaction_id;
    const userEmail = webhookData.email_buyer; // you may need to map this to userId
    const description = webhookData.description; // contains token info, e.g., "60 tokens at 10 COP"
    if (!referenceCode || !txId || !userEmail) {
        throw new AppError_1.default(400, "Missing required webhook fields");
    }
    // 2️⃣ Find the payment in DB
    const payment = yield payment_model_1.default.findOne({ referenceCode });
    if (!payment)
        return;
    // 3️⃣ Map state to PaymentStatus
    payment.status =
        statePol.toUpperCase() === "APPROVED"
            ? payment_interface_1.PaymentStatus.PAID
            : payment_interface_1.PaymentStatus.UNPAID;
    payment.txId = txId;
    yield payment.save();
    // 4️⃣ Issue tokens if payment approved
    if (payment.status === payment_interface_1.PaymentStatus.PAID) {
        // Parse token amount from description like "60 tokens at 10 COP"
        const tokenMatch = description === null || description === void 0 ? void 0 : description.match(/^(\d+)\s+tokens/);
        const tokenAmount = tokenMatch ? Number(tokenMatch[1]) : 0;
        if (tokenAmount > 0) {
            const data = yield userToken_model_1.default.findOneAndUpdate({ user: payment.user }, // increment user's tokens
            { $inc: { token: tokenAmount } }, { upsert: true, new: true });
            console.log(data);
        }
    }
    return payment;
});
exports.PaymentService = {
    createPayUPayment,
    handlePayUWebhook,
};
