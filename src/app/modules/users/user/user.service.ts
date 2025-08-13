/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { UserProfile } from "../userProfile/userProfile.model";
import User from "./user.model";

const getMyData = async (userId: string) => {
  const user = await UserProfile.findOne({ user: userId }).populate("user");
  return user;
};

const deleteUser = async (userId: string) => {
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      isDeleted: true,
    }
  );

  if (!user) {
    throw new Error("Faild to delete user");
  }

  return user;
};

export const UserService = {
  getMyData,

  deleteUser,
};
