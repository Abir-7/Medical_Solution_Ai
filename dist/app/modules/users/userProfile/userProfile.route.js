"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileRoute = void 0;
const express_1 = require("express");
const zodValidator_1 = __importDefault(require("../../../middleware/zodValidator"));
const userProfile_validation_1 = require("./userProfile.validation");
const fileUploadHandler_1 = require("../../../middleware/fileUpload/fileUploadHandler");
const auth_1 = require("../../../middleware/auth/auth");
const userProfile_controller_1 = require("./userProfile.controller");
const parseDataField_1 = require("../../../middleware/fileUpload/parseDataField");
const router = (0, express_1.Router)();
router.patch("/update-profile-image", (0, auth_1.auth)("ADMIN", "USER"), fileUploadHandler_1.upload.single("image"), userProfile_controller_1.UserProfileController.updateProfileImage);
router.patch("/update-profile-data", (0, auth_1.auth)("ADMIN", "USER"), (0, zodValidator_1.default)(userProfile_validation_1.zodUpdateProfileSchema), userProfile_controller_1.UserProfileController.updateProfileData);
router.patch("/update-profile", (0, auth_1.auth)("ADMIN", "USER"), fileUploadHandler_1.upload.single("image"), (0, parseDataField_1.parseDataField)("data"), (0, zodValidator_1.default)(userProfile_validation_1.zodUpdateProfileSchema), userProfile_controller_1.UserProfileController.updateProfile);
exports.UserProfileRoute = router;
