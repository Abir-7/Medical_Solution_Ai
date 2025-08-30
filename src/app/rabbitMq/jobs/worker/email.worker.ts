import { sendEmail } from "../../../utils/sendEmail";
import logger from "../../../utils/serverTools/logger";
import { EmailJob } from "../types";

export const handleEmailJob = async (data: EmailJob) => {
  try {
    await sendEmail({
      to: data.to,
      subject: data.subject,
      code: data.code, // 🔑 pass OTP here
      expireTime: data.expireTime ?? 10,
      projectName: "MedicalSolution",
      supportUrl: "https://support.medicalsolution.com",
      purpose: data.purpose ?? "Verification", // 🔹 dynamic purpose
    });

    logger.info("📧 Email sent to:", data.to);
  } catch (error) {
    logger.error("❌ Failed to send email:", error);
  }
};
