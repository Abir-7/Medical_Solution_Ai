import status from "http-status";
import catchAsync from "../../utils/serverTools/catchAsync";
import sendResponse from "../../utils/serverTools/sendResponse";
import { DashboardService } from "./dashboard.service";

const dashboardData = catchAsync(async (req, res) => {
  const result = await DashboardService.dashboardData(
    req.query.filter as "daily" | "weekly" | "monthly"
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Dashboard data is fetched successfully.",
    data: result,
  });
});
const tokenData = catchAsync(async (req, res) => {
  const result = await DashboardService.tokenData();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All User token data is fetched successfully",
    data: result,
  });
});
const userList = catchAsync(async (req, res) => {
  const result = await DashboardService.userList();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User list is fetched successfully.",
    data: result,
  });
});
const addTerms = catchAsync(async (req, res) => {
  const result = await DashboardService.addTerms(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Terms added successfully.",
    data: result,
  });
});
const getTerms = catchAsync(async (req, res) => {
  const result = await DashboardService.getTerms();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Terms fetched successfully.",
    data: result,
  });
});

const addPrivacy = catchAsync(async (req, res) => {
  const result = await DashboardService.addPrivacy(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Privacy added successfully.",
    data: result,
  });
});
const getPrivacy = catchAsync(async (req, res) => {
  const result = await DashboardService.getPrivacy();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Privacy fetched successfully.",
    data: result,
  });
});

export const DashboardController = {
  dashboardData,
  userList,
  tokenData,
  addTerms,
  getTerms,
  getPrivacy,
  addPrivacy,
};
