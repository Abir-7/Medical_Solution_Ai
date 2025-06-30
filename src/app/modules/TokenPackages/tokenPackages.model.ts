import { model, Schema } from "mongoose";
import { TokenPackage } from "./tokenPackages.interface";

// Define the Mongoose schema for TokenPackage
const tokenPackageSchema = new Schema<TokenPackage>(
  {
    price: {
      type: Number,
      required: true,
    },
    tokenAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const TokenPackage = model<TokenPackage>("TokenPackage", tokenPackageSchema);

export default TokenPackage;
