import { Schema, model } from "mongoose";
import { Payment } from "./payment.interface"; // Import the interface for Payment

// Define the Mongoose schema for Payment
const paymentSchema = new Schema<Payment>(
  {
    txId: {
      type: String,
      required: false, // txId is nullable, so no `required`
    },
    priceAtBuyTime: {
      type: Number,
      required: true, // This field is required
    },
    tokenPackageId: {
      type: Schema.Types.ObjectId,
      ref: "TokenPackage", // Reference to TokenPackage model
      required: true,
    },
    userTokenId: {
      type: Schema.Types.ObjectId,
      ref: "UserToken",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Create and export the model
const Payment = model<Payment>("Payment", paymentSchema);

export default Payment;
