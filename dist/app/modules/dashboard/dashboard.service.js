"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable arrow-body-style */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const auth_interface_1 = require("../../interface/auth.interface");
const payment_model_1 = __importDefault(require("../payment/payment.model"));
const term_privacy_model_1 = require("../term&privacy/term.privacy.model");
const user_model_1 = __importDefault(require("../users/user/user.model"));
const userProfile_model_1 = require("../users/userProfile/userProfile.model");
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const dashboardData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filter = "daily") {
    var _a;
    const today = new Date();
    let matchDate;
    let groupStage;
    let labels;
    if (filter === "daily") {
        matchDate = new Date();
        matchDate.setDate(today.getDate() - 6); // last 7 days
        groupStage = {
            _id: { $dayOfWeek: "$createdAt" },
            total: { $sum: "$priceAtBuyTime" },
        };
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }
    else if (filter === "weekly") {
        matchDate = new Date();
        matchDate.setDate(today.getDate() - 6 * 7); // last 6 weeks
        groupStage = {
            _id: { $week: "$createdAt" },
            total: { $sum: "$priceAtBuyTime" },
        };
        labels = Array.from({ length: 6 }, (_, i) => `Week ${i + 1}`);
    }
    else {
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
    const [totalUser, paymentStats, totalEarnAgg, userToken] = yield Promise.all([
        user_model_1.default.countDocuments({
            role: auth_interface_1.userRoles.USER,
            isVerified: true,
            isDeleted: false,
        }),
        payment_model_1.default.aggregate([
            { $match: { createdAt: { $gte: matchDate } } },
            { $group: groupStage },
        ]),
        payment_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: "$priceAtBuyTime" } } },
        ]),
        user_model_1.default.aggregate([
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
    const totalEarn = ((_a = totalEarnAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const lookup = {};
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
            lookup[dayMap[item._id]] = item.total;
        }
        else if (filter === "weekly") {
            lookup[item._id] = item.total;
        }
        else {
            lookup[item._id] = item.total; // month
        }
    });
    const chartData = labels.map((label, idx) => ({
        date: label,
        score: filter === "weekly"
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
});
const userList = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userProfile_model_1.UserProfile.aggregate([
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
});
const tokenData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    const tokenSells = yield payment_model_1.default.aggregate([
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
    const thisMonthTokens = ((_b = (_a = tokenSells[0]) === null || _a === void 0 ? void 0 : _a.thisMonth[0]) === null || _b === void 0 ? void 0 : _b.totalTokens) || 0;
    const lastMonthTokens = ((_d = (_c = tokenSells[0]) === null || _c === void 0 ? void 0 : _c.lastMonth[0]) === null || _d === void 0 ? void 0 : _d.totalTokens) || 0;
    const userData = yield payment_model_1.default.aggregate([
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
});
const addTerms = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield term_privacy_model_1.TermsAndConditions.findOneAndUpdate({}, // match any (or you could use a fixed key like { type: "default" })
    { $set: data }, {
        new: true,
        upsert: true, // create if not exist
    });
    return updated;
});
const getTerms = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield term_privacy_model_1.Privacy.findOne(); // simpler & safer than find()[0]
});
const addPrivacy = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield term_privacy_model_1.Privacy.findOneAndUpdate({}, // match any (or you could use a fixed key like { type: "default" })
    { $set: data }, {
        new: true,
        upsert: true, // create if not exist
    });
    return updated;
});
const getPrivacy = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield term_privacy_model_1.Privacy.findOne(); // simpler & safer than find()[0]
});
exports.DashboardService = {
    dashboardData,
    userList,
    tokenData,
    addTerms,
    getTerms,
    addPrivacy,
    getPrivacy,
};
