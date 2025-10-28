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

    if (tokenData.token < amount) {
      throw new AppError(400, "User doesn't have enough tokens.");
    }

    tokenData.token -= amount;
    const updatedData = await tokenData.save();

    return { remaining_token: updatedData.token };
  } catch (error: any) {
    throw error instanceof AppError ? error : new Error(error.message);
  }
};

export const UserTokenService = { useToken };
