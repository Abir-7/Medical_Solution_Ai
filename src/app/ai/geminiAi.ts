/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GoogleGenAI } from "@google/genai";
import { appConfig } from "../config";

const genAI = new GoogleGenAI({ apiKey: appConfig.ai_key.gemini_ai });

// Helper function to create content based on the type
const createContent = (type: "image" | "pdf" | "audio", base64Data: string) => {
  console.log(type, base64Data);

  switch (type) {
    case "audio":
      return [
        { text: "Please summarize the audio." },
        {
          inlineData: {
            mimeType: "audio/mp3",
            data: base64Data,
          },
        },
      ];
    case "image":
      return [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        { text: "Caption this image." },
      ];
    case "pdf":
      return [
        { text: "Summarize this document" },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
      ];
    default:
      throw new Error("Unsupported content type");
  }
};

export const askGeminiWithBase64Data = async (
  prompt: string,
  base64Data: string,
  type: "image" | "pdf" | "audio"
) => {
  // Ensure base64Data is passed correctly
  if (typeof base64Data !== "string") {
    throw new Error("Base64 data should be a string");
  }

  try {
    // Prepare the content based on type
    const contents = createContent(type, base64Data);

    // Generate response
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    if (!response || !response.text) {
      throw new Error("Failed to get a valid response from Gemini");
    }

    return response.text;
  } catch (error) {
    console.error("Error in askGeminiWithBase64Data:", error);
    throw error; // Propagate the error for further handling
  }
};
