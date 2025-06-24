import fs from "fs";
import { analyzeImageWithGemini } from "../../ai/geminiAi";

export const imageToBase64 = async (path: string) => {
  const base64 = fs.readFileSync(path, { encoding: "base64" });

  return base64;
};
