import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, ChevronRight, Copy, Check, Info, BadgeAlert, HelpCircle, 
  Eye, Sparkles, Sliders, Share2, Type as TypeIcon, QrCode, Smartphone, ExternalLink,
  Volume2, RefreshCw, Music, User
} from "lucide-react";
import { Hook, ScriptSegment, UGCProject, CTA } from "../types";
import AudioWaveformVisualizer from "./AudioWaveformVisualizer";

interface ScriptTimelineProps {
  project: UGCProject;
  activeSegmentIndex: number;
  setActiveSegmentIndex: (index: number) => void;
  onReplaceHook: (newHook: Hook) => void;
  activeHookType: string;
  teleprompterSpeed: number;
  setTeleprompterSpeed: (speed: number) => void;
  onShareScript: () => string;
}

const VOICES_LIST = [
  {
    id: "Zephyr",
    name: "Zephyr",
    title: "Conversational Storyteller",
    meta: "MALE • Natural & Confident",
    bg: "border-[#FFC07F] bg-[#FFF3CD]/15",
    badgeCol: "bg-[#FD7E14] text-white",
    description: "Smooth conversational delivery with natural micro-pauses and clear, friendly narration.",
    bestFor: ["Product Demos", "App Walkthroughs", "Explanatory UGC"],
    avatar: "🧔🏽‍♂️",
    avatarBg: "bg-amber-100 border-amber-300",
    stats: { energy: 75, pace: "Moderate", clarity: "Excellent" }
  },
  {
    id: "Kore",
    name: "Kore",
    title: "The Friendly Enthusiast",
    meta: "FEMALE • Warm & Empathetic",
    bg: "border-[#FDA3B5] bg-[#FFF0F2]/15",
    badgeCol: "bg-[#E83E8C] text-white",
    description: "Welcoming and energetic vocal pitch that immediately feels like a trusted friend sharing a secret.",
    bestFor: ["Lifestyle Reviews", "Beauty & Care Demos", "Heart-to-Heart UGC"],
    avatar: "👩🏽",
    avatarBg: "bg-pink-100 border-pink-300",
    stats: { energy: 85, pace: "Bubbly/Upbeat", clarity: "Flawless" }
  },
  {
    id: "Puck",
    name: "Puck",
    title: "High-Energy Trendsetter",
    meta: "MALE • Youthful & Fast-paced",
    bg: "border-[#72C0FA] bg-[#E7F5FF]/15",
    badgeCol: "bg-[#1C7ED6] text-white",
    description: "Hyper-energetic, youth-culture pacing that works beautifully for grabbing fast Gen-Z attention spans.",
    bestFor: ["TikTok Hook Trends", "Feature Callouts", "Viral Reaction UGC"],
    avatar: "👱🏽‍♂️",
    avatarBg: "bg-blue-100 border-blue-300",
    stats: { energy: 98, pace: "Rapidfire", clarity: "Punchy" }
  },
  {
    id: "Charon",
    name: "Charon",
    title: "The Professional Anchor",
    meta: "MALE • Deep & Authoritative",
    bg: "border-[#ADB5BD] bg-[#F8F9FA]/15",
    badgeCol: "bg-[#495057] text-white",
    description: "Deep, resonant baritone that builds immediate professional authority, trust, and structural credibility.",
    bestFor: ["Finance Tools", "Productivity Apps", "Corporate B2B"],
    avatar: "👨🏻‍💼",
    avatarBg: "bg-zinc-100 border-zinc-300",
    stats: { energy: 60, pace: "Deliberate", clarity: "Prestige" }
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    title: "The Cool Catalyst",
    meta: "FEMALE • Modern & Dynamic",
    bg: "border-[#94D82D] bg-[#F4FCE3]/15",
    badgeCol: "bg-[#74B816] text-white",
    description: "Relaxed yet highly confident vocal rhythm that expresses native, effortless cool and directness.",
    bestFor: ["Fitness & Athletics", "Gaming Campaigns", "Streetwear & Fashion"],
    avatar: "👩🏼‍🎤",
    avatarBg: "bg-lime-100 border-lime-300",
    stats: { energy: 80, pace: "Rhythmic", clarity: "Crisp" }
  },
];

