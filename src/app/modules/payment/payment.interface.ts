import { ITokenPackage } from "../TokenPackages/tokenPackages.interface";
import { IBaseUser } from "../users/user/user.interface";

export interface Payment extends Document {
  txId: string | null;
  priceAtBuyTime: number;
  tokenPackageId: ITokenPackage;

  user: IBaseUser;
  status: PaymentStatus;
  referenceCode: string;
}

export enum PaymentStatus {
  PAID = "paid",
  UNPAID = "unpaid",
}
