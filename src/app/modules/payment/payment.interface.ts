import { ITokenPackage } from "../TokenPackages/tokenPackages.interface";
import { UserToken } from "../userToken/userToken.interface";

export interface Payment extends Document {
  txId: string | null;
  priceAtBuyTime: number;
  tokenPackageId: ITokenPackage;
  userTokenId: UserToken;
}
