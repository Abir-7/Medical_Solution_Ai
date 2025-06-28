import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createPaymentIntent = catchAsync(async (req, res) => {
  const result = await PaymentService.createPaymentIntent(
    req.params.tokenPackageId,
    req.user.userId
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Webhook response",
    data: result,
  });
});

const stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;
  const result = await PaymentService.stripeWebhook(rawBody, sig);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Webhook response",
    data: result,
  });
});

export const PaymentController = { stripeWebhook, createPaymentIntent };
