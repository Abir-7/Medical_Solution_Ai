import AppError from "../../../errors/AppError";
import UserToken from "./userToken.model";

const useToken = async (amount: number, userId: string) => {
  const tokenData = await UserToken.findOne({ user: userId });
  if (!tokenData) {
    throw new AppError(404, "User token data not found.");
  }

  tokenData.token = tokenData.token - amount;
  return await tokenData.save();
};

export const UserTokenService = { useToken };
