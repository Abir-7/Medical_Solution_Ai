import { Router } from "express";
import { MedicalReportController } from "./medicalReport.controller";
import { upload } from "../../middleware/fileUpload/fileUploadHandler";
import { parseDataField } from "../../middleware/fileUpload/parseDataField";
import { auth } from "../../middleware/auth/auth";

const router = Router();

router.post(
  "/get-ai-res",
  upload.array("file"),
  parseDataField("data"),
  MedicalReportController.getAiResponse
);

router.post(
  "/save-ai-response",

  MedicalReportController.saveAiResponse
);

router.get(
  "/get-medical-report",
  auth("USER"),
  MedicalReportController.getSavedReport
);

export const MedicalReportRoute = router;
