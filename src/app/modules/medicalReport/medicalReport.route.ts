import { Router } from "express";
import { MedicalReportController } from "./medicalReport.controller";
import { upload } from "../../middleware/fileUpload/fileUploadHandler";
import { parseDataField } from "../../middleware/fileUpload/parseDataField";

const router = Router();

router.post(
  "/get-ai-res",
  upload.array("file"),
  parseDataField("data"),
  MedicalReportController.getAiResponse
);

export const MedicalReportRoute = router;
