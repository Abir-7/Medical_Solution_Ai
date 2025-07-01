import mongoose, { Schema } from "mongoose";
import { IMedicalReport } from "./medicalReport.interface";

const MedicalReportSchema = new Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Create and export the model
const MedicalReport = mongoose.model<IMedicalReport>(
  "MedicalReport",
  MedicalReportSchema
);

export default MedicalReport;
