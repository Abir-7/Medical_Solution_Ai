import { Router } from "express";
import express from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth/auth";
const router = Router();

router.get(
  "/new/:tokenPackageId",
  auth("USER"),
  PaymentController.createPaymentIntent
);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.stripeWebhook
// );
export const PaymentRoute = router;
