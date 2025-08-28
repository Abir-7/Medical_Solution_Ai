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
    req.body?.promt || ""
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Ai response is fetched.",
    data: result,
  });
});

const saveAiResponse = catchAsync(async (req, res) => {
  const result = await MedicalReportService.saveAiResponse(
    req.body,
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Ai response saved.",
    data: result,
  });
});
const getSavedReport = catchAsync(async (req, res) => {
  const result = await MedicalReportService.getSavedReport(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Report fetched successfully.",
    data: result,
  });
});

export const MedicalReportController = {
  getAiResponse,
  saveAiResponse,
  getSavedReport,
};
