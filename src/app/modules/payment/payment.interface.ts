import { ITokenPackage } from "../TokenPackages/tokenPackages.interface";
import { IBaseUser } from "../users/user/user.interface";
import { UserToken } from "../users/userToken/userToken.interface";

export interface Payment extends Document {
  txId: string | null;
  priceAtBuyTime: number;
  tokenPackageId: ITokenPackage;
  userTokenId: UserToken;
  user: IBaseUser;
}
