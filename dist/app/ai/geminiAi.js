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
exports.askGeminiWithBase64Data = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const genai_1 = require("@google/genai");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/serverTools/logger"));
const genAI = new genai_1.GoogleGenAI({ apiKey: config_1.appConfig.ai_key.gemini_ai });
const askGeminiWithBase64Data = (contents) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: {
                    type: "object",
                    properties: {
                        patientDetails: {
                            type: "string",
                            description: "Details about the patient including age, gender, and medical history",
                        },
                        doctorSuggestions: {
                            type: "string",
                            description: "Suggestions made by the doctor based on the analysis of provided data",
                        },
                        summary: {
                            type: "string",
                            description: "A summary of the information from all sections",
                        },
                    },
                    required: ["patientDetails", "doctorSuggestions", "summary"],
                },
            },
        });
        if (!response || !response.text) {
            throw new Error("Failed to get a valid response from Gemini");
        }
        return response.text;
    }
    catch (error) {
        logger_1.default.error("Error in askGeminiWithBase64Data:", error);
        throw error; // Propagate the error for further handling
    }
});
exports.askGeminiWithBase64Data = askGeminiWithBase64Data;
