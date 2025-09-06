import { Schema, model } from "mongoose";
import { Payment as IPayment, PaymentStatus } from "./payment.interface"; // Rename to avoid conflict

const paymentSchema = new Schema<IPayment>(
  {
    txId: { type: String, default: null },
    priceAtBuyTime: { type: Number, required: true },
    tokenPackageId: {
      type: Schema.Types.ObjectId,
      ref: "TokenPackage",
      required: true,
    },

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
    referenceCode: { type: String, required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: 1 }); // for date-based queries
paymentSchema.index({ user: 1 }); // for user-specific lookups

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
