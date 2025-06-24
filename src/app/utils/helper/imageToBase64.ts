import fs from "fs";
import { analyzeImageWithGemini } from "../../ai/geminiAi";

export const imageUploadHandler = async (path: string) => {
  const base64 = fs.readFileSync(path, { encoding: "base64" });
  const response = await analyzeImageWithGemini(
    base64,
    "Describe this image in detail"
  );
  return response;
};
