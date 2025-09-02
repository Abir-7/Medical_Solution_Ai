import AppError from "../../../errors/AppError";
import UserToken from "./userToken.model";

const useToken = async (amount: number, userId: string) => {
  const tokenData = await UserToken.findOne({ user: userId });
  if (!tokenData) {
    throw new AppError(404, "User token data not found.");
  }

  tokenData.token = tokenData.token - amount;
  const updatedData = await tokenData.save();
  console.log(updatedData.token);
  return { remaining_token: updatedData.token };
};

export const UserTokenService = { useToken };
