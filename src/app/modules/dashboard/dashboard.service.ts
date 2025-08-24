/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable arrow-body-style */

import { userRoles } from "../../interface/auth.interface";
import Payment from "../payment/payment.model";
import TermsAndConditions from "../termCondition/term.model";
import User from "../users/user/user.model";
import { UserProfile } from "../users/userProfile/userProfile.model";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const dashboardData = async (
  filter: "daily" | "weekly" | "monthly" = "daily"
) => {
  const today = new Date();

  let matchDate: Date;
  let groupStage: any;
  let labels: string[];

  if (filter === "daily") {
    matchDate = new Date();
    matchDate.setDate(today.getDate() - 6); // last 7 days
    groupStage = {
      _id: { $dayOfWeek: "$createdAt" },
      total: { $sum: "$priceAtBuyTime" },
    };
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  } else if (filter === "weekly") {
    matchDate = new Date();
    matchDate.setDate(today.getDate() - 6 * 7); // last 6 weeks
    groupStage = {
      _id: { $week: "$createdAt" },
      total: { $sum: "$priceAtBuyTime" },
    };
    labels = Array.from({ length: 6 }, (_, i) => `Week ${i + 1}`);
  } else {
    matchDate = new Date(today.getFullYear(), 0, 1); // start of year
    groupStage = {
      _id: { $month: "$createdAt" },
      total: { $sum: "$priceAtBuyTime" },
    };
    labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  }

  const [totalUser, paymentStats, totalEarnAgg, userToken] = await Promise.all([
    User.countDocuments({
      role: userRoles.USER,
      isVerified: true,
      isDeleted: false,
    }),

    Payment.aggregate([
      { $match: { createdAt: { $gte: matchDate } } },
      { $group: groupStage },
    ]),

    Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$priceAtBuyTime" } } },
    ]),

    User.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "usertokens",
          localField: "_id",
          foreignField: "user",
          as: "tokenData",
        },
      },
      { $unwind: { path: "$tokenData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          email: 1,
          fullName: "$profile.fullName",
          token: "$tokenData.token",
        },
      },
    ]),
  ]);

  const totalEarn = totalEarnAgg[0]?.total || 0;

  const lookup: Record<string, number> = {};
  paymentStats.forEach((item) => {
    if (filter === "daily") {
      const dayMap = {
        1: "Sun",
        2: "Mon",
        3: "Tue",
        4: "Wed",
        5: "Thu",
        6: "Fri",
        7: "Sat",
      };
      lookup[(dayMap as any)[item._id]] = item.total;
    } else if (filter === "weekly") {
      lookup[item._id] = item.total;
    } else {
      lookup[item._id] = item.total; // month
    }
  });

  const chartData = labels.map((label, idx) => ({
    date: label,
    score:
      filter === "weekly"
        ? lookup[Object.keys(lookup)[idx]] || 0
        : filter === "monthly"
        ? lookup[idx + 1] || 0
        : lookup[label] || 0,
  }));

  return {
    totalUser,
    totalEarn,
    chartData,
    userToken,
  };
};

const userList = async () => {
  const result = await UserProfile.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "userData.role": { $ne: "ADMIN" },
        "userData.isDeleted": false,
      },
    },
    {
      $project: {
        _id: 0,
        fullName: 1,
        dateOfBirth: 1,
        phone: 1,
        address: 1,
        image: 1,
        specialty: 1,
        country: 1,
        email: "$userData.email",
        role: "$userData.role",
        user: 1,
      },
    },
  ]);

  return result;
};

const tokenData = async () => {
  const now = new Date();

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfLastMonth = new Date(
    lastMonth.getFullYear(),
    lastMonth.getMonth(),
    1
  );
  const endOfLastMonth = new Date(
    lastMonth.getFullYear(),
    lastMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const tokenSells = await Payment.aggregate([
    {
      $lookup: {
        from: "tokenpackages",
        localField: "tokenPackageId",
        foreignField: "_id",
        as: "package",
      },
    },
    { $unwind: "$package" },
    {
      $facet: {
        thisMonth: [
          { $match: { createdAt: { $gte: startOfThisMonth } } },
          {
            $group: {
              _id: null,
              totalTokens: { $sum: "$package.tokenAmount" },
            },
          },
        ],
        lastMonth: [
          {
            $match: {
              createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalTokens: { $sum: "$package.tokenAmount" },
            },
          },
        ],
      },
    },
  ]);

  const thisMonthTokens = tokenSells[0]?.thisMonth[0]?.totalTokens || 0;
  const lastMonthTokens = tokenSells[0]?.lastMonth[0]?.totalTokens || 0;

  const userData = await Payment.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$user",
        lastBuyDate: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "userprofiles",
        localField: "_id",
        foreignField: "user",
        as: "profile",
      },
    },
    { $unwind: "$profile" },
    {
      $lookup: {
        from: "usertokens",
        localField: "_id",
        foreignField: "user",
        as: "tokenData",
      },
    },
    { $unwind: "$tokenData" },
    {
      $project: {
        _id: 0,
        email: "$user.email",
        fullName: "$profile.fullName",
        currentToken: "$tokenData.token",
        lastBuyDate: 1,
      },
    },
  ]);

  return {
    thisMonthTokens,
    lastMonthTokens,
    users: userData,
  };
};

const addTerms = async (data: { content: string }) => {
  const updated = await TermsAndConditions.findOneAndUpdate(
    {},
    { $set: data },
    {
      new: true,
      upsert: true,
    }
  );

  return updated;
};

export const DashboardService = {
  dashboardData,
  userList,
  tokenData,
  addTerms,
};
