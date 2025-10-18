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
exports.PaymentController = exports.createPayment = void 0;
const http_status_1 = __importDefault(require("http-status"));
const payment_service_1 = require("./payment.service");
const catchAsync_1 = __importDefault(require("../../utils/serverTools/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/serverTools/sendResponse"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
exports.createPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenPackageId = req.params.tokenPackageId;
    const userId = req.user.userId;
    const userEmail = req.user.userEmail;
    // ✅ Expect card details in request body
    const { cardNumber, expDate, cvv, name, paymentMethod } = req.body;
    if (!cardNumber || !expDate || !cvv || !name || !paymentMethod) {
        throw new AppError_1.default(404, "Missing required card/payment information");
    }
    // 1️⃣ Call your updated PaymentService function with paymentData
    const result = yield payment_service_1.PaymentService.createPayUPayment(tokenPackageId, userId, userEmail, { cardNumber, expDate, cvv, name, paymentMethod });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "PayU payment created",
        data: result,
    });
}));
const payUWebhook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const webhookData = req.body;
    const result = yield payment_service_1.PaymentService.handlePayUWebhook(webhookData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Webhook processed",
        data: result || null,
    });
}));
exports.PaymentController = { createPayment: exports.createPayment, payUWebhook };
