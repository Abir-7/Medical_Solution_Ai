import { IBaseUser } from "../user/user.interface";

export interface IUserProfile {
  fullName: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  image?: string;
  user: IBaseUser;
  country: string;
  specialty: string;
}
