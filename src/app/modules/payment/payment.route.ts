import { Router } from "express";
import bodyParser from "body-parser";
import { PaymentController } from "./payment.controller";
const router = Router();

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  PaymentController.stripeWebhook
);
export const PaymentRoute = router;
