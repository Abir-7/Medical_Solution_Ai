import status from "http-status";

import { TokenPackageService } from "./tokenPackages.service";
import catchAsync from "../../utils/serverTools/catchAsync";
import sendResponse from "../../utils/serverTools/sendResponse";

const addNewPackage = catchAsync(async (req, res) => {
  const result = await TokenPackageService.addnewPackage(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "New token package successfully.",
    data: result,
  });
});

const getAllPackage = catchAsync(async (req, res) => {
  const result = await TokenPackageService.getAllTokenPackage();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All token package fetched successfully.",
    data: result,
  });
});

export const TokenPackageController = { addNewPackage, getAllPackage };
