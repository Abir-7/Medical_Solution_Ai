import { Router } from "express";
import bodyParser from "body-parser";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth/auth";
const router = Router();

router.get(
  "/new/:tokenPackageId",
  auth("USER"),
  PaymentController.createPaymentIntent
);

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);
export const PaymentRoute = router;
