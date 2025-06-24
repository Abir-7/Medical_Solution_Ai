import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MedicalReportService } from "./medicalReport.service";

const getAiResponse = catchAsync(async (req, res) => {
  const result = await MedicalReportService.getAiResponse(
    req.file?.path as string
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Ai response is fetched.",
    data: result,
  });
});

export const MedicalReportController = { getAiResponse };
