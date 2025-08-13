import status from "http-status";
import catchAsync from "../../../utils/serverTools/catchAsync";
import sendResponse from "../../../utils/serverTools/sendResponse";
import { UserProfileService } from "./userProfile.service";
import { getRelativePath } from "../../../middleware/fileUpload/getRelativeFilePath";

const updateProfileImage = catchAsync(async (req, res) => {
  const filePath = req.file?.path;
  const result = await UserProfileService.updateProfileImage(
    filePath as string,
    req.user.userEmail
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile image changed successfully.",
    data: result,
  });
});

const updateProfileData = catchAsync(async (req, res) => {
  const userData = req.body;

  const result = await UserProfileService.updateProfileData(
    userData,
    req.user.userEmail
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile info updated successfully.",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const filePath = req.file?.path;

  const userData = {
    ...req.body,
    ...(filePath && { image: getRelativePath(filePath) }),
  };

  const result = await UserProfileService.updateProfile(
    userData,
    req.user.userEmail
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile info updated successfully.",
    data: result,
  });
});

export const UserProfileController = {
  updateProfileData,
  updateProfileImage,
  updateProfile,
};
