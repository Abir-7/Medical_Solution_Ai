import status from "http-status";
import AppError from "../../errors/AppError";
import { appConfig } from "../../config";
import { getRelativePath } from "../../middlewares/fileUpload/getRelativeFilePath";
import { imageToBase64 } from "../../utils/helper/imageToBase64";
import { analyzeImageWithGemini } from "../../ai/geminiAi";
import { extractTextFromPdf } from "../../utils/helper/google/pdfReader";

const getAiResponse = async (path: string) => {
  if (!path) {
    throw new AppError(status.NOT_FOUND, "File not found.");
  }

  console.log(path);

  return await extractTextFromPdf(path);

  // return await analyzeImageWithGemini(
  //   await imageToBase64(path),
  //   "what doctor say in this.?"
  // );
};

export const MedicalReportService = { getAiResponse };
