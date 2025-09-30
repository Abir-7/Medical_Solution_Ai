/* eslint-disable arrow-body-style */
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

import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import logger from "../../utils/serverTools/logger";
const getAiResponse = async (
  file: { path: string; mimetype: string }[],
  promt: string
) => {
  logger.info("hit");
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
    const { path: filePath, mimetype } = fileItem;

    // Check the file type and process accordingly
    if (mimetype.includes("image")) {
      contents.push({
        text: `### Image Section:`, // Section title for image
      });
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: await fileToBase64(filePath),
        },
      });
      unlinkFile(getRelativePath(filePath));
    } else if (mimetype.includes("pdf")) {
      contents.push({
        text: `### PDF Section:`, // Section title for PDF
      });
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: await fileToBase64(filePath),
        },
      });
      unlinkFile(getRelativePath(filePath));
    } else if (mimetype.includes("audio")) {
      contents.push({
        text: `### Audio Section:`, // Section title for audio
      });
      contents.push({
        inlineData: {
          mimeType: "audio/mp3",
          data: await fileToBase64(filePath),
        },
      });
      unlinkFile(getRelativePath(filePath));
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
export const saveAiResponse = async (data: any, userId: string) => {
  const BASE_URL = "https://01t71ck4-4005.inc1.devtunnels.ms";

  // Save to MongoDB
  const savedData = await MedicalReport.create({ user: userId, report: data });

  // Generate DOCX (folder creation handled inside)
  const filePath = await createDoc(data, userId);

  const downloadUrl = `${BASE_URL}/doc/${path.basename(filePath)}`;
  return { downloadUrl };
};

const getSavedReport = async (userId: string) => {
  const savedData = await MedicalReport.find({ user: userId }).sort({
    createdAt: -1,
  });

  return savedData;
};

export const MedicalReportService = {
  getAiResponse,
  saveAiResponse,
  getSavedReport,
};

const stripMarkdown = (text: string) => {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // inline code
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/>\s*(.*)/g, "$1") // blockquote
    .replace(/#+\s*(.*)/g, "$1") // headings
    .replace(/[-*]\s+(.*)/g, "$1") // lists
    .replace(/\n{2,}/g, "\n"); // multiple newlines -> single
};

export const createDoc = async (data: any[], userId: string) => {
  const folderPath = path.join(process.cwd(), "uploads", "doc");
  fs.mkdirSync(folderPath, { recursive: true });

  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: `Medical Report for User: ${userId}`,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph(" "),
  ];

  data.forEach((r: any, idx: number) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${idx + 1}. ${stripMarkdown(r.title)}`,
            bold: true,
          }),
        ],
      }),
      new Paragraph(stripMarkdown(r.summary)),
      new Paragraph(" ")
    );
  });

  const doc = new Document({ sections: [{ children }] });

  const buffer = await Packer.toBuffer(doc);

  const fileName = `report-${Date.now()}.docx`;
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, buffer);

  return filePath;
};
