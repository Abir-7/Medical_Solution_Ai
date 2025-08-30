/* eslint-disable @typescript-eslint/no-explicit-any */
export type JobType = "email" | "notification" | "report";

export interface EmailJob {
  to: string;
  subject: string;
  code?: string;
  expireTime?: number;
  purpose?: string; // optional for dynamic verification type
}

export interface JobPayload {
  type: JobType;

  data: any;
}
