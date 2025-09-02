/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Types } from "mongoose";
import { UserProfile } from "../userProfile/userProfile.model";

import User from "./user.model";
import UserToken from "../userToken/userToken.model";

const getMyData = async (userId: string) => {
  const data = await UserProfile.aggregate([
    { $match: { user: new Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $lookup: {
        from: "usertokens",
        localField: "user",
        foreignField: "user",
        as: "tokenInfo",
      },
    },
    { $unwind: { path: "$tokenInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ["$fullName", ""] },
        email: { $ifNull: ["$userInfo.email", ""] },
        userId: { $ifNull: [{ $toString: "$userInfo._id" }, ""] },
        image: { $ifNull: ["$image", ""] },
        country: { $ifNull: ["$country", ""] },
        phone: { $ifNull: ["$phone", ""] },
        specialty: { $ifNull: ["$specialty", ""] },
        dateOfBirth: {
          $ifNull: [
            { $dateToString: { format: "%Y-%m-%d", date: "$dateOfBirth" } },
            "",
          ],
        },
        token: { $ifNull: ["$tokenInfo.token", ""] },
      },
    },
  ]);

  return data[0] || null;
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
const getMyToken = async (userId: string) => {
  const user = await UserToken.findOne({ user: userId });

  return { userToken: user?.token ? user?.token : 0 };
};

export const UserService = {
  getMyData,
  deleteUser,
  getMyToken,
};
