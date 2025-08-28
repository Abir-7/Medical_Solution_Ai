export interface IMedicalReport {
  user: string; // or ObjectId if referencing a User collection
  report: {
    title: string;
    summary: string;
  }[];
}
