import { IBaseUser } from "../users/user/user.interface";

export interface UserToken extends Document {
  token: number;
  user: IBaseUser; // Reference to User
}
