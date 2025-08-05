import { model, Schema } from "mongoose";
import { UserToken } from "./userToken.interface";

// Define the Mongoose schema for UserToken
const userTokenSchema = new Schema<UserToken>(
  {
    token: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Create and export the model
const UserToken = model<UserToken>("UserToken", userTokenSchema);

export default UserToken;
