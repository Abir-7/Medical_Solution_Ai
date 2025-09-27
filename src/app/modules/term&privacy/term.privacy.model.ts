import { Schema, model } from "mongoose";
import { IPrivacy, ITermsAndConditions } from "./term.privacy.interface";

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

export const TermsAndConditions = model<ITermsAndConditions>(
  "TermsAndConditions",
  termsAndConditionsSchema
);
//----------------------------------------------------------------------------------------------
const privacySchema = new Schema<IPrivacy>(
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

export const Privacy = model<IPrivacy>("Privacy", privacySchema);
