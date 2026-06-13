import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, Heart, MessageCircle, Share2, Sparkles, UserCheck } from "lucide-react";
import { ScriptSegment, UGCProject } from "../types";

interface PhoneEmulatorProps {
  project: UGCProject;
  activeSegmentIndex: number;
  setActiveSegmentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function PhoneEmulator({
  project,
  activeSegmentIndex,
  setActiveSegmentIndex,
  isPlaying,
  setIsPlaying,
}: PhoneEmulatorProps) {
  const segments = project.masterScript;
  const activeSegment = segments[activeSegmentIndex] || segments[0];

  const [progress, setProgress] = useState(0); // Progress of current segment (0 to 100)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Stats counters for TikTok screen decoration
  const [likes, setLikes] = useState(1420);
  const [comments, setComments] = useState(85);
  const [liked, setLiked] = useState(false);

  // Lip-sync state for cute avatar illustration
  const [mouthY, setMouthY] = useState(4); // 4px to 14px mouth height for speaking animation

  // Toggle state for semi-transparent Teleprompter overlay over the preview screen
  const [showTeleprompterOverlay, setShowTeleprompterOverlay] = useState(false);

  // Set up lip sync speech simulation
  useEffect(() => {
    let speakInterval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      speakInterval = setInterval(() => {
        // Randomly adjust lip height to simulate speech
        setMouthY(Math.floor(Math.random() * 12) + 3);
      }, 100);
    } else {
      setMouthY(4); // closed/neutral
    }
    return () => {
      if (speakInterval) clearInterval(speakInterval);
    };
  }, [isPlaying]);

