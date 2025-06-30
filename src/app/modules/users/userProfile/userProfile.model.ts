import { Schema, model } from "mongoose";
import { IUserProfile, Specialty } from "./userProfile.interface";

const userProfileSchema = new Schema<IUserProfile>({
  fullName: { type: String },
  nickname: { type: String },
  dateOfBirth: { type: Date },
  phone: { type: String },
  address: { type: String },
  image: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  specialty: {
    type: String,
    enum: Object.values(Specialty), // Restrict to values from the Specialty enum
    required: true,
  },
});

export const UserProfile = model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);
