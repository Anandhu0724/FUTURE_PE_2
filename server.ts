import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

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

// Primary generation route
app.post("/api/generate-script", async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing required API configurations on host environment." });
  }
  try {
    const {
      appName,
      appCategory,
      targetAudience,
      corePainPoint,
      killerFeature,
      creatorTone = "casual", // casual, high-energy, sarcastic, deadpan, passionate
      creatorPacing = "natural", // rapid-fast, micro-pauses, relaxed
    } = req.body;

    if (!appName || !appCategory || !targetAudience || !corePainPoint || !killerFeature) {
      return res.status(400).json({ error: "Missing required script generation parameters" });
    }

    const systemInstruction = `You are a legendary Direct-to-Consumer (D2C) Copywriter, UGC Creative Director, and video conversion optimizer. 
Your specialty is writing native, hyper-authentic 9:16 vertical video ad scripts that completely avoid corporate "marketing speak" or traditional commercial tropes.
The script must sound exactly like a real smartphone video recorded in one take by everyday person sharing a life-changing realization with a friend. 
Include natural conversational filler words (honestly, literally, so yeah, basically, game-changer, I was like, etc.) and organic pauses.
Tone should be: ${creatorTone}. Pacing should be: ${creatorPacing}.

Construct the script based on this product context:
- Product Name: ${appName}
- Product Category: ${appCategory}
- Target User Persona: ${targetAudience}
- Core Pain Point: ${corePainPoint}
- Killer feature/solution: ${killerFeature}

Ensure there are three separate Hooks matching these frames:
- Hook 1: "Unpopular Opinion" or Negative Frame (e.g., Stop doing X, why Y is a scam, let's be real...)
- Hook 2: "POV / Visual Relatability" Frame (e.g., POV: you are doing X, looking at X)
- Hook 3: "Life Hack / Secret Weapon" Frame (e.g., Hidden tool, secret hack I found in 2 mins)

Ensure the master script lasts approximately 45 seconds total, composed of 5 to 7 chronologically connected scene segments.
Each scene must have:
- visualCue: Dynamic UGC-style action directions, camera movement or screenshots.
- textOverlay: 3 to 6 word native captions (white/green/yellow fonts, bold, casual casing) seen in TikTok/Reels.
- audioLine: The spoken dialogue including conversational fillers and authentic voice expressions.

Also suggest 3 urgency-driven CTAs (e.g. FOMO-driven, immediate benefit, scarcity).
Provide the output strictly in the requested JSON structure.`;

    const userPrompt = `Generate a high-converting UGC vertical script project for the app "${appName}" targeting "${targetAudience}".`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hooks: {
              type: Type.ARRAY,
              description: "Three distinct, high-impact psychological hooks for the ad",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Hook Style: 'Unpopular Opinion', 'POV Relatability', or 'Secret Weapon'" },
                  concept: { type: Type.STRING, description: "Core psychological strategy description" },
                  textOverlay: { type: Type.STRING, description: "Native style captions for the hook screen" },
                  audioLine: { type: Type.STRING, description: "Spoken line including conversational fillers" },
                  visualCue: { type: Type.STRING, description: "Creator visual instruction (action, green screen, mirrored phone, etc.)" }
                },
                required: ["type", "concept", "textOverlay", "audioLine", "visualCue"]
              }
            },
            masterScript: {
              type: Type.ARRAY,
              description: "A chronological 45-second script split into logical 5-8 second scenes",
              items: {
                type: Type.OBJECT,
                properties: {
                  segmentId: { type: Type.INTEGER },
                  segmentName: { type: Type.STRING, description: "e.g., Hook, Paint-point, Solution, Demo, Offer, CTA" },
                  duration: { type: Type.INTEGER, description: "Estimated duration in seconds (usually 5 to 8)" },
                  visualCue: { type: Type.STRING, description: "Creator framing instructions or app UI green-screen actions" },
                  textOverlay: { type: Type.STRING, description: "Native platform style overlay text" },
                  audioLine: { type: Type.STRING, description: "The spoken dialogue. Make it highly casual and conversational" }
                },
                required: ["segmentId", "segmentName", "duration", "visualCue", "textOverlay", "audioLine"]
              }
            },
            ctas: {
              type: Type.ARRAY,
              description: "Three action-driving Call to Actions",
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING, description: "scarcity, immediate-benefit, risk-reversal" },
                  phrase: { type: Type.STRING, description: "Button text suggestion (e.g., Try for Free)" },
                  spokenCta: { type: Type.STRING, description: "What the creator says out loud" },
                  textOverlay: { type: Type.STRING, description: "Exact caption on screen" }
                },
                required: ["style", "phrase", "spokenCta", "textOverlay"]
              }
            },
            creatorDirectives: {
              type: Type.OBJECT,
              properties: {
                vibeDescription: { type: Type.STRING, description: "How the actor should sound/behave on screen" },
                clothingSuggestions: { type: Type.STRING, description: "Casual casualwear, activewear, everyday outfits" },
                cameraSetup: { type: Type.STRING, description: "Framing style: casual talking head, zoom-in punch-cuts, screenshot mix" }
              },
              required: ["vibeDescription", "clothingSuggestions", "cameraSetup"]
            }
          },
          required: ["hooks", "masterScript", "ctas", "creatorDirectives"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("UGC script generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate video scripts using AI" });
  }
});

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

// Backend text-to-speech synthesis route
app.post("/api/generate-voice", async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing required API configurations on host environment." });
  }
  res.setHeader("Content-Type", "application/json");
  try {
    const { text, voiceName = "Zephyr" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        error: "Missing required speech text content",
        details: "Please provide a valid text string to generate speech audio." 
      });
    }

    // Clean up markdown markers or extra quotes that might affect speaking pronunciation
    const cleanText = text.replace(/["*#_`[\]]/g, " ").trim();

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
            prebuiltVoiceConfig: { voiceName: voiceName },
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

    res.json({
      success: true,
      audioBase64: wavBase64,
      voiceName,
    });
  } catch (err: any) {
    console.error("Text-to-speech generation failure:", err);
    res.status(500).json({ 
      error: "Voice synthesis failed", 
      details: err.message || "An unexpected error occurred during AI voiceover synthesis." 
    });
  }
});

// Configure Vite middleware in dev or static files in production
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UGC Script Backend server running on: http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.NETLIFY && !process.env.VERCEL) {
  configureApp();
}

export default app;
