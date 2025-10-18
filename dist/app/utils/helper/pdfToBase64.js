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
exports.convertPDFToBase64 = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const fs_1 = __importDefault(require("fs"));
const convertPDFToBase64 = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    // Read the PDF file into a buffer
    const fileBuffer = fs_1.default.readFileSync(filePath);
    // Convert the file buffer to base64
    const base64File = fileBuffer.toString("base64");
    return base64File;
});
exports.convertPDFToBase64 = convertPDFToBase64;
