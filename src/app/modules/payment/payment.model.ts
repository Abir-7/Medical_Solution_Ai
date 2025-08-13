import { Schema, model } from "mongoose";
import { Payment as IPayment } from "./payment.interface"; // Rename to avoid conflict

const paymentSchema = new Schema<IPayment>(
  {
    txId: {
      type: String,
      required: false, // Optional Stripe/Tx ID
    },
    priceAtBuyTime: {
      type: Number,
      required: true,
    },
    tokenPackageId: {
      type: Schema.Types.ObjectId,
      ref: "TokenPackage",
      required: true,
    },
    userTokenId: {
      type: Schema.Types.ObjectId,
      ref: "UserToken",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Add ref for population
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

paymentSchema.index({ createdAt: 1 }); // for date-based queries
paymentSchema.index({ user: 1 }); // for user-specific lookups

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
