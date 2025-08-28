/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import status from "http-status";
import AppError from "../../errors/AppError";

import { askGeminiWithBase64Data } from "../../ai/geminiAi";
import { fileToBase64 } from "../../utils/helper/imageToBase64";
import unlinkFile from "../../middleware/fileUpload/unlinkFiles";
import { getRelativePath } from "../../middleware/fileUpload/getRelativeFilePath";
import MedicalReport from "./medicalReport.model";

const getAiResponse = async (
  file: { path: string; mimetype: string }[],
  promt: string
) => {
  if (file.length <= 0) {
    throw new AppError(status.NOT_FOUND, "File not found.");
  }

  const contents: {
    text?: string;
    inlineData?:
      | { mimeType: string; data: string }
      | { mimeType: string; data: string }
      | { mimeType: string; data: string };
  }[] = [];

  // Add the prompt to the beginning of the contents
  contents.push({ text: promt });

  // Loop through the files and process each one separately
  for (const fileItem of file) {
    const { path, mimetype } = fileItem;

    // Check the file type and process accordingly
    if (mimetype.includes("image")) {
      contents.push({
        text: `### Image Section:`, // Section title for image
      });
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: await fileToBase64(path),
        },
      });
      unlinkFile(getRelativePath(path));
    } else if (mimetype.includes("pdf")) {
      contents.push({
        text: `### PDF Section:`, // Section title for PDF
      });
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: await fileToBase64(path),
        },
      });
      unlinkFile(getRelativePath(path));
    } else if (mimetype.includes("audio")) {
      contents.push({
        text: `### Audio Section:`, // Section title for audio
      });
      contents.push({
        inlineData: {
          mimeType: "audio/mp3",
          data: await fileToBase64(path),
        },
      });
      unlinkFile(getRelativePath(path));
    }
  }

  // Ask Gemini to generate content based on the contents (sections for each file)
  const res = await askGeminiWithBase64Data(contents);

  if (!res) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to generate content."
    );
  }

  // Ask Gemini to summarize the entire data
  const summaryRes = await askGeminiWithBase64Data(contents);

  return JSON.parse(summaryRes);
};

const saveAiResponse = async (data: any, userId: string) => {
  const savedData = await MedicalReport.create({ user: userId, report: data });

  return savedData;
};
const getSavedReport = async (userId: string) => {
  const savedData = await MedicalReport.find({ user: userId });

  return savedData;
};

export const MedicalReportService = {
  getAiResponse,
  saveAiResponse,
  getSavedReport,
};
