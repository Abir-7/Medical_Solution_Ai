import mongoose, { Schema } from "mongoose";
import { IMedicalReport } from "./medicalReport.interface";

const ReportItemSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
  },
  { _id: false } // prevent creating _id for each report item
);

const MedicalReportSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    report: { type: [ReportItemSchema], default: [] },
  },
  { timestamps: true }
);

// Create and export the model
const MedicalReport = mongoose.model<IMedicalReport>(
  "MedicalReport",
  MedicalReportSchema
);

export default MedicalReport;
