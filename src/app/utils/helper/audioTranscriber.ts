import fs from "fs";
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

export const transcribeAudio = async (filePath: string): Promise<string> => {
  const audioBytes = fs.readFileSync(filePath).toString("base64");

  const [response] = await client.recognize({
    audio: { content: audioBytes },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
    },
  });

  const transcript = response.results
    ?.map((r) => r.alternatives?.[0].transcript)
    .join(" ")
    .trim();

  return transcript || "";
};
