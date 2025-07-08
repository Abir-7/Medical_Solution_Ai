import status from "http-status";
import AppError from "../../errors/AppError";

import { askGeminiWithBase64Data } from "../../ai/geminiAi";
import { fileToBase64 } from "../../utils/helper/fileToBase64";

const getAiResponse = async (path: string) => {
  if (!path) {
    throw new AppError(status.NOT_FOUND, "File not found.");
  }

  if (path.includes("image")) {
    return await askGeminiWithBase64Data(
      "what doctor say in this.?",
      await fileToBase64(path),
      "image"
    );
  }

  if (path.includes("pdf")) {
    return await askGeminiWithBase64Data(
      "what doctor say in this.?",
      await fileToBase64(path),

      "pdf"
    );
  }

  if (path.includes("audio")) {
    return await askGeminiWithBase64Data("", await fileToBase64(path), "audio");
  }

  return "No response from ai";
};

export const MedicalReportService = { getAiResponse };
