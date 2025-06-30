import { Router } from "express";
import { MedicalReportController } from "./medicalReport.controller";
import { upload } from "../../middleware/fileUpload/fileUploadHandler";

const router = Router();

router.post(
  "/get-ai-res",
  upload.single("file"),
  MedicalReportController.getAiResponse
);

export const MedicalReportRoute = router;
