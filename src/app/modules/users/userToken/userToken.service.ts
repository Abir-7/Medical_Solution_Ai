/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../../errors/AppError";
import UserToken from "./userToken.model";

const useToken = async (amount: number, userId: string) => {
  try {
    const tokenData = await UserToken.findOne({ user: userId });
    if (!tokenData) {
      throw new AppError(404, "User token data not found.");
    }

    tokenData.token = tokenData.token - amount;
    const updatedData = await tokenData.save();
    console.log(updatedData.token);
    return { remaining_token: updatedData.token };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const UserTokenService = { useToken };
