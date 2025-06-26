import status from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUser();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "All user fetched successfully.",
    data: result,
  });
});

export const UserController = { getAllUser };
