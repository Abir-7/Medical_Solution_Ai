import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import vision from "@google-cloud/vision";
dotenv.config();

const keyPath = path.join(__dirname, "vision-api-access.json");
console.log(keyPath);
const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath,
});

export const extractTextFromPdf = async (pdfPath: string): Promise<string> => {
  const pdfFile = fs.readFileSync(pdfPath);

  const request = {
    requests: [
      {
        inputConfig: {
          mimeType: "application/pdf",
          content: pdfFile.toString("base64"),
        },
        features: [
          {
            type: "DOCUMENT_TEXT_DETECTION" as const, // ✅ cast to literal to satisfy TypeScript
          },
        ],
      },
    ],
  };

  const [result] = await client.batchAnnotateFiles(request);
  const responses = result.responses || [];

  let fullText = "";
  for (const res of responses) {
    const annotation = res.responses?.[0]?.fullTextAnnotation;
    if (annotation?.text) fullText += annotation.text + "\n";
  }

  return fullText.trim();
};
