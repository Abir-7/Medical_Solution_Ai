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
exports.UserTokenController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const userToken_service_1 = require("./userToken.service");
const sendResponse_1 = __importDefault(require("../../../utils/serverTools/sendResponse"));
const catchAsync_1 = __importDefault(require("../../../utils/serverTools/catchAsync"));
const useToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userToken_service_1.UserTokenService.useToken(req.body.amount, req.body.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User token adjust successfully.",
        data: result,
    });
}));
exports.UserTokenController = {
    useToken,
};
