import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge",
};

function createWavHeaderAndAppendPCM(pcmUint8: Uint8Array, sampleRate: number = 24000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const subchunk2Size = pcmUint8.length;
  const chunkSize = 36 + subchunk2Size;

  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);

  // ChunkID: "RIFF"
  header[0] = 0x52; // R
  header[1] = 0x49; // I
  header[2] = 0x46; // F
  header[3] = 0x46; // F

  // ChunkSize
  view.setUint32(4, chunkSize, true);

  // Format: "WAVE"
  header[8] = 0x57;  // W
  header[9] = 0x41;  // A
  header[10] = 0x56; // V
  header[11] = 0x45; // E

  // Subchunk1ID: "fmt "
  header[12] = 0x66; // f
  header[13] = 0x6d; // m
  header[14] = 0x74; // t
  header[15] = 0x20; //  

  // Subchunk1Size: 16
  view.setUint32(16, 16, true);

  // AudioFormat: 1 (PCM)
  view.setUint16(20, 1, true);

  // NumChannels: 1 (mono)
  view.setUint16(22, numChannels, true);

  // SampleRate
  view.setUint32(24, sampleRate, true);

  // ByteRate
  view.setUint32(28, byteRate, true);

  // BlockAlign
  view.setUint16(32, blockAlign, true);

  // BitsPerSample: 16
  view.setUint16(34, bitsPerSample, true);

  // Subchunk2ID: "data"
  header[36] = 0x64; // d
  header[37] = 0x61; // a
  header[38] = 0x74; // t
  header[39] = 0x61; // a

  // Subchunk2Size
  view.setUint32(40, subchunk2Size, true);

  const wavBytes = new Uint8Array(44 + subchunk2Size);
  wavBytes.set(header, 0);
  wavBytes.set(pcmUint8, 44);

  return wavBytes;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Configuration Error",
        details: "GEMINI_API_KEY is not defined in the hosting environment variables.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { text, voiceName = "Zephyr" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({
          error: "Missing required speech text content",
          details: "Please provide a valid text string to generate speech audio.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanText = text.replace(/["*#_`[\]]/g, " ").trim();

    if (!cleanText) {
      return new Response(
        JSON.stringify({
          error: "Invalid speech text content",
          details: "The text input did not contain any voiceable alphabetic character content.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return new Response(
        JSON.stringify({
          error: "Failed to synthesize speech",
          details: "No audio data was returned by the underlying generative voice model.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decode base64 to Uint8Array
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const pcmUint8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pcmUint8[i] = binaryString.charCodeAt(i);
    }

    // Wrap in WAV
    const wavBytes = createWavHeaderAndAppendPCM(pcmUint8, 24000);

    // Encode WAV bytes back to base64
    let binary = "";
    const wavLen = wavBytes.length;
    const chunk = 0xffff;
    for (let i = 0; i < wavLen; i += chunk) {
      const slice = wavBytes.subarray(i, i + chunk);
      binary += String.fromCharCode.apply(null, slice as any);
    }
    const wavBase64 = btoa(binary);

    return new Response(
      JSON.stringify({
        success: true,
        audioData: wavBase64,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Text-to-speech generation failure:", err);
    return new Response(
      JSON.stringify({
        error: "Voice synthesis failed",
        details: err.message || "An unexpected error occurred during AI voiceover synthesis.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
