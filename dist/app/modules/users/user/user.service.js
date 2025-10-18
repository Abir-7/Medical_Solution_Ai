"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
exports.UserService = void 0;
const mongoose_1 = require("mongoose");
const userProfile_model_1 = require("../userProfile/userProfile.model");
const user_model_1 = __importDefault(require("./user.model"));
const userToken_model_1 = __importDefault(require("../userToken/userToken.model"));
const logger_1 = __importDefault(require("../../../utils/serverTools/logger"));
const getMyData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield userProfile_model_1.UserProfile.aggregate([
        { $match: { user: new mongoose_1.Types.ObjectId(userId) } },
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
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOneAndUpdate({
        _id: userId,
    }, {
        isDeleted: true,
    });
    if (!user) {
        throw new Error("Faild to delete user");
    }
    return user;
});
const getMyToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userToken_model_1.default.findOne({ user: userId });
    return { userToken: (user === null || user === void 0 ? void 0 : user.token) ? user === null || user === void 0 ? void 0 : user.token : 0 };
});
const checkUserTokenAvailability = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    logger_1.default.info(userId);
    try {
        const user_token = yield userToken_model_1.default.findOne({ user: userId });
        const has_token = !!user_token && ((_a = user_token.token) !== null && _a !== void 0 ? _a : 0) > 4;
        return { has_token };
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.UserService = {
    getMyData,
    deleteUser,
    getMyToken,
    checkUserTokenAvailability,
};
