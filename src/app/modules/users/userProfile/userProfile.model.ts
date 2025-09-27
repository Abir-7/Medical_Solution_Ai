import { Schema, model } from "mongoose";
import { IUserProfile, Specialty } from "./userProfile.interface";

const userProfileSchema = new Schema<IUserProfile>({
  fullName: { type: String, default: "" },
  dateOfBirth: { type: Date, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  image: { type: String, default: "" },
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  specialty: {
    type: String,
    enum: Object.values(Specialty), // Restrict to values from the Specialty enum
    default: null,
  },
  country: {
    type: String,
    default: "",
  },
});

export const UserProfile = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);
