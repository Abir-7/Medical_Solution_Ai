import status from "http-status";
import { UserTokenService } from "./userToken.service";
import sendResponse from "../../../utils/serverTools/sendResponse";
import catchAsync from "../../../utils/serverTools/catchAsync";

const useToken = catchAsync(async (req, res) => {
  const result = await UserTokenService.useToken(
    req.body.amount,
    req.body.userId
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User token adjust successfully.",
    data: result,
  });
});

export const UserTokenController = {
  useToken,
};
