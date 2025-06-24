import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const askGeminiText = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const analyzeImageWithGemini = async (
  base64Image: string,
  prompt: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
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
