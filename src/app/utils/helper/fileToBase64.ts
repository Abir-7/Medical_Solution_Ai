/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import fs from "fs";

export const fileToBase64 = async (path: string) => {
  const base64 = fs.readFileSync(path, { encoding: "base64" });

  return base64;
};
