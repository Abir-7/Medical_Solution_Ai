import status from "http-status";

import { MedicalReportService } from "./medicalReport.service";
import catchAsync from "../../utils/serverTools/catchAsync";
import sendResponse from "../../utils/serverTools/sendResponse";

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
