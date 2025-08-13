/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable arrow-body-style */

import { userRoles } from "../../interface/auth.interface";
import Payment from "../payment/payment.model";
import TermsAndConditions from "../termCondition/term.model";
import User from "../users/user/user.model";
import { UserProfile } from "../users/userProfile/userProfile.model";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const dashboardData = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // last 7 days including today

  // Run user count and payment aggregations in parallel
  const [totalUser, paymentStats, userToken] = await Promise.all([
    User.countDocuments({
      role: userRoles.USER,
      isVerified: true,
      isDeleted: false,
    }),

    Payment.aggregate([
      {
        $facet: {
          totalEarn: [
            { $group: { _id: null, total: { $sum: "$priceAtBuyTime" } } },
          ],
          earningsByDay: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) to 7 (Sat)
                total: { $sum: "$priceAtBuyTime" },
              },
            },
          ],
        },
      },
    ]),

    User.aggregate([
      {
        $match: {
          isDeleted: false, // optional filter
        },
      },
      {
        $lookup: {
          from: "userprofiles", // collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true, // keep users even if profile is missing
        },
      },
      {
        $lookup: {
          from: "usertokens", // collection name
          localField: "_id",
          foreignField: "user",
          as: "tokenData",
        },
      },
      {
        $unwind: {
          path: "$tokenData",
          preserveNullAndEmptyArrays: true,
        },
      },
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

  const totalEarn = paymentStats[0]?.totalEarn[0]?.total || 0;
  const earningsByDay = paymentStats[0]?.earningsByDay || [];

  const dayMap = {
    1: "Sun",
    2: "Mon",
    3: "Tue",
    4: "Wed",
    5: "Thu",
    6: "Fri",
    7: "Sat",
  };

  // Convert earningsByDay into a lookup object
  const earningsLookup: Record<string, number> = {};
  for (const day of earningsByDay) {
    const dayName = dayMap[day._id as keyof typeof dayMap];
    earningsLookup[dayName] = day.total;
  }

  // Build final chart data using map
  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({
      date: day,
      score: earningsLookup[day] || 0,
    })
  );

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
