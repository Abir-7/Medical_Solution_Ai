import status from "http-status";

import { PaymentService } from "./payment.service";
import catchAsync from "../../utils/serverTools/catchAsync";
import sendResponse from "../../utils/serverTools/sendResponse";
import { Request, Response } from "express";

export const createPayment = catchAsync(async (req: Request, res: Response) => {
  const tokenPackageId = req.params.tokenPackageId;
  const userId = req.user.userId;
  const userEmail = req.user.userEmail;

  // ✅ Expect card details in request body
  const { cardNumber, expDate, cvv, name, paymentMethod } = req.body;

  if (!cardNumber || !expDate || !cvv || !name || !paymentMethod) {
    sendResponse(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Missing required card/payment information",
      data: null,
    });
  }

  // 1️⃣ Call your updated PaymentService function with paymentData
  const result = await PaymentService.createPayUPayment(
    tokenPackageId,
    userId,
    userEmail,
    { cardNumber, expDate, cvv, name, paymentMethod }
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "PayU payment created",
    data: result,
  });
});

const payUWebhook = catchAsync(async (req: Request, res: Response) => {
  const webhookData = req.body;

  const result = await PaymentService.handlePayUWebhook(webhookData);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Webhook processed",
    data: result || null,
  });
});

export const PaymentController = { createPayment, payUWebhook };
