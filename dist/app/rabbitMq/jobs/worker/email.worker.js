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
exports.handleEmailJob = void 0;
const sendEmail_1 = require("../../../utils/sendEmail");
const logger_1 = __importDefault(require("../../../utils/serverTools/logger"));
const handleEmailJob = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield (0, sendEmail_1.sendEmail)({
            to: data.to,
            subject: data.subject,
            code: data.code, // 🔑 pass OTP here
            expireTime: (_a = data.expireTime) !== null && _a !== void 0 ? _a : 10,
            projectName: "RedactorApp",
            purpose: (_b = data.purpose) !== null && _b !== void 0 ? _b : "Verification", // 🔹 dynamic purpose
        });
        logger_1.default.info("📧 Email sent to:", data.to);
    }
    catch (error) {
        logger_1.default.error("❌ Failed to send email:", error);
    }
});
exports.handleEmailJob = handleEmailJob;
