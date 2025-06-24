import { GoogleGenerativeAI } from "@google/generative-ai";
import { appConfig } from "../config";
const genAI = new GoogleGenerativeAI(appConfig.ai_key.gemini_ai as string);

export const askGeminiText = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const analyzeImageWithGemini = async (
  base64Image: string,
  prompt: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ]);
  return result.response.text();
};
