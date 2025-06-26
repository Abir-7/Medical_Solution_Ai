import logger from "../../../utils/logger";
import { sendEmail } from "../../../utils/sendEmail";
import { EmailJob } from "../types";

export const handleEmailJob = async (data: EmailJob) => {
  try {
    console.log("📧------- Sending email to", data.to);
    await sendEmail(data.to, data.subject, data.text);
    console.log("📧 Sending email to------", data.to);
  } catch (error) {
    logger.error(error);
  }
};