export default function ScriptTimeline({
  project,
  activeSegmentIndex,
  setActiveSegmentIndex,
  onReplaceHook,
  activeHookType,
  teleprompterSpeed,
  setTeleprompterSpeed,
  onShareScript,
}: ScriptTimelineProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "hooks" | "ctas" | "teleprompter">("timeline");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string>("");
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [showQRPanel, setShowQRPanel] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  // Voice Persona Synthesis States
  const [selectedVoice, setSelectedVoice] = useState<string>("Zephyr");
  const [synthesizingMode, setSynthesizingMode] = useState<"full" | "scene">("full");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizedAudio, setSynthesizedAudio] = useState<string | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // HTML5 audio state synchronization
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Rotating loading states to keep creator interested during processing
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const loadingSteps = [
    "Analyzing master script structure & semantic pacing...",
    "Instantiating chosen TTS Prebuilt Voice Persona...",
    "Calibrating conversational vocal fillers and native pause states...",
    "Synthesizing high-fidelity 24kHz audio wave output...",
    "Configuring WAV container headers for standard media players...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSynthesizing) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 1800);
    } else {
      setLoadingStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSynthesizing]);

  // Audio synchronization events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setAudioIsPlaying(true);
    const handlePause = () => setAudioIsPlaying(false);
    const handleTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const handleDurationChange = () => setAudioDuration(audio.duration || 0);
    const handleEnded = () => {
      setAudioIsPlaying(false);
      setAudioCurrentTime(0);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [synthesizedAudio]);

  const handleTogglePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioIsPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error("Audio play failed error", err));
    }
  };

  const handleAudioScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clickTime = Number(e.target.value);
    audio.currentTime = clickTime;
    setAudioCurrentTime(clickTime);
  };

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisError(null);
    setSynthesizedAudio(null);

    try {
      let ttsPayloadText = "";
      if (synthesizingMode === "full") {
        ttsPayloadText = project.masterScript.map((s) => s.audioLine).join(" ");
      } else {
        const activeSegment = project.masterScript[activeSegmentIndex];
        ttsPayloadText = activeSegment ? activeSegment.audioLine : "";
      }

      if (!ttsPayloadText.trim()) {
        throw new Error("Speech script is empty. Please generate or check your scenes first.");
      }

      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsPayloadText,
          voiceName: selectedVoice,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server returned non-JSON error page:", errorText);
        try {
          const parsed = JSON.parse(errorText);
          throw new Error(parsed.error || parsed.details || `Server responded with status ${response.status}`);
        } catch (_) {
          throw new Error(`Server responded with status ${response.status}: ${errorText.substring(0, 120)}`);
        }
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Expected JSON but received response body:", responseText);
        throw new Error(`Invalid payload format (Expected JSON, received ${contentType.slice(0, 30)})`);
      }

      const data = await response.json();
      if (!data || !data.success) {
        throw new Error(data.error || "Synthesis was unsuccessful.");
      }

      setSynthesizedAudio(`data:audio/wav;base64,${data.audioBase64}`);
    } catch (err: any) {
      console.error("Failed voice synthesizer", err);
      setSynthesisError(err.message || "Synthesis failed. Please verify secret credentials & try again.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleShareClick = () => {
    try {
      const url = onShareScript();
      setShareUrl(url);
      navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setShowQRPanel(true);
      setTimeout(() => {
        setShareSuccess(false);
      }, 2500);
    } catch (err) {
      console.error("Link share failed", err);
    }
  };

  // Teleprompter states
  const [isTeleprompterScrolling, setIsTeleprompterScrolling] = useState<boolean>(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTeleprompterScrolling) {
      const scrollStep = () => {
        if (teleprompterRef.current) {
          const container = teleprompterRef.current;
          container.scrollTop += 1.2; // Smooth pixel scrolling speed
          
          // Check if bottom reached
          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            setIsTeleprompterScrolling(false);
          }
        }
      };
      
      const intervalMs = Math.max(10, Math.floor(60000 / (teleprompterSpeed * 5))); // adaptive delay
      scrollIntervalRef.current = setInterval(scrollStep, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isTeleprompterScrolling, teleprompterSpeed]);

  const handleCopyToClipboard = (text: string, index: number, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedText(key);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedText("");
    }, 2000);
  };

  const getHookAccentColor = (type: string) => {
    if (type.toLowerCase().includes("unpopular") || type.toLowerCase().includes("negative")) return "border-red-500/30 bg-red-500/5 text-red-400";
    if (type.toLowerCase().includes("pov") || type.toLowerCase().includes("relatability")) return "border-blue-500/30 bg-blue-500/5 text-blue-400";
    return "border-emerald-500/30 bg-emerald-500/5 text-emerald-400";
  };

  const totalDuration = project.masterScript.reduce((accum, seg) => accum + seg.duration, 0);

  return (
    <div id="timeline-workstation" className="flex flex-col gap-4 bg-white border border-black/15 rounded-none p-5 sm:p-6 shadow-sm w-full">
      
      {/* HEADER CONTROLS SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4 select-none">
        <div>
          <h3 className="text-xl font-serif text-[#1A1A1A] tracking-tight">Campaign Screenplay & Angles</h3>
          <p className="text-xs font-sans text-zinc-600 mt-0.5">
            Total Script Duration: <span className="font-mono text-black font-bold">{totalDuration}s</span> (Optimal 9:16 target)
          </p>
        </div>

        {/* WORK BENCH SELECTION TAB PILLS & ACTION TOOlS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start sm:self-auto">
          <div className="flex bg-[#F1EFEC] p-1 rounded-none border border-black/10">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-none text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                activeTab === "timeline"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              📽️ Timeline
            </button>
            <button
              onClick={() => setActiveTab("hooks")}
              className={`px-3 py-1.5 rounded-none text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                activeTab === "hooks"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              🪝 Psychological Angles
            </button>
            <button
              onClick={() => setActiveTab("ctas")}
              className={`px-3 py-1.5 rounded-none text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                activeTab === "ctas"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              📣 High-Urgency CTAs
            </button>
            <button
              onClick={() => setActiveTab("teleprompter")}
              className={`px-3 py-1.5 rounded-none text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                activeTab === "teleprompter"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              📋 Teleprompter
            </button>
          </div>

          <button
            id="share-script-button"
            onClick={handleShareClick}
            type="button"
            className={`px-3.5 py-2 text-[10px] tracking-wider uppercase font-extrabold rounded-none border flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer h-[34px] ${
              shareSuccess
                ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                : "bg-white hover:bg-[#F1EFEC] text-black border-black/15 active:scale-95"
            }`}
            title="Generate a unique collaboration link for this campaign config"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE COLLABORATION & QR CODE TELEPROMPTER PANEL */}
      {showQRPanel && shareUrl && (
        <div className="bg-[#FAF9F6] border-2 border-black/85 p-4 sm:p-5 rounded-none flex flex-col md:flex-row gap-5 items-stretch text-left animate-fade-in relative shadow-sm">
          <button
            onClick={() => setShowQRPanel(false)}
            className="absolute top-4 right-4 text-xs font-sans text-zinc-500 hover:text-black font-extrabold uppercase tracking-wider cursor-pointer"
            title="Dismiss mobile companion panel"
          >
            ✕ Dismiss
          </button>

          {/* LEFT COLUMN: QR CODE GRAPHIC */}
          <div className="flex flex-col items-center justify-center bg-white border border-black/10 p-4 shrink-0 min-w-[200px] select-none">
            <div className="relative border-4 border-black p-2 bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`}
                alt="Campaign Share QR Code"
                referrerPolicy="no-referrer"
                className="w-[185px] h-[185px] object-contain block"
              />
              <div className="absolute -bottom-2 -right-2 bg-black text-white p-1 rounded-none border border-white">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 text-[10px] font-sans font-extrabold uppercase tracking-wider text-black hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Full Size Vector Image</span>
            </a>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE HUD GUIDE & SPEED CONTROLS */}
          <div className="flex-1 flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-black" />
                <span className="text-[10px] text-zinc-500 font-sans tracking-[0.2em] font-bold uppercase">
                  Mobile Teleprompter Direct Sync
                </span>
              </div>
              
              <h4 className="text-sm font-serif font-bold text-black leading-tight">
                Instantly scan script onto your mobile filming device
              </h4>
              <p className="text-xs text-zinc-650 mt-1.5 leading-relaxed">
                Aim your phone camera at this QR code. It packages your current Campaign Brief, chosen Hook: <strong className="text-red-650 font-bold">"{activeHookType}"</strong>, pacing instructions, and master teleprompter script to stream directly on your mobile screen glass during recording.
              </p>

              {/* ACTIONABLE ADVICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="bg-white border border-black/5 p-3 rounded-none">
                  <span className="block font-bold text-[9px] text-zinc-800 uppercase tracking-wider">
                    🤳 Step 1: Eye Contact Guard
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                    Prop your phone directly below your camera lens so you appear to maintain look straight at the audience whilst reading.
                  </p>
                </div>
                <div className="bg-white border border-black/5 p-3 rounded-none">
                  <span className="block font-bold text-[9px] text-zinc-800 uppercase tracking-wider">
                    ⚡ Step 2: Adaptive Speed Autoplay
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                    The mobile teleprompter automatically processes dynamic lines scrolling symmetrically at your curated speed of {teleprompterSpeed} WPM.
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE SHARE LINK REFERENCE */}
            <div className="mt-4 pt-3 border-t border-black/5 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 bg-[#F1EFEC] px-3 py-2 rounded-none border border-black/5 flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-[10px] font-mono text-zinc-500 overflow-ellipsis whitespace-nowrap overflow-hidden pr-3">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    const el = document.getElementById("qr-copy-btn");
                    if (el) {
                      el.innerText = "COPIED!";
                      setTimeout(() => { if (el) el.innerText = "COPY"; }, 1500);
                    }
                  }}
                  id="qr-copy-btn"
                  className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#1A1A1A] hover:underline cursor-pointer select-none"
                >
                  COPY
                </button>
              </div>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-black hover:bg-black/95 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-none shrink-0 text-center flex items-center justify-center gap-1 transition-all"
              >
                <span>Launch Mobile Web App</span>
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENTS */}
      <div className="flex-1">
        
        {/* TAB 1: MASTER SCRIPT TIMELINE */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-3.5 select-none animate-fade-in">
            <div className="bg-[#FAF9F6] p-3 rounded-none border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-650 font-sans">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-zinc-500" /> Tap any scene to edit details or preview in Phone Simulator
              </span>
              <span className="font-bold text-red-650 uppercase tracking-widest text-[9px] bg-white border border-black/5 px-2 py-0.5">
                🔥 Active Hook: {activeHookType || "Unpopular Opinion"}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* SCRIPT LIST - 8 columns */}
              <div className="xl:col-span-8 flex flex-col gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                {project.masterScript.map((segment, index) => (
                  <div
                    key={segment.segmentId}
                    onClick={() => setActiveSegmentIndex(index)}
                    className={`border text-left p-4 rounded-none transition-all duration-250 cursor-pointer ${
                      index === activeSegmentIndex
                        ? "bg-[#F1EFEC] border-black text-[#1A1A1A] shadow-xs"
                        : "bg-white border-black/10 hover:border-black/20 text-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3.5 border-b border-black/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-none bg-black text-white font-mono text-xs flex items-center justify-center font-bold">
                          {segment.segmentId}
                        </span>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest font-sans text-[#1A1A1A]/80">
                          Scene: {segment.segmentName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-zinc-600 bg-[#FAF9F6] px-2 py-0.5 rounded-none border border-black/10">
                          ⏱️ {segment.duration}s
                        </span>
                        <span className="text-[9px] font-mono text-[#1A1A1A] bg-[#FAF9F6] px-2 py-0.5 rounded-none border border-black/10 font-bold">
                          {Math.round((segment.duration / totalDuration) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* SLICE DETAILS Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                      
                      {/* Visual Cue Card */}
                      <div className="bg-[#FAF9F6] p-3 border border-black/5 rounded-none font-sans relative">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold mb-1">
                          🎥 Visual / Camera action Cue
                        </span>
                        <p className="text-zinc-700 font-sans leading-relaxed text-[11px] select-text">
                          {segment.visualCue}
                        </p>
                      </div>

                      {/* Text Overlay (Native Captions) Card */}
                      <div className="bg-[#FAF9F6] p-3 border border-black/5 rounded-none font-sans relative flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/60 block font-bold mb-1.5 flex items-center justify-between">
                            <span>📱 On-Screen Caption overlay</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(segment.textOverlay, index, "text");
                              }}
                              className="text-zinc-500 hover:text-black transition-colors cursor-pointer"
                            >
                              {copiedIndex === index && copiedText === "text" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </span>
                          <p className="bg-[#FEE21E] text-black font-serif tracking-tight font-extrabold text-xs inline-block uppercase italic px-2 py-0.5 border border-black/5 select-text">
                            "{segment.textOverlay}"
                          </p>
                        </div>
                      </div>

                      {/* Audio Line Card */}
                      <div className="bg-[#FAF9F6] p-3 border border-black/5 rounded-none font-sans relative col-span-1 md:col-span-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold mb-1 flex items-center justify-between">
                            <span>🗣️ Spoken Monologue (talking-head)</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(segment.audioLine, index, "audio");
                              }}
                              className="text-zinc-500 hover:text-black transition-colors cursor-pointer"
                            >
                              {copiedIndex === index && copiedText === "audio" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </span>
                          <p className="text-[#1A1A1A] font-serif italic leading-relaxed text-[12px] select-text font-light">
                            "{segment.audioLine}"
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* SIDE-CAR PREVIEW COMPANION CARD & QUICK GEN TRIGGER - 4 columns */}
              <div className="xl:col-span-4 bg-white border-2 border-black p-4 flex flex-col gap-4 text-left font-sans shadow-xs">
                {/* Header */}
                <div className="border-b border-black/10 pb-3">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-[#8B0000] font-sans font-extrabold px-1.5 py-0.5 bg-[#8B0000]/5 border border-[#8B0000]/10 inline-block mb-1">
                    🎙️ AI Voice Workspace
                  </span>
                  <h4 className="text-sm font-serif font-extrabold text-[#1A1A1A] leading-tight">
                    Voiceover Sandbox
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                    Audition customized vocal presets styled for vertical direct-response campaigns.
                  </p>
                </div>

                {/* Scope selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-wider">Scope:</span>
                  <div className="flex items-center bg-[#F1EFEC] p-0.5 rounded-none border border-black/5 flex-1">
                    <button
                      type="button"
                      onClick={() => setSynthesizingMode("full")}
                      className={`flex-1 text-center py-1 rounded-none text-[8.5px] uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
                        synthesizingMode === "full"
                          ? "bg-black text-white"
                          : "text-zinc-500 hover:text-black hover:bg-black/5"
                      }`}
                    >
                      📜 Full
                    </button>
                    <button
                      type="button"
                      onClick={() => setSynthesizingMode("scene")}
                      className={`flex-1 text-center py-1 rounded-none text-[8.5px] uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
                        synthesizingMode === "scene"
                          ? "bg-black text-white"
                          : "text-zinc-500 hover:text-black hover:bg-black/5"
                      }`}
                    >
                      🎬 Scene
                    </button>
                  </div>
                </div>

                {/* Dropdown voice select */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="side-voice-select" className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wide">
                    👤 Choose Ad Voice Persona
                  </label>
                  <div className="relative">
                    <select
                      id="side-voice-select"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-2 font-sans font-bold text-xs text-[#1A1A1A] appearance-none focus:outline-hidden cursor-pointer pr-7 tracking-wider uppercase"
                    >
                      {VOICES_LIST.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.title})</option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black font-extrabold text-[9px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Synthesis Trigger Button */}
                <button
                  type="button"
                  onClick={handleVoiceSynthesis}
                  disabled={isSynthesizing}
                  className={`w-full py-2.5 px-3 rounded-none font-sans font-extrabold text-[10px] tracking-[0.1em] uppercase border-2 flex items-center justify-center gap-1.5 duration-100 transition-all select-none shadow-sm cursor-pointer ${
                    isSynthesizing
                      ? "bg-[#F1EFEC] border-black/10 text-zinc-400 cursor-wait"
                      : "bg-black border-black text-white hover:bg-black/95 active:scale-99"
                  }`}
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                      <span>GENERATING...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Generate AI Voice</span>
                    </>
                  )}
                </button>

                {/* Synthesis steps container */}
                {isSynthesizing && (
                  <div className="bg-[#FAF9F6] border border-black/10 p-2.5 rounded-none animate-pulse">
                    <p className="text-[8px] font-extrabold uppercase tracking-wider text-red-650 italic">
                      Step {loadingStepIndex + 1}/{loadingSteps.length}:
                    </p>
                    <p className="text-[10px] text-zinc-700 font-serif italic mt-0.5 max-h-[32px] overflow-hidden leading-snug">
                      "{loadingSteps[loadingStepIndex]}"
                    </p>
                  </div>
                )}

                {/* Synthesized Output Preview Widget */}
                {synthesizedAudio ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-none flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Track Loaded
                      </span>
                      <span className="text-[8.5px] font-mono text-zinc-500">
                        {selectedVoice} Preset
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePlayAudio}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-black text-white border border-black hover:bg-black/90 active:scale-95 transition-all text-xs"
                      >
                        {audioIsPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                      
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="text-[9px] font-mono font-bold text-zinc-500">
                          {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={audioDuration || 100}
                          value={audioCurrentTime}
                          onChange={handleAudioScrubberChange}
                          className="w-full h-1 bg-zinc-200 rounded-none appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  !isSynthesizing && (
                    <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-none text-zinc-400 text-[9.5px] italic leading-tight text-center font-serif">
                      No vocal tracks synthesized yet.
                    </div>
                  )
                )}

                {/* Avatar / Character Preview Card showing selected persona's delivery style */}
                {(() => {
                  const currentVoice = VOICES_LIST.find((v) => v.id === selectedVoice) || VOICES_LIST[0];
                  return (
                    <div className={`mt-0.5 border-2 p-3.5 rounded-none ${currentVoice.bg} transition-all duration-300 relative flex flex-col gap-2`}>
                      {/* Avatar Profile Header */}
                      <div className="flex items-center gap-2.5 border-b border-black/5 pb-2">
                        <div className={`w-11 h-11 shrink-0 rounded-none border-2 flex items-center justify-center text-2xl ${currentVoice.avatarBg}`}>
                          {currentVoice.avatar}
                        </div>
                        <div>
                          <span className="text-[8px] font-sans font-extrabold text-zinc-500 uppercase tracking-wider block">
                            Avatar Persona Profile
                          </span>
                          <h5 className="font-serif font-extrabold text-sm text-black leading-none mt-0.5">
                            {currentVoice.name}
                          </h5>
                          <p className="text-[9.5px] text-zinc-650 font-sans tracking-wide mt-0.5 font-medium leading-none">
                            {currentVoice.title}
                          </p>
                        </div>
                      </div>

                      {/* Delivery style properties */}
                      <div className="text-[10px] leading-relaxed text-zinc-750">
                        <p className="font-serif italic font-medium">
                          "{currentVoice.description}"
                        </p>
                      </div>

                      {/* Performance style meters */}
                      <div className="flex flex-col gap-1 bg-white/60 p-2 border border-black/5">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-zinc-600 uppercase">
                          <span>Energy Intensity</span>
                          <span>{currentVoice.stats.energy}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1 rounded-none overflow-hidden relative">
                          <div 
                            className="h-full bg-black rounded-none absolute transition-all duration-300"
                            style={{ width: `${currentVoice.stats.energy}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-extrabold text-[#1A1A1A] uppercase mt-1">
                          <span>Speaking Pace</span>
                          <span className="font-bold text-[8px] bg-black text-white px-1 rounded-none">{currentVoice.stats.pace}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-[#1A1A1A] uppercase">
                          <span>Tone Match</span>
                          <span className="font-bold text-[8px] text-zinc-650">{currentVoice.stats.clarity}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALTERNATE HOOK ANGLE MODULE */}
        {activeTab === "hooks" && (
          <div className="flex flex-col gap-4 animate-fade-in select-none">
            <div className="bg-[#F1EFEC] p-4 rounded-none border border-black/10 font-sans">
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-red-650" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">Direct Response Media Secrets</h4>
              </div>
              <p className="text-xs text-zinc-750 leading-relaxed mt-2 select-text italic">
                Professional content creators never shoot just one script variation. They film **one unified body** but record **three dynamic hook angles** (first 10 seconds of video footage). Select an alternative frame below to automatically inject it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.hooks.map((hook, index) => {
                const isActive = activeHookType.toLowerCase() === hook.type.toLowerCase();
                return (
                  <div
                    key={index}
                    className={`border rounded-none p-4 flex flex-col justify-between gap-4 transition-all duration-300 ${
                      isActive
                        ? "bg-[#FAF9F6] border-black shadow-xs scale-[1.01]"
                        : "bg-white border-black/10 hover:border-black/30"
                    }`}
                  >
                    <div className="flex flex-col gap-2 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-none border border-black text-black bg-[#F1EFEC]">
                          {hook.type}
                        </span>
                        {isActive && (
                          <span className="text-[9px] bg-black text-white font-bold px-1.5 py-0.5 rounded-none flex items-center gap-0.5 tracking-wider uppercase">
                            <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> Loaded
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-serif font-bold text-[#1A1A1A] leading-tight mt-1">
                        {hook.concept}
                      </p>

                      <hr className="border-black/5 mt-1" />

                      <div className="flex flex-col gap-2.5 text-[11px] select-text mt-1">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold">🎬 Creator Action</span>
                          <span className="text-zinc-700 italic">"{hook.visualCue}"</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold">📱 Text Overlay overlay</span>
                          <span className="bg-[#FEE21E] text-black font-serif italic uppercase font-extrabold px-1 text-[10px]">
                            "{hook.textOverlay}"
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-bold">🗣️ Spoken Monologue</span>
                          <span className="text-[#1A1A1A] font-serif italic text-xs block mt-0.5">"{hook.audioLine}"</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onReplaceHook(hook)}
                      className={`w-full py-2 px-3 rounded-none font-bold text-[10px] tracking-wider uppercase font-sans select-none transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive
                          ? "bg-[#FAF9F6] border border-black/10 text-zinc-400 cursor-not-allowed"
                          : "bg-black hover:bg-black/95 text-white shadow-xs"
                      }`}
                      disabled={isActive}
                    >
                      🔁 Apply Alternate Hook
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: HIGH-CONVERTING CTAS & DIRECTIVES */}
        {activeTab === "ctas" && (
          <div className="flex flex-col gap-4 animate-fade-in select-none">
            
            <div className="bg-[#F1EFEC] p-4 border border-black/10 rounded-none flex flex-col md:flex-row gap-5 items-start justify-between font-sans">
              <div className="flex flex-col gap-1.5 flex-1 select-text">
                <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-none uppercase tracking-[0.2em] font-sans font-extrabold self-start">
                  Director Brief
                </span>
                <p className="text-xs text-[#1A1A1A] font-serif italic mt-1 leading-relaxed">
                  General creator staging guidelines to instruct the physical models/actors on attire, perspective, and device setup:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="bg-white p-3 rounded-none border border-black/10">
                    <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold">💄 Outfit Choice</span>
                    <p className="text-[#1A1A1A] text-xs mt-0.5">{project.creatorDirectives.clothingSuggestions}</p>
                  </div>
                  <div className="bg-white p-3 rounded-none border border-black/10">
                    <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold">📐 Cam Setup & Environment</span>
                    <p className="text-[#1A1A1A] text-xs mt-0.5">{project.creatorDirectives.cameraSetup}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE HIGH CONVERTING CTAS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.ctas.map((cta, index) => (
                <div
                  key={index}
                  className="bg-white border border-black/10 rounded-none p-4 flex flex-col justify-between gap-3 relative group"
                >
                  <div className="flex flex-col gap-1 select-text font-sans">
                    <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/60 font-black block">
                      Angle: {cta.style || "Standard Conversion"}
                    </span>
                    <h5 className="text-xs font-bold text-black font-sans uppercase tracking-tight mt-1 border-b border-black/5 pb-1">
                      Button label: "{cta.phrase}"
                    </h5>
                    
                    <div className="flex flex-col gap-2.5 mt-2">
                      <div>
                        <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold">🗣️ Spoken CTA Voiceover</span>
                        <p className="text-[#1A1A1A] font-serif italic text-xs leading-relaxed">"{cta.spokenCta}"</p>
                      </div>
                      <div>
                        <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold">📱 Caption Overlay</span>
                        <p className="bg-[#FEE21E] text-black font-serif font-extrabold italic uppercase text-[10px] px-2 py-0.5 border border-black/5 inline-block mt-1">
                          "{cta.textOverlay}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(cta.spokenCta, index, "cta")}
                    className="w-full py-2 bg-[#F1EFEC] hover:bg-black hover:text-white text-black rounded-none transition-all cursor-pointer font-sans font-extrabold text-[10px] tracking-wider uppercase border border-black/10 flex items-center justify-center gap-1.5"
                  >
                    {copiedIndex === index && copiedText === "cta" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> CTA Monologue Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Spoken CTA
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: IMMERSIVE ACTION-ORIENTED TELEPROMPTER READER */}
        {activeTab === "teleprompter" && (
          <div className="flex flex-col gap-3.5 select-none animate-fade-in">
            <div className="bg-[#FAF9F6] p-3 rounded-none border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-650 font-sans">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-black" /> Hold phone and read aloud. Configure scroll speed!
              </span>
              
              {/* Teleprompter speed & scroller buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                  <span>Speed:</span>
                  <input
                    type="range"
                    min="90"
                    max="220"
                    value={teleprompterSpeed}
                    onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                    className="w-24 h-1 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                  />
                  <span className="font-mono text-black text-[10px] w-12">{teleprompterSpeed} WPM</span>
                </div>

                <button
                  onClick={() => setIsTeleprompterScrolling(!isTeleprompterScrolling)}
                  className={`py-1.5 px-3 rounded-none font-sans font-bold text-[10px] tracking-widest uppercase select-none transition-all cursor-pointer ${
                    isTeleprompterScrolling
                      ? "bg-red-650 hover:bg-red-700 text-white"
                      : "bg-black hover:bg-black/90 text-white"
                  }`}
                >
                  {isTeleprompterScrolling ? "🛑 Stop Scroller" : "🚀 Start Scroll"}
                </button>
              </div>
            </div>

            {/* Immersive Teleprompter Frame */}
            <div 
              ref={teleprompterRef}
              className="bg-[#FAF9F6] border border-black/15 rounded-none h-[330px] overflow-y-auto p-6 relative flex flex-col gap-8 scroll-smooth"
            >
              {/* Focus Line Guide Overlay */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-14 bg-black/5 border-y border-black/10 pointer-events-none flex items-center justify-between px-4">
                <span className="text-[8px] font-sans font-bold text-black/35 uppercase tracking-widest">FOCUS LINE</span>
                <span className="text-[8px] font-sans font-bold text-black/35 uppercase tracking-widest">FOCUS LINE</span>
              </div>

              {/* Padded Spacer at Top/Bottom to allow scrolling past */}
              <div className="h-28 flex-shrink-0"></div>

              {project.masterScript.map((segment, index) => (
                <div 
                  key={segment.segmentId}
                  className={`flex flex-col gap-2 relative z-10 transition-all duration-300 ${
                    index === activeSegmentIndex ? "opacity-100 scale-101" : "opacity-30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-widest font-sans font-bold bg-[#F1EFEC] text-black px-2 py-0.5 rounded-none border border-black/10">
                      SCENE {segment.segmentId}: {segment.segmentName}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">⏱️ {segment.duration}s</span>
                  </div>
                  
                  {/* HUGE COPY DIALOGUE LINE */}
                  <p className="text-[#1A1A1A] text-lg sm:text-xl font-serif italic font-medium leading-relaxed select-text">
                    "{segment.audioLine}"
                  </p>

                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider text-zinc-500 bg-white border border-black/5 px-2.5 py-1 rounded-none inline-block self-start">
                    🎬 Action cue: <span className="text-zinc-700 italic lowercase font-normal">"{segment.visualCue}"</span>
                  </div>
                </div>
              ))}

              <div className="h-28 flex-shrink-0"></div>
            </div>
          </div>
        )}

      </div>

      {/* DIRECT RESPONSE AD AI VOICEOVER SYNTHESIZER STATION */}
      <div className="mt-6 pt-6 border-t border-black/15 select-none font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-red-650 font-sans font-bold flex items-center gap-1.5 mb-1 bg-[#8B0000]/5 px-2 py-0.5 border border-[#8B0000]/10 inline-block">
              🎙️ Pro UGC Audio Synthesis Engine
            </span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A] tracking-tight">
              Direct-Response Voiceover Workstation
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 font-sans leading-tight">
              Compile your written vertical video script lines into real vocal files using premium Gemini voicing.
            </p>
          </div>

          {/* AUDIO CONTROLS & SCOPE PANEL */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#F1EFEC] text-black border border-black/10 p-0.5 rounded-none">
              <button
                type="button"
                onClick={() => setSynthesizingMode("full")}
                className={`px-3 py-1.5 rounded-none text-[9px] uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
                  synthesizingMode === "full"
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-650 hover:text-black hover:bg-black/5"
                }`}
              >
                📜 Full Script
              </button>
              <button
                type="button"
                onClick={() => setSynthesizingMode("scene")}
                className={`px-3 py-1.5 rounded-none text-[9px] uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
                  synthesizingMode === "scene"
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-650 hover:text-black hover:bg-black/5"
                }`}
              >
                🎬 Active Scene Only
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLS SELECTION ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* CONTROL SWITCH PANEL - 5 cols */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-[#FAF9F6] border border-black/10 p-4 sm:p-5 rounded-none">
            
            {/* PERSONA DROPDOWN MENU */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="voice-persona-select" className="block text-[10px] text-zinc-500 font-sans tracking-wide font-extrabold uppercase select-text">
                👤 Choose Ad Voice Persona
              </label>
              <div className="relative">
                <select
                  id="voice-persona-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3.5 py-2.5 font-sans font-bold text-xs text-[#1A1A1A] items-center appearance-none focus:outline-hidden focus:ring-1 focus:ring-black cursor-pointer pr-8 tracking-wider uppercase"
                >
                  <option value="Zephyr">Zephyr (Conversational Storyteller)</option>
                  <option value="Kore">Kore (The Friendly Enthusiast)</option>
                  <option value="Puck">Puck (High-Energy Trendsetter)</option>
                  <option value="Charon">Charon (The Professional Anchor)</option>
                  <option value="Fenrir">Fenrir (The Cool Catalyst)</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-black font-extrabold text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* SYNTHESIZE BUTTON */}
            <div>
              <button
                type="button"
                onClick={handleVoiceSynthesis}
                disabled={isSynthesizing}
                id="generate-voice-btn"
                className={`w-full py-3.5 px-4 rounded-none font-sans font-extrabold text-[10px] tracking-[0.15em] uppercase border-2 flex items-center justify-center gap-2 duration-150 transition-all select-none shadow-sm cursor-pointer ${
                  isSynthesizing
                    ? "bg-[#F1EFEC] border-black/15 text-zinc-400 cursor-wait"
                    : "bg-black border-black text-white hover:bg-black/92 active:scale-99"
                }`}
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <Music className="w-3.5 h-3.5 text-white" />
                    <span>Generate AI Voice Track</span>
                  </>
                )}
              </button>
            </div>

            {/* SYNTHESIS ERROR DIALOGUE */}
            {synthesisError && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-600 p-3 rounded-none text-left text-[11px] leading-relaxed select-text font-serif">
                ⚠️ <strong className="font-sans font-extrabold uppercase text-[9px] tracking-wider block mb-0.5">Synthesis Interrupted:</strong>
                {synthesisError}
              </div>
            )}
          </div>

          {/* DYNAMIC VOICE PERSONA CARD - 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-between items-stretch">
            {/* Get matching persona config */}
            {(() => {
              const currentVoice = VOICES_LIST.find((v) => v.id === selectedVoice) || VOICES_LIST[0];

              return (
                <div className={`p-4 sm:p-5 border-2 rounded-none ${currentVoice.bg} flex-1 flex flex-col justify-between gap-4 animate-fade-in text-left`}>
                  
                  {/* Persona Identity Block */}
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2.5">
                      <div>
                        <span className={`text-[8px] font-sans font-extrabold uppercase px-2 py-0.5 tracking-wider rounded-none inline-block ${currentVoice.badgeCol}`}>
                          {currentVoice.meta}
                        </span>
                        <h4 className="text-base font-serif font-extrabold text-[#1A1A1A] leading-tight mt-1.5 flex items-center gap-1.5">
                          <span>{currentVoice.name}</span>
                          <span className="text-xs text-zinc-500 font-sans font-normal tracking-wide">
                            — {currentVoice.title}
                          </span>
                        </h4>
                      </div>

                      <div className="p-2.5 bg-white border border-black/10 rounded-none shrink-0 text-black">
                        <User className="w-5 h-5" />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 italic leading-relaxed font-medium mt-3 font-serif">
                      "{currentVoice.description}"
                    </p>
                  </div>

                  {/* Persona Niches Tags */}
                  <div>
                    <span className="text-[8px] font-sans font-extrabold text-zinc-500 uppercase tracking-widest block mb-1.5">
                      ⭐ RECOMMENDED UGC CAMPAIGN STYLES:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentVoice.bestFor.map((n, i) => (
                        <span key={i} className="text-[9px] bg-white border border-black/10 px-2 py-1 text-black font-sans font-semibold uppercase tracking-wide">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>

        </div>

        {/* ACOUSTIC SCENE WAVEFORM VISUALIZER TIMELINE */}
        <AudioWaveformVisualizer
          segments={project.masterScript}
          activeSegmentIndex={activeSegmentIndex}
          setActiveSegmentIndex={setActiveSegmentIndex}
          selectedVoice={selectedVoice}
          synthesizedAudio={synthesizedAudio}
          audioIsPlaying={audioIsPlaying}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          onSeek={(seconds) => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = seconds;
              setAudioCurrentTime(seconds);
            }
          }}
        />

        {/* VISUAL LOADING STATE & SPEECH CAPTURE STEPS */}
        {isSynthesizing && (
          <div className="mt-4 bg-[#FAF9F6] border border-black/10 p-4 rounded-none text-left flex items-center gap-4 animate-pulse">
            <div className="p-3 bg-black text-[#FEE21E] rounded-none shrink-0 font-bold">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="flex-1 font-sans">
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">
                AI Voice Synthesis Pipeline Active (Gemini TTS Mode)
              </p>
              <h5 className="text-xs font-serif font-extrabold text-black mt-0.5 leading-tight italic">
                "{loadingSteps[loadingStepIndex]}"
              </h5>
              
              {/* Animated Mini Progress Bar */}
              <div className="w-full bg-[#F1EFEC] h-1.5 rounded-none overflow-hidden mt-2.5 border border-black/5 relative">
                <div 
                  className="h-full bg-black rounded-none absolute transition-all duration-700" 
                  style={{ width: `${Math.min(((loadingStepIndex + 1) / loadingSteps.length) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* HIGH-FIDELITY EMBEDDED HTML5 CUSTOM AUDIO PLAYER */}
        <div className="mt-5 bg-[#FAF9F6] border-2 border-black p-4 sm:p-5 rounded-none flex flex-col md:flex-row items-center gap-4 text-left relative overflow-hidden">
          
          <audio ref={audioRef} src={synthesizedAudio || undefined} />

          {/* WAVEFORM PLAYBACK DECORATION CONTAINER */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            
            {/* Play Pause Button */}
            <button
              onClick={handleTogglePlayAudio}
              disabled={!synthesizedAudio}
              type="button"
              className={`w-12 h-12 flex items-center justify-center rounded-none font-sans font-bold transition-all border-2 duration-150 ${
                !synthesizedAudio
                  ? "bg-white border-zinc-200 text-zinc-300 cursor-not-allowed"
                  : "bg-black hover:bg-black/94 text-white border-black cursor-pointer shadow-xs active:scale-95"
              }`}
              title={synthesizedAudio ? "Play / Pause voiceover track" : "Please generate track first"}
            >
              {audioIsPlaying ? (
                <Pause className="w-5 h-5 text-white fill-current" />
              ) : (
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              )}
            </button>

            {/* Custom Visual Equalizer Wave */}
            <div className="flex items-end gap-1 px-3 h-10 select-none" title="Audio Spectrum">
              {[8, 14, 22, 11, 28, 16, 25, 9, 20, 13, 27, 7].map((height, i) => {
                const isPlayingNode = audioIsPlaying;
                return (
                  <div
                    key={i}
                    className="w-1.5 bg-black rounded-none transition-all duration-350"
                    style={{
                      height: isPlayingNode 
                        ? `${Math.max(4, Math.floor(Math.random() * 32) + 6)}px`
                        : "4px",
                      opacity: synthesizedAudio ? 1 : 0.15,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* INNER AUDIO PLAYBACK SCROLLER BAR & SOUND TRACK INFO */}
          <div className="flex-1 w-full font-sans flex flex-col justify-center gap-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              
              <div>
                <span className="font-extrabold uppercase text-[9px] tracking-wider text-black flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${synthesizedAudio ? "bg-emerald-650 animate-pulse" : "bg-zinc-400"}`}></span>
                  {synthesizedAudio ? (
                    <span>ACTIVE TRACK DETECTED ({selectedVoice} Preset)</span>
                  ) : (
                    <span>NO AI VOICEOVER GENERATED YET</span>
                  )}
                </span>
                <p className="text-[11px] text-zinc-500 font-serif italic max-w-[400px] truncate mt-0.5">
                  {synthesizedAudio
                    ? `Synthesized ${synthesizingMode === "full" ? "Total master screenplay" : "Active Scene segment"}`
                    : "Configure a voice persona and click the synthesize button to generate high performance vocal tracks."
                  }
                </p>
              </div>

              {/* Time displays */}
              <div className="text-[10px] font-mono text-zinc-500 font-bold bg-white border border-black/10 px-2 py-0.5 rounded-none select-text">
                {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
              </div>
            </div>

            {/* Range Scroller Tracker */}
            <div className="w-full flex items-center pr-1">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                value={audioCurrentTime}
                onChange={handleAudioScrubberChange}
                disabled={!synthesizedAudio}
                className="w-full h-1 bg-zinc-200 rounded-none appearance-none cursor-pointer accent-black disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* DOWNLOADING SOUND FILE */}
          {synthesizedAudio && (
            <a
              href={synthesizedAudio}
              download={`ugc-ad-voiceover-${selectedVoice.toLowerCase()}-${synthesizingMode}.wav`}
              className="px-4 py-2.5 bg-white hover:bg-[#F1EFEC] text-[#1A1A1A] font-sans font-bold text-[9px] uppercase tracking-wider rounded-none shrink-0 transition-all text-center cursor-pointer flex items-center gap-1 border-2 border-black"
              title="Download standard high-fidelity audio track locally"
            >
              <span>📥 Download WAV</span>
            </a>
          )}

        </div>
      </div>

    </div>
  );
}
