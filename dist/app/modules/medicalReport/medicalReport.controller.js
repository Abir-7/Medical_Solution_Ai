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
exports.MedicalReportController = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const medicalReport_service_1 = require("./medicalReport.service");
const catchAsync_1 = __importDefault(require("../../utils/serverTools/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/serverTools/sendResponse"));
const getAiResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filesArray = Array.isArray(req === null || req === void 0 ? void 0 : req.files) ? req.files : [];
    const fileData = filesArray.map((file) => ({
        mimetype: file.mimetype,
        path: file === null || file === void 0 ? void 0 : file.path,
    }));
    const result = yield medicalReport_service_1.MedicalReportService.getAiResponse(fileData, ((_a = req.body) === null || _a === void 0 ? void 0 : _a.promt) || "");
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Ai response is fetched.",
        data: result,
    });
}));
const saveAiResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield medicalReport_service_1.MedicalReportService.saveAiResponse(req.body, (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Ai response saved.",
        data: result,
    });
}));
const getSavedReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield medicalReport_service_1.MedicalReportService.getSavedReport(req === null || req === void 0 ? void 0 : req.user.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Report fetched successfully.",
        data: result,
    });
}));
exports.MedicalReportController = {
    getAiResponse,
    saveAiResponse,
    getSavedReport,
};
