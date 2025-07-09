/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";

import { MedicalReportService } from "./medicalReport.service";
import catchAsync from "../../utils/serverTools/catchAsync";
import sendResponse from "../../utils/serverTools/sendResponse";

const getAiResponse = catchAsync(async (req, res) => {
  const filesArray = Array.isArray(req?.files) ? req.files : [];
  const fileData = filesArray.map(
    (file: { path: string; mimetype: string }) => ({
      mimetype: file.mimetype,
      path: file?.path,
    })
  );

  const result = await MedicalReportService.getAiResponse(
    fileData,
    req.body?.promt
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Ai response is fetched.",
    data: result,
  });
});

export const MedicalReportController = { getAiResponse };
