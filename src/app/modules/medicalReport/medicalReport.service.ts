import status from "http-status";
import AppError from "../../errors/AppError";

import { imageToBase64 } from "../../utils/helper/imageToBase64";

import { convertPDFToBase64 } from "../../utils/helper/pdfToBase64";
import { askGeminiWithBase64Data } from "../../ai/geminiAi";

const getAiResponse = async (path: string) => {
  if (!path) {
    throw new AppError(status.NOT_FOUND, "File not found.");
  }

  const bse = await convertPDFToBase64(path);

  if (path.includes("image")) {
    return await askGeminiWithBase64Data(
      "what doctor say in this.?",
      bse,
      "image"
    );
  }

  if (path.includes("pdf")) {
    return await askGeminiWithBase64Data(
      await imageToBase64(path),
      "what doctor say in this.?",
      "pdf"
    );
  }
  return "No response from ai";
};

export const MedicalReportService = { getAiResponse };
