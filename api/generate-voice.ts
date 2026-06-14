import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const maxDuration = 60; // Allows up to 60 seconds of processing time

// Lazy Initialize Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required GEMINI_API_KEY configuration on host environment.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to wrap raw 24kHz Mono 16-bit PCM in a WAV container
function createWavHeaderAndAppendPCM(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const subchunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subchunk2Size;

  const header = Buffer.alloc(44);

  // ChunkID: "RIFF"
  header.write("RIFF", 0);
  // ChunkSize
  header.writeUInt32LE(chunkSize, 4);
  // Format: "WAVE"
  header.write("WAVE", 8);
  // Subchunk1ID: "fmt "
  header.write("fmt ", 12);
  // Subchunk1Size: 16
  header.writeUInt32LE(16, 16);
  // AudioFormat: 1 (PCM)
  header.writeUInt16LE(1, 20);
  // NumChannels: 1 (mono)
  header.writeUInt16LE(numChannels, 22);
  // SampleRate
  header.writeUInt32LE(sampleRate, 24);
  // ByteRate
  header.writeUInt32LE(byteRate, 28);
  // BlockAlign
  header.writeUInt16LE(blockAlign, 32);
  // BitsPerSample: 16
  header.writeUInt16LE(bitsPerSample, 34);
  // Subchunk2ID: "data"
  header.write("data", 36);
  // Subchunk2Size
  header.writeUInt32LE(subchunk2Size, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method Not Allowed", 
      message: "Only POST requests are supported on this endpoint." 
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing required API configurations on host environment." });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { text, voiceName, script, voice } = req.body;
    const finalVoice = voice || voiceName || "Zephyr";
    const finalScript = script || text;

    if (!finalScript || typeof finalScript !== "string") {
      return res.status(400).json({ 
        error: "Missing required speech text content",
        details: "Please provide a valid text string to generate speech audio." 
      });
    }

    // Clean up markdown markers or extra quotes that might affect speaking pronunciation
    const cleanText = finalScript.replace(/["*#_`[\]]/g, " ").trim();

    if (!cleanText) {
      return res.status(400).json({ 
        error: "Invalid speech text content",
        details: "The text input did not contain any voiceable alphabetic character content." 
      });
    }

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: finalVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ 
        error: "Failed to synthesize speech", 
        details: "No audio data was returned by the underlying generative voice model." 
      });
    }

    const pcmBuffer = Buffer.from(base64Audio, "base64");
    const wavBuffer = createWavHeaderAndAppendPCM(pcmBuffer, 24000);
    const wavBase64 = wavBuffer.toString("base64");

    return res.json({
      success: true,
      audioBase64: wavBase64,
      voiceName: finalVoice,
    });
  } catch (err: any) {
    console.error("Text-to-speech generation failure:", err);
    return res.status(500).json({ 
      error: "Voice synthesis failed", 
      details: err.message || "An unexpected error occurred during AI voiceover synthesis." 
    });
  }
}
