/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { appConfig } from "../config";
const genAI = new GoogleGenerativeAI(appConfig.ai_key.gemini_ai as string);

export const askGeminiWithBase64Data = async (
  prompt: string,
  base64Data: string,
  type: "image" | "pdf"
) => {
  // Ensure that the base64Data is passed correctly (as a string)
  if (typeof base64Data !== "string") {
    throw new Error("Base64 data should be a string");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let result: GenerateContentResult | undefined;

  if (type === "image") {
    result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ]);
  }

  if (type === "pdf") {
    result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
    ]);
  }

  return result?.response ? result.response.text() : "No response from Ai";
};
