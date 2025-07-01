import { model, Schema } from "mongoose";
import { ITokenPackage } from "./tokenPackages.interface";

// Define the Mongoose schema for TokenPackage
const tokenPackageSchema = new Schema<ITokenPackage>(
  {
    price: {
      type: Number,
      required: true,
    },
    tokenAmount: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const TokenPackage = model<ITokenPackage>("TokenPackage", tokenPackageSchema);

export default TokenPackage;
