"use strict";
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
exports.UserTokenService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const logger_1 = __importDefault(require("../../../utils/serverTools/logger"));
const userToken_model_1 = __importDefault(require("./userToken.model"));
const useToken = (amount, userId) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(userId);
    try {
        const tokenData = yield userToken_model_1.default.findOne({ user: userId });
        if (!tokenData) {
            throw new AppError_1.default(404, "User token data not found.");
        }
        if (tokenData.token < amount) {
            throw new AppError_1.default(400, "User doesn't have enough tokens.");
        }
        tokenData.token -= amount;
        const updatedData = yield tokenData.save();
        return { remaining_token: updatedData.token };
    }
    catch (error) {
        throw error instanceof AppError_1.default ? error : new Error(error.message);
    }
});
exports.UserTokenService = { useToken };
