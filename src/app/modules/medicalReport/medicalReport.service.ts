import status from "http-status";
import AppError from "../../errors/AppError";

const getAiResponse = async (path: string) => {
  if (!path) {
    throw new AppError(status.NOT_FOUND, "File not found.");
  }

  console.log(path);
  return path;
};

export const MedicalReportService = { getAiResponse };
