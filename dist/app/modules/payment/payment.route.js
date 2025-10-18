"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoute = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.get("/new-payment/:tokenPackageId", (0, auth_1.auth)("USER"), payment_controller_1.PaymentController.createPayment);
router.post("/payu-webhook", payment_controller_1.PaymentController.payUWebhook);
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.stripeWebhook
// );
exports.PaymentRoute = router;
