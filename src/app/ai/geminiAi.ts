/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GoogleGenAI } from "@google/genai";
import { appConfig } from "../config";
import logger from "../utils/serverTools/logger";

const genAI = new GoogleGenAI({ apiKey: appConfig.ai_key.gemini_ai });

export const askGeminiWithBase64Data = async (contents: any) => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            patientDetails: {
              type: "string",
              description:
                "Details about the patient including age, gender, and medical history",
            },
            doctorSuggestions: {
              type: "string",
              description:
                "Suggestions made by the doctor based on the analysis of provided data",
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
  } catch (error) {
    logger.error("Error in askGeminiWithBase64Data:", error);
    throw error; // Propagate the error for further handling
  }
};
