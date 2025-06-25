import fs from "fs";

export const imageToBase64 = async (path: string) => {
  const base64 = fs.readFileSync(path, { encoding: "base64" });

  return base64;
};
