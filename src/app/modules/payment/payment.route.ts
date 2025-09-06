import { Router } from "express";

import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth/auth";

const router = Router();

router.get(
  "/new-payment/:tokenPackageId",
  auth("USER"),
  PaymentController.createPayment
);

router.post("/payu-webhook", PaymentController.payUWebhook);
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.stripeWebhook
// );
export const PaymentRoute = router;
