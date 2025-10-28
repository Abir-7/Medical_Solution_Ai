/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../../errors/AppError";
import logger from "../../../utils/serverTools/logger";
import UserToken from "./userToken.model";

const useToken = async (amount: number, userId: string) => {
  logger.info(userId);
  try {
    const tokenData = await UserToken.findOne({ user: userId });
    if (!tokenData) {
      throw new AppError(404, "User token data not found.");
    }

    tokenData.token = tokenData.token - amount;

    if (tokenData.token - amount <= 0) {
      throw new AppError(400, "User don't have enough token.");
    }

    const updatedData = await tokenData.save();

    return { remaining_token: updatedData.token };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const UserTokenService = { useToken };
