import UserToken from "./userToken.model";

const useToken = async (amount: number, userId: string) => {
  const tokenData = await UserToken.findOne();
};
