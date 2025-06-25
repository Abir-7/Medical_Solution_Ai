import fs from "fs";

export const convertPDFToBase64 = async (filePath: string) => {
  // Read the PDF file into a buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Convert the file buffer to base64
  const base64File = fileBuffer.toString("base64");

  return base64File;
};
