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
exports.createDoc = exports.MedicalReportService = exports.saveAiResponse = void 0;
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const geminiAi_1 = require("../../ai/geminiAi");
const imageToBase64_1 = require("../../utils/helper/imageToBase64");
const unlinkFiles_1 = __importDefault(require("../../middleware/fileUpload/unlinkFiles"));
const getRelativeFilePath_1 = require("../../middleware/fileUpload/getRelativeFilePath");
const medicalReport_model_1 = __importDefault(require("./medicalReport.model"));
const docx_1 = require("docx");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../utils/serverTools/logger"));
const getAiResponse = (file, promt) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("hit");
    if (file.length <= 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "File not found.");
    }
    const contents = [];
    // Add the prompt to the beginning of the contents
    contents.push({ text: promt });
    // Loop through the files and process each one separately
    for (const fileItem of file) {
        const { path: filePath, mimetype } = fileItem;
        // Check the file type and process accordingly
        if (mimetype.includes("image")) {
            contents.push({
                text: `### Image Section:`, // Section title for image
            });
            contents.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: yield (0, imageToBase64_1.fileToBase64)(filePath),
                },
            });
            (0, unlinkFiles_1.default)((0, getRelativeFilePath_1.getRelativePath)(filePath));
        }
        else if (mimetype.includes("pdf")) {
            contents.push({
                text: `### PDF Section:`, // Section title for PDF
            });
            contents.push({
                inlineData: {
                    mimeType: "application/pdf",
                    data: yield (0, imageToBase64_1.fileToBase64)(filePath),
                },
            });
            (0, unlinkFiles_1.default)((0, getRelativeFilePath_1.getRelativePath)(filePath));
        }
        else if (mimetype.includes("audio")) {
            contents.push({
                text: `### Audio Section:`, // Section title for audio
            });
            contents.push({
                inlineData: {
                    mimeType: "audio/mp3",
                    data: yield (0, imageToBase64_1.fileToBase64)(filePath),
                },
            });
            (0, unlinkFiles_1.default)((0, getRelativeFilePath_1.getRelativePath)(filePath));
        }
    }
    // Ask Gemini to generate content based on the contents (sections for each file)
    const res = yield (0, geminiAi_1.askGeminiWithBase64Data)(contents);
    if (!res) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to generate content.");
    }
    // Ask Gemini to summarize the entire data
    const summaryRes = yield (0, geminiAi_1.askGeminiWithBase64Data)(contents);
    return JSON.parse(summaryRes);
});
const saveAiResponse = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const BASE_URL = "https://api.redactorapp.com";
    // Save to MongoDB
    // Generate DOCX (folder creation handled inside)
    const filePath = yield (0, exports.createDoc)(data, userId);
    // await MedicalReport.create({ user: userId, report: data });
    const downloadUrl = `${BASE_URL}/doc/${path_1.default.basename(filePath)}`;
    return { downloadUrl };
});
exports.saveAiResponse = saveAiResponse;
const getSavedReport = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const savedData = yield medicalReport_model_1.default.find({ user: userId }).sort({
        createdAt: -1,
    });
    return savedData;
});
exports.MedicalReportService = {
    getAiResponse,
    saveAiResponse: exports.saveAiResponse,
    getSavedReport,
};
const stripMarkdown = (text = "") => {
    return text
        .replace(/!\[.*?\]\(.*?\)/g, "") // images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
        .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
        .replace(/(\*|_)(.*?)\1/g, "$2") // italic
        .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // inline code
        .replace(/~~(.*?)~~/g, "$1") // strikethrough
        .replace(/>\s*(.*)/g, "$1") // blockquote
        .replace(/#+\s*(.*)/g, "$1") // headings
        .replace(/[-*]\s+(.*)/g, "$1") // lists
        .replace(/\n{2,}/g, "\n"); // multiple newlines -> single
};
const createDoc = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const folderPath = path_1.default.join(process.cwd(), "uploads", "doc");
    fs_1.default.mkdirSync(folderPath, { recursive: true });
    const children = [
        new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Medical Report for User: ${userId}`,
                    bold: true,
                    size: 28,
                }),
            ],
        }),
        new docx_1.Paragraph(" "),
    ];
    data.forEach((r, idx) => {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `${idx + 1}. ${stripMarkdown(r.title)}`,
                    bold: true,
                }),
            ],
        }), new docx_1.Paragraph(stripMarkdown(r.summary)), new docx_1.Paragraph(" "));
    });
    const doc = new docx_1.Document({ sections: [{ children }] });
    const buffer = yield docx_1.Packer.toBuffer(doc);
    const fileName = `report-${Date.now()}.docx`;
    const filePath = path_1.default.join(folderPath, fileName);
    fs_1.default.writeFileSync(filePath, buffer);
    return filePath;
});
exports.createDoc = createDoc;
