import status from "http-status";
import catchAsync from "../../../utils/serverTools/catchAsync";
import sendResponse from "../../../utils/serverTools/sendResponse";
import { UserService } from "./user.service";

const getMyData = catchAsync(async (req, res) => {
  const result = await UserService.getMyData(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User data is fetched successfully",
    data: result,
  });
});
const getMyToken = catchAsync(async (req, res) => {
  const result = await UserService.getMyToken(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User token is fetched successfully",
    data: result,
  });
});
const checkUserTokenAvailability = catchAsync(async (req, res) => {
  const result = await UserService.getMyToken(req.body.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User token checking successfully",
    data: result,
  });
});

const deleteMe = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.user.userId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User data  is deleted successfully",
    data: result,
  });
});
const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.params.uId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User data  is deleted successfully",
    data: result,
  });
});

export const UserController = {
  getMyData,
  getMyToken,
  deleteMe,
  deleteUser,
  checkUserTokenAvailability,
};