  // Handle segment timer progression
  useEffect(() => {
    if (isPlaying) {
      const activeDuration = activeSegment ? activeSegment.duration * 1000 : 5000;
      const start = Date.now() - pausedTimeRef.current;
      startTimeRef.current = start;

      const runTimer = () => {
        const elapsed = Date.now() - start;
        const percent = Math.min((elapsed / activeDuration) * 100, 100);
        setProgress(percent);

        if (percent >= 100) {
          // Current segment finished!
          if (activeSegmentIndex < segments.length - 1) {
            pausedTimeRef.current = 0;
            setActiveSegmentIndex(activeSegmentIndex + 1);
            setProgress(0);
          } else {
            // End of script
            setIsPlaying(false);
            pausedTimeRef.current = 0;
            setProgress(100);
          }
        } else {
          timerRef.current = setTimeout(runTimer, 50);
        }
      };

      timerRef.current = setTimeout(runTimer, 50);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (startTimeRef.current > 0) {
        pausedTimeRef.current = Date.now() - startTimeRef.current;
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, activeSegmentIndex, activeSegment, segments.length]);

  // Reset when active segment is manually clicked
  useEffect(() => {
    setProgress(0);
    pausedTimeRef.current = 0;
    if (startTimeRef.current > 0 && isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [activeSegmentIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
    setActiveSegmentIndex(0);
  };

  const handleLikeToggle = () => {
    if (liked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  // Determine a nice mock ambient pastel background matching the layout vibes
  const getSimulatedBackground = () => {
    if (project.creatorDirectives.vibeDescription.toLowerCase().includes("deadpan") || project.creatorDirectives.vibeDescription.toLowerCase().includes("sarcastic")) {
      return "from-slate-800 via-neutral-900 to-zinc-950"; // Dark cool
    }
    if (project.creatorDirectives.vibeDescription.toLowerCase().includes("warm") || project.creatorDirectives.vibeDescription.toLowerCase().includes("empathetic")) {
      return "from-amber-900 via-stone-900 to-neutral-950"; // Cozy warm
    }
    // Default bright/energetic style
    return "from-indigo-950 via-purple-950 to-neutral-950";
  };

  return (
    <div id="phone-emulator-section" className="flex flex-col items-center select-none w-full">
      {/* Smartphone Outer Shell */}
      <div className="relative aspect-[9/16] w-full max-w-[325px] sm:max-w-[340px] md:max-w-[350px] border-[12px] border-black bg-neutral-950 rounded-none shadow-md overflow-hidden ring-1 ring-black">
        
        {/* Dynamic Notch / Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-none z-30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-zinc-800 absolute right-4"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 absolute left-4"></div>
        </div>

        {/* TOP SEGMENT TICKERS (TikTok/Instagram Story bars / Frame sliders) */}
        <div className="absolute top-8 left-0 right-0 px-4 flex gap-1.5 z-20">
          {segments.map((seg, idx) => (
            <div
              key={seg.segmentId}
              onClick={() => setActiveSegmentIndex(idx)}
              className="flex-1 h-[2.5px] bg-white/30 rounded-none overflow-hidden cursor-pointer"
              title={`${seg.segmentName} (${seg.duration}s)`}
            >
              <div
                className={`h-full transition-all duration-75 ${
                  idx <= activeSegmentIndex
                    ? "bg-white"
                    : "bg-transparent"
                }`}
                style={{
                  width: idx === activeSegmentIndex ? `${progress}%` : idx < activeSegmentIndex ? "100%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* SIMULATED VIDEO PLAYER SCREEN AREA */}
        <div className={`w-full h-full bg-gradient-to-b ${getSimulatedBackground()} flex flex-col justify-between py-12 px-4 relative overflow-hidden transition-colors duration-1000`}>
          
          {/* Subtle noise grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* SEMI-TRANSPARENT TELEPROMPTER OVERLAY */}
          {showTeleprompterOverlay && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-25 flex flex-col justify-center items-center p-6 text-center select-text font-serif">
              {/* Overlay Top Header */}
              <div className="absolute top-10 left-3 right-3 flex items-center justify-between border-b border-white/10 pb-1.5 px-0.5 select-none font-sans">
                <span className="text-[8px] font-mono tracking-widest text-[#FEE21E] font-extrabold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse inline-block"></span> SCREEN TELEPROMPTER
                </span>
                <button
                  type="button"
                  onClick={() => setShowTeleprompterOverlay(false)}
                  className="text-[8px] text-zinc-400 font-mono hover:text-white uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 cursor-pointer rounded-none"
                >
                  dismiss
                </button>
              </div>
              
              {/* Highlight active spoken text */}
              <div className="max-h-[60%] overflow-y-auto py-2 px-1 select-text my-auto w-full font-serif">
                <p className="text-[#FEE21E] text-[10px] leading-relaxed tracking-wider select-none font-sans font-extrabold uppercase italic mb-2">
                  🎤 Read Aloud:
                </p>
                <p className="text-white text-sm sm:text-base leading-relaxed tracking-normal select-text font-medium font-serif italic">
                  "{activeSegment?.audioLine || "Preparing script lines..."}"
                </p>
              </div>

              {/* Progress visual inside overlay */}
              <div className="absolute bottom-10 left-6 right-6 flex flex-col gap-1.5 text-center select-none font-sans">
                <div className="w-full bg-white/20 h-1 rounded-none overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-[#FEE21E] transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-0.5 text-[8px] font-mono text-zinc-400 font-bold">
                  <span>SEGMENT {activeSegmentIndex + 1}/{segments.length}</span>
                  <span>{Math.ceil((activeSegment?.duration || 5) * (1 - progress / 100))}s left</span>
                </div>
              </div>
            </div>
          )}

          {/* Actor Speech Indicator Card */}
          <div className="absolute top-12 left-3 right-3 bg-white/95 backdrop-blur-md rounded-none p-3 border border-black/20 flex items-center gap-2.5 z-10 animate-fade-in">
            <div className="p-1.5 bg-black text-white rounded-none">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-sans font-bold">CREATIVE DIRECTION</p>
              <p className="text-[11px] text-[#1A1A1A] line-clamp-2 italic leading-relaxed font-serif mt-0.5">
                "{activeSegment?.visualCue || "No current directions"}"
              </p>
            </div>
          </div>

          {/* SIMULATED CREATOR AVATAR STAGE (Selfie framing) */}
          <div className="flex-1 flex flex-col items-center justify-center relative mt-12 z-0">
            
            {/* Soft decorative ring light effect glowing behind avatar */}
            <div className={`absolute w-36 h-36 rounded-none blur-[45px] opacity-25 mix-blend-screen transition-colors duration-1000 ${
              isPlaying ? "bg-amber-100 animate-pulse" : "bg-neutral-800"
            }`}></div>

            {/* Speaking Creator Avatar Illustration */}
            <div className="relative">
              <svg width="115" height="115" viewBox="0 0 100 100" className="drop-shadow-md">
                {/* Hoodie / Shoulders */}
                <path d="M15,95 Q15,75 35,65 L65,65 Q85,75 85,95 Z" fill="#2d3748" className="transition-all duration-500 stroke-zinc-700 stroke-[1.5px]" />
                <path d="M40,65 L50,85 L60,65 Z" fill="#1a202c" />
                
                {/* Head / Neck */}
                <rect x="44" y="52" width="12" height="18" fill="#fbd38d" rx="2" />
                <circle cx="50" cy="40" r="22" fill="#fbd38d" />

                {/* Face Features: Blush circles */}
                <circle cx="36" cy="43" r="3" fill="#feb2b2" opacity="0.6" />
                <circle cx="64" cy="43" r="3" fill="#feb2b2" opacity="0.6" />

                {/* Eyes - blink or narrow according to vibe */}
                {isPlaying ? (
                  <>
                    <path d="M33,37 Q37,35 41,37" fill="none" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M59,37 Q63,35 67,37" fill="none" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="37" cy="37" r="2.5" fill="#1a202c" />
                    <circle cx="63" cy="37" r="2.5" fill="#1a202c" />
                  </>
                )}

                {/* Dynamic animated speech mouth */}
                <rect 
                  x={50 - 4} 
                  y={46} 
                  width="8" 
                  height={mouthY} 
                  fill="#742a2a" 
                  rx="4" 
                  className="transition-all duration-100" 
                />

                {/* Simple Casual Hair / Accessories based on presets */}
                <path d="M28,40 Q50,15 72,40 Q50,22 28,40 Z" fill="#4a5568" />
                
                {/* Simulated Smartphone held in hand (if POV / Secret Weapon frame) */}
                {activeSegment?.segmentName?.toLowerCase().includes("demo") || activeSegment?.segmentName?.toLowerCase().includes("feature") ? (
                  <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                    <rect x="68" y="70" width="16" height="26" rx="2" fill="#1a2530" stroke="#ffd700" strokeWidth="1" />
                    <rect x="70" y="72" width="12" height="20" rx="1" fill="#4dabf7" />
                    {/* Hand holder */}
                    <circle cx="73" cy="85" r="4" fill="#fbd38d" />
                  </g>
                ) : null}
              </svg>

              {/* RECORDING RED DOT BAR */}
              <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-red-650 rounded-none flex items-center gap-1 animate-pulse z-10 border border-white/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="text-[7px] text-white font-mono font-bold uppercase tracking-wider">REC</span>
              </div>
            </div>

            {/* Creator Description Badge */}
            <div className="mt-4 px-3 py-1 bg-[#F1EFEC]/95 backdrop-blur-sm border border-black/10 rounded-none text-[9px] text-[#1A1A1A] font-sans font-bold uppercase tracking-widest max-w-[170px] text-center select-none shadow-xs">
              📷 {project.creatorDirectives.vibeDescription.split('.')[0] || "UGC Smartphone Vibe"}
            </div>
          </div>

          {/* DYNAMIC TIKTOK OVERLAY PANEL (Right margin icons) */}
          <div className="absolute right-3.5 bottom-32 flex flex-col items-center gap-4 z-10">
            {/* Creator profile circle */}
            <div className="w-9 h-9 rounded-none bg-black border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs">
              UGC
            </div>

            {/* Love Button */}
            <button 
              onClick={handleLikeToggle}
              className="flex flex-col items-center gap-0.5 hover:scale-105 active:scale-95 transition-transform"
            >
              <div className={`p-2 rounded-none backdrop-blur-md ${liked ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white'}`}>
                <Heart className="w-4.5 h-4.5 fill-current" />
              </div>
              <span className="text-[10px] text-zinc-200 font-bold">{likes}</span>
            </button>

            {/* Comments */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="p-2 rounded-none bg-black/40 text-white backdrop-blur-md">
                <MessageCircle className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] text-zinc-200 font-bold">{comments}</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="p-2 rounded-none bg-black/40 text-white backdrop-blur-md">
                <Share2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] text-zinc-200 font-bold">42</span>
            </div>
          </div>

          {/* NATIVE ON-SCREEN CAPTION LAYER (Centered near bottom-third) */}
          <div className="px-3 min-h-[90px] flex items-center justify-center text-center z-10 my-10 select-none">
            {activeSegment?.textOverlay ? (
              <div className="transform scale-102 transition-transform duration-200">
                {/* High Contrast Tik-Tok Style Pill Text using Signature yellow block overlay exactly as design */}
                <div className="inline-block bg-[#FEE21E] text-black px-4 py-2 font-serif font-extrabold text-sm uppercase italic tracking-tight border-2 border-black shadow-xs">
                  "{activeSegment.textOverlay}"
                </div>
                <div>
                  <p className="text-[8px] text-zinc-400 font-sans tracking-widest font-bold uppercase mt-2.5 bg-black/45 py-0.5 px-2 rounded-none border border-white/5 inline-block">
                    💬 ACTIVE CAPTION
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-xs italic font-serif">Play preview to view native overlay...</p>
            )}
          </div>

          {/* CREATOR IDENTIFIER & MUSIC BOX (Simulated Social Footer info) */}
          <div className="w-[80%] pr-4 select-none leading-relaxed flex flex-col gap-1 z-10 text-left">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-white truncate my-0">@direct_creator</span>
              <span className="text-[8px] bg-red-650 text-white px-1 rounded-none font-mono flex items-center gap-0.5 uppercase tracking-wide">
                <UserCheck className="w-2.5 h-2.5" /> UGC PRO
              </span>
            </div>
            
            {/* UGC Audio script line transcript ticker preview - shows current paragraph */}
            <p className="text-zinc-200 text-[11px] leading-relaxed line-clamp-2 select-none font-serif italic">
              "{activeSegment?.audioLine || "Preparing audio file directions..."}"
            </p>

            {/* Audio Scrolling Bar */}
            <div className="flex items-center gap-1 text-[8px] text-zinc-400 mt-1.5 font-sans whitespace-nowrap overflow-hidden">
              <span className="animate-pulse">🎵</span>
              <div className="overflow-hidden relative w-32 h-3.5">
                <span className="absolute animate-marquee whitespace-nowrap font-medium text-zinc-300 text-[8px] uppercase tracking-wider font-mono">
                  AUTHENTIC SPEECH TRACK
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* COMPANION TELEPROMPTER CONTROLS BELOW PHONE */}
      <div id="emulator-controls-panel" className="mt-5 w-full max-w-[340px] bg-white border border-black/15 rounded-none p-4 flex flex-col gap-3 shadow-sm font-sans">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-black/5">
          <div className="flex items-center gap-1 bg-[#F1EFEC] px-2 py-0.5 rounded-none text-black font-mono text-[9px] font-bold border border-black/5">
            <span className="w-1.5 h-1.5 rounded-none bg-red-650 animate-pulse"></span>
            SEGMENT {activeSegmentIndex + 1}/{segments.length}
          </div>
          <p className="font-bold text-black uppercase tracking-wider font-sans text-[10px]">
            {activeSegment?.segmentName || "No Segment"}
          </p>
          <p className="text-zinc-500 font-mono text-[10px]">
            {activeSegment?.duration || 0}s
          </p>
        </div>

        {/* Playback Progress Scrubber Bar */}
        <div className="w-full bg-[#F1EFEC] h-1.5 rounded-none overflow-hidden relative border border-black/5">
          <div
            className="h-full bg-black rounded-none transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Teleprompter Screen Overlay Toggle Option */}
        <div className="flex items-center justify-between text-xs py-1 border-b border-black/5 select-none animate-fade-in">
          <span className="font-bold text-zinc-650 uppercase tracking-widest text-[9px]">Screen Teleprompter Glass</span>
          <button
            onClick={() => setShowTeleprompterOverlay(!showTeleprompterOverlay)}
            type="button"
            className={`px-3 py-1.5 text-[8px] uppercase tracking-wider font-extrabold cursor-pointer border transition-colors duration-150 ${
              showTeleprompterOverlay
                ? "bg-black text-[#FEE21E] border-black"
                : "bg-white text-zinc-800 border-black/15 hover:bg-[#F1EFEC]"
            }`}
          >
            {showTeleprompterOverlay ? "📡 Overlay: ON" : "📡 Overlay: OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={handleReset}
            className="flex items-center justify-center p-2.5 bg-white hover:bg-[#F1EFEC] text-black rounded-none transition-all border border-black/15 cursor-pointer"
            title="Restart Script rehearsal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className={`flex-1 mx-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-none transition-all font-sans font-bold text-[10px] tracking-wider uppercase cursor-pointer ${
              isPlaying
                ? "bg-[#F1EFEC] hover:bg-black hover:text-white text-black border border-black/10"
                : "bg-black hover:bg-black/90 text-white shadow-xs"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause Rehearsal
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Preview
              </>
            )}
          </button>

          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono bg-[#FAF9F6] px-2 py-1 rounded-none border border-black/10 font-bold uppercase">
            <Sparkles className="w-3 h-3 text-red-650" /> SYNC
          </div>
        </div>
      </div>
    </div>
  );
}
