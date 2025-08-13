import { Schema, model } from "mongoose";
import { ITermsAndConditions } from "./term.interface";

const termsAndConditionsSchema = new Schema<ITermsAndConditions>(
  {
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TermsAndConditions = model<ITermsAndConditions>(
  "TermsAndConditions",
  termsAndConditionsSchema
);

export default TermsAndConditions;
