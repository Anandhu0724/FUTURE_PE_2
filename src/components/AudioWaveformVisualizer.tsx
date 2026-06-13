import React, { useRef, useEffect, useState } from "react";
import { Volume2, Music, Scissors, Activity } from "lucide-react";
import { ScriptSegment } from "../types";

interface AudioWaveformVisualizerProps {
  segments: ScriptSegment[];
  activeSegmentIndex: number;
  setActiveSegmentIndex: (index: number) => void;
  selectedVoice: string;
  synthesizedAudio: string | null;
  audioIsPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  onSeek: (seconds: number) => void;
}

// Voice pacing & energy profiles to influence rendering densities
const VOICE_PROFILES: Record<string, { energy: number; paceMult: number; label: string }> = {
  Zephyr: { energy: 75, paceMult: 1.0, label: "Moderate Pacing" },
  Kore: { energy: 85, paceMult: 1.3, label: "Upbeat / Bubbly" },
  Puck: { energy: 98, paceMult: 1.8, label: "Rapidfire / Gen-Z" },
  Charon: { energy: 60, paceMult: 0.7, label: "Deliberate / Deep" },
  Fenrir: { energy: 80, paceMult: 1.1, label: "Rhythmic / Crisp" },
};

export default function AudioWaveformVisualizer({
  segments,
  activeSegmentIndex,
  setActiveSegmentIndex,
  selectedVoice,
  synthesizedAudio,
  audioIsPlaying,
  audioCurrentTime,
  audioDuration,
  onSeek,
}: AudioWaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 120 });

  const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0) || 1;

  // Track parent component size reactively to resize canvas smoothly
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // set canvas width keeping aspect-ratio
        setDimensions({
          width: Math.max(300, Math.floor(width)),
          height: 110,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main drawing engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    // Set higher resolution for Retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = "#FAF9F6"; // Workbench matching off-white
    ctx.fillRect(0, 0, width, height);

    // Grid details (light gridlines)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Load active voice multiplier profiles
    const profile = VOICE_PROFILES[selectedVoice] || VOICE_PROFILES.Zephyr;
    const voiceEnergy = profile.energy / 100; // 0.6 - 0.98
    const voicePace = profile.paceMult;       // 0.7 - 1.8

    // Generate waveform data bars
    const barWidth = 2;
    const barGap = 1.5;
    const step = barWidth + barGap;
    const totalBars = Math.floor(width / step);

    // Map segments along horizontal X dimension
    let elapsedDuration = 0;
    const segmentsXBounds = segments.map((seg) => {
      const startFrac = elapsedDuration / totalDuration;
      elapsedDuration += seg.duration;
      const endFrac = elapsedDuration / totalDuration;
      return {
        id: seg.segmentId,
        name: seg.segmentName,
        duration: seg.duration,
        audioLine: seg.audioLine,
        startX: startFrac * width,
        endX: endFrac * width,
      };
    });

    // Draw segment backing bands and boundary guidelines
    segmentsXBounds.forEach((bound, index) => {
      const isCurrent = index === activeSegmentIndex;
      
      // Paint soft cream indicator background for active segment
      if (isCurrent) {
        ctx.fillStyle = "rgba(40, 40, 40, 0.04)";
        ctx.fillRect(bound.startX, 0, bound.endX - bound.startX, height);
      }

      // Draw dashed visual marker for scene boundaries
      if (index > 0) {
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.moveTo(bound.startX, 0);
        ctx.lineTo(bound.startX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Render Scene IDs and timings inside divisions (Small caps)
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = isCurrent ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.35)";
      
      const labelText = `SC ${bound.id} (${bound.duration}s)`;
      ctx.fillText(labelText, bound.startX + 6, 12);
    });

    // Determine current playhead position
    const effectiveDuration = audioDuration || totalDuration;
    const playheadRatio = audioCurrentTime / effectiveDuration;
    const playheadX = playheadRatio * width;

    // Draw audio data bars
    for (let barIdx = 0; barIdx < totalBars; barIdx++) {
      const barX = barIdx * step + barWidth;
      
      // Determine which segment this bar falls into
      const segBoundIdx = segmentsXBounds.findIndex(
        (b) => barX >= b.startX && barX <= b.endX
      );
      
      const segIdx = segBoundIdx !== -1 ? segBoundIdx : 0;
      const bound = segmentsXBounds[segIdx];
      const audioLine = bound ? bound.audioLine : "";

      // Synthesize deterministic heights based on characters to look real
      // Seed code using line & character lengths so it is consistent
      let stringWeight = 0;
      if (audioLine) {
        for (let charI = 0; charI < audioLine.length; charI++) {
          stringWeight += audioLine.charCodeAt(charI) * (charI + 1);
        }
      }

      // Seed wave components
      const sineSeed1 = Math.sin(barIdx * 0.18 * voicePace + stringWeight * 0.015);
      const sineSeed2 = Math.cos(barIdx * 0.06 * voicePace + stringWeight * 0.007);
      
      // Punctuation factors (raise excitement/amplitude if segment contains exclamations or capital letters)
      let punctuationBonus = 1.0;
      if (audioLine && (audioLine.includes("!") || audioLine.includes("BEST") || audioLine.includes("NOW"))) {
        punctuationBonus = 1.25;
      }

      // Compute spoken modulation envelope (smooth valleys & talk bursts)
      const silenceEnvelope = Math.max(0.2, 0.5 + 0.5 * Math.sin(barIdx * 0.04));
      
      // Final height ratio (0.1 to 0.95 height amplitude)
      const rawHeight = Math.abs(sineSeed1 + sineSeed2 * 0.45) * 0.5 * voiceEnergy * punctuationBonus * silenceEnvelope;
      const finalHeight = Math.max(2, Math.min(height - 24, rawHeight * (height - 24)));
      
      // Center vertical drawing orientation
      const yPos = (height - finalHeight) / 2 + 5;

      // Color coding:
      // Active playing side is colored solid dark, non-played side is translucent light grey.
      const isPlayed = barX <= playheadX && synthesizedAudio;
      const isActiveSegment = segIdx === activeSegmentIndex;

      if (isPlayed) {
        // Active played state -> Rich Charcoal
        ctx.fillStyle = "#1A1A1A";
      } else if (isActiveSegment) {
        // Unplayed but active selected block -> slate accent
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      } else {
        // Dormant blocks -> soft neutral grey
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      }

      // Draw the bar pill
      ctx.beginPath();
      ctx.rect(barX, yPos, barWidth, finalHeight);
      ctx.fill();
    }

    // Playhead line marker (neon red style indicator)
    if (synthesizedAudio && playheadX > 0 && playheadX < width) {
      ctx.strokeStyle = "#C8102E"; // Precision direct-response ruby red
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead circle hub
      ctx.fillStyle = "#C8102E";
      ctx.beginPath();
      ctx.arc(playheadX, 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw interactive hover seeker vertical cue
    if (hoverX !== null && hoverX >= 0 && hoverX <= width) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [dimensions, segments, activeSegmentIndex, selectedVoice, synthesizedAudio, audioIsPlaying, audioCurrentTime, audioDuration, hoverX]);

  // Handle interaction handlers (clicking is seeking!)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    const effectiveDuration = audioDuration || totalDuration;
    
    setHoverX(x);
    setHoverTime(fraction * effectiveDuration);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverTime(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    
    // Check if click boundary shifts scene focus manually
    let cumulativeDuration = 0;
    const clickedSecs = fraction * (audioDuration || totalDuration);

    const matchSegIdx = segments.findIndex((seg) => {
      cumulativeDuration += seg.duration;
      return clickedSecs <= cumulativeDuration;
    });

    if (matchSegIdx !== -1) {
      setActiveSegmentIndex(matchSegIdx);
    }

    // Seek the audio
    onSeek(clickedSecs);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border-2 border-black p-4 select-none text-left w-full mt-2 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-800" />
          <span className="text-[10px] uppercase font-sans font-extrabold tracking-[0.2em] text-[#1a1a1a] block">
            Acoustic Timeline & Pacing Modeler
          </span>
        </div>
        
        {/* Helper labels */}
        <div className="flex gap-4 text-[9.5px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-black opacity-35 border border-black/10"></span>
            Active Scene Waveform
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 bg-black border border-black/10"></span>
            Synthesized Audio
          </span>
          {hoverTime !== null && (
            <span className="text-red-650 font-bold bg-[#FAF9F6] border border-black/10 px-1 py-0.5">
              🔍 Seek Focus: {formatTime(hoverTime)}
            </span>
          )}
        </div>
      </div>

      {/* Main Canvas Container wrapper */}
      <div ref={containerRef} className="w-full relative overflow-hidden bg-[#FAF9F6] border border-black/15 cursor-pointer">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="block w-full h-[110px]"
          title="Interactive Playback Timeline. Click anywhere to jump playhead audio scrubber or transition scenes."
        />

        {/* Floating Tooltips or contextual notifications */}
        {!synthesizedAudio && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] pointer-events-none select-none px-4">
            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-1.5 bg-[#FAF9F6] border border-black/15 px-3 py-1.5 shadow-sm">
              <Music className="w-3.5 h-3.5 animate-bounce text-zinc-400" />
              Pre-Synthesis Envelope preview • Generate AI Voice block to unlock scrubbing controls
            </p>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex justify-between items-center text-[9.5px] text-zinc-500 font-mono tracking-tight leading-none bg-[#FAF9F6] p-2 border border-black/5">
        <span>🎬 Start Block: Scene {segments[0]?.segmentId || "1"}</span>
        <span className="font-sans font-extrabold uppercase text-black text-[9px] bg-[#FAF9F6] px-1.5 py-0.5 rounded-none border border-black/10">
          🎚️ Click waveform curve peaks to skip sections instantly
        </span>
        <span>⏱️ Total script run-time: ~{totalDuration.toFixed(1)}s</span>
      </div>
    </div>
  );
}
