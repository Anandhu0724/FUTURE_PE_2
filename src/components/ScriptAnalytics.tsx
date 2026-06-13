import React, { useMemo } from "react";
import { 
  BarChart3, TrendingUp, Sparkles, AlertCircle, HelpCircle, 
  ArrowRight, Award, Flame, Timer, CheckCircle2, ChevronRight, Check
} from "lucide-react";
import { Hook, UGCProject } from "../types";

interface ScriptAnalyticsProps {
  project: UGCProject;
  activeHook: Hook;
  creatorTone: string;
  creatorPacing: string;
  teleprompterSpeed: number;
}

export default function ScriptAnalytics({
  project,
  activeHook,
  creatorTone,
  creatorPacing,
  teleprompterSpeed
}: ScriptAnalyticsProps) {

  // Dynamic Metrics engine evaluating current active config parameters
  const metrics = useMemo(() => {
    // 1. Hook Retention Score (Based on active hook text overlay & concept)
    const hookType = activeHook.type.toLowerCase();
    let hookRetentionBonus = 0;
    let hookStopRatio = 75; // baseline percentage
    let hookPowerDesc = "Standard Interrupt";

    if (hookType.includes("opinion") || hookType.includes("unpopular")) {
      hookRetentionBonus = 12;
      hookStopRatio = 89;
      hookPowerDesc = "High Contradiction Curiosities";
    } else if (hookType.includes("convenience") || hookType.includes("lazy") || hookType.includes("laziness")) {
      hookRetentionBonus = 15;
      hookStopRatio = 93;
      hookPowerDesc = "Extreme Shortcut Appeal";
    } else if (hookType.includes("social") || hookType.includes("tiktok") || hookType.includes("trend")) {
      hookRetentionBonus = 18;
      hookStopRatio = 95;
      hookPowerDesc = "Viral Proof Amplification";
    } else if (hookType.includes("secret") || hookType.includes("leak") || hookType.includes("gatekeep")) {
      hookRetentionBonus = 14;
      hookStopRatio = 91;
      hookPowerDesc = "Exclusive FOMO Framing";
    } else if (hookType.includes("negative") || hookType.includes("mistake") || hookType.includes("stop")) {
      hookRetentionBonus = 13;
      hookStopRatio = 90;
      hookPowerDesc = "Loss Aversion Triggers";
    }

    // Text complexity modifiers
    const hookTextLength = activeHook.textOverlay.length;
    if (hookTextLength > 0 && hookTextLength <= 35) {
      // Short visual overlays read much faster under 1.5s
      hookStopRatio += 3;
    } else if (hookTextLength > 55) {
      // Cluttered text overlay harms native UGC feel
      hookStopRatio -= 8;
    }

    const calculatedStopRatio = Math.min(99, Math.max(45, hookStopRatio));

    // 2. Estimated Hook Retention at 3-Seconds (Watch time multiplier)
    const calculatedHookRetention = Math.min(96, Math.max(35, 62 + hookRetentionBonus));

    // 3. CTA Effectiveness (Evaluating call to actions styles and app name urgency)
    const activeCta = project.ctas && project.ctas.length > 0 ? project.ctas[0] : null;
    let ctaConversionScore = 65; // baseline conversion index
    let ctaQualityLabel = "Adequate Transfer";

    if (activeCta) {
      const ctaPhrase = activeCta.phrase.toLowerCase();
      if (ctaPhrase.includes("free") || ctaPhrase.includes("now") || ctaPhrase.includes("download")) {
        ctaConversionScore += 14;
      }
      if (ctaPhrase.includes("lazy") || ctaPhrase.includes("easier") || ctaPhrase.includes("cheating")) {
        ctaConversionScore += 11;
      }
      // Evaluate chosen CTA Style
      const style = activeCta.style.toLowerCase();
      if (style.includes("direct") || style.includes("store")) {
        ctaConversionScore += 10;
        ctaQualityLabel = "High direct action incentive";
      } else if (style.includes("proof") || style.includes("social")) {
        ctaConversionScore += 15;
        ctaQualityLabel = "Mass viral adoption framing";
      } else if (style.includes("laziness") || style.includes("convenience") || style.includes("hack")) {
        ctaConversionScore += 18;
        ctaQualityLabel = "Absolute minimal friction bias";
      }
    }

    // Pacing multiplier for action retention
    if (creatorPacing.toLowerCase().includes("rapid") || creatorPacing.toLowerCase().includes("fast")) {
      ctaConversionScore += 4;
    } else if (creatorPacing.toLowerCase().includes("slow") || creatorPacing.toLowerCase().includes("drag")) {
      ctaConversionScore -= 10;
    }

    const calculatedCtaEffectiveness = Math.min(98, Math.max(30, ctaConversionScore));

    // 4. Script Timing feasibility check (words vs duration)
    let totalWordCount = 0;
    project.masterScript.forEach(seg => {
      totalWordCount += seg.audioLine.split(/\s+/).filter(Boolean).length;
    });

    const calculatedDurationSeconds = Math.round((totalWordCount / teleprompterSpeed) * 60);
    const isOverDurationLimit = calculatedDurationSeconds > 50; // UGC sweetspot is under 45s-50s
    const isUnderDurationLimit = calculatedDurationSeconds < 25;

    let timingVibe = "Optimally Calibrated";
    let timingColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (isOverDurationLimit) {
      timingVibe = "Heavy script length warning";
      timingColor = "text-amber-700 bg-amber-50 border-amber-100";
    } else if (isUnderDurationLimit) {
      timingVibe = "Slightly too condensed";
      timingColor = "text-[#A1824A] bg-[#FAF9F6] border-[#1A1A1A]/10";
    }

    // 5. Psychological Vibe index scores
    let patternInterruptScore = 60;
    let authenticityScore = 65;
    let urgencyScore = 55;

    if (creatorTone.toLowerCase().includes("sarcastic") || creatorTone.toLowerCase().includes("honest")) {
      authenticityScore = 94;
      patternInterruptScore = 80;
    } else if (creatorTone.toLowerCase().includes("hype") || creatorTone.toLowerCase().includes("energetic")) {
      patternInterruptScore = 90;
      authenticityScore = 55;
      urgencyScore = 82;
    } else if (creatorTone.toLowerCase().includes("casual") || creatorTone.toLowerCase().includes("whisper")) {
      authenticityScore = 92;
      urgencyScore = 45;
    }

    if (activeHook.concept.toLowerCase().includes("lazy") || activeHook.concept.toLowerCase().includes("convenience")) {
      authenticityScore += 5;
    }

    patternInterruptScore = Math.min(100, Math.max(40, patternInterruptScore));
    authenticityScore = Math.min(100, Math.max(40, authenticityScore));
    urgencyScore = Math.min(100, Math.max(40, urgencyScore));

    return {
      scrollStopRatio: calculatedStopRatio,
      estimatedHookRetention: calculatedHookRetention,
      ctaEffectiveness: calculatedCtaEffectiveness,
      totalWordCount,
      durationSeconds: calculatedDurationSeconds,
      timingVibe,
      timingColor,
      hookPowerDesc,
      ctaLabel: ctaQualityLabel,
      vibeMetrics: {
        patternInterrupt: patternInterruptScore,
        authenticity: authenticityScore,
        urgency: urgencyScore
      }
    };
  }, [project, activeHook, creatorTone, creatorPacing, teleprompterSpeed]);

  return (
    <div id="script-analytics-tracker-card" className="bg-white border border-black/15 rounded-none p-5 sm:p-6 shadow-sm w-full flex flex-col gap-5 text-left select-none">
      
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3 font-sans">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4.5 h-4.5 text-black" />
          <h4 className="font-serif text-lg text-[#1A1A1A] tracking-tight font-medium">DR-Ad Performance Predictive Deck</h4>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-650 bg-[#FAF9F6] px-2.5 py-1 rounded-none border border-black/10 font-extrabold flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-600" /> Algorithmic Forecaster Active
        </span>
      </div>

      {/* METRIC VISUAL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* ESTIMATED SCROLL STOP RATIO BANNER */}
        <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 font-sans text-[10px] uppercase tracking-wider font-bold">
              <span>Scroll-Stop Rate</span>
              <span className="text-[8px] bg-black text-[#FEE21E] font-mono font-extrabold px-1.5 py-0.2">HOOK</span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-extrabold text-[#1A1A1A]">{metrics.scrollStopRatio}%</span>
              <span className="text-[10px] text-emerald-700 font-sans font-bold flex items-center">
                ↑ Strong Stop
              </span>
            </div>

            <p className="text-[10px] text-zinc-600 font-sans leading-normal mt-1.5">
              Reflects percentage of users stopping within first 1.5s. Angle optimized: <span className="font-bold underline text-black">{metrics.hookPowerDesc}</span>.
            </p>
          </div>

          <div className="w-full bg-zinc-200 h-1.5 rounded-none mt-4 overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-350"
              style={{ width: `${metrics.scrollStopRatio}%` }}
            />
          </div>
        </div>

        {/* 3S HOOK RETENTION PROJECTION */}
        <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 font-sans text-[10px] uppercase tracking-wider font-bold">
              <span>Estimated 3s Retention</span>
              <span className="text-[8px] bg-black text-[#FAF9F6] font-mono font-extrabold px-1.5 py-0.2">WATCH</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-extrabold text-[#1A1A1A]">{metrics.estimatedHookRetention}%</span>
              <span className="text-[10px] text-emerald-700 font-sans font-bold flex items-center">
                ↑ Tier-1 Cap
              </span>
            </div>

            <p className="text-[10px] text-zinc-600 font-sans leading-normal mt-1.5">
              Projected audience retention rate at Second 3 of vertical replay. Target benchmark is &gt;55% for profitable ad CPM.
            </p>
          </div>

          <div className="w-full bg-zinc-200 h-1.5 rounded-none mt-4 overflow-hidden">
            <div 
              className="h-full bg-zinc-700 transition-all duration-350"
              style={{ width: `${metrics.estimatedHookRetention}%` }}
            />
          </div>
        </div>

        {/* CTA TRANSFER RATE IMPACT */}
        <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 font-sans text-[10px] uppercase tracking-wider font-bold">
              <span>CTA Store Transfer</span>
              <span className="text-[8px] bg-black text-[#FAF9F6] font-mono font-extrabold px-1.5 py-0.2">CONVERT</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-mono font-extrabold text-[#1A1A1A]">{metrics.ctaEffectiveness}%</span>
              <span className="text-[10px] text-emerald-700 font-sans font-bold flex items-center">
                ↑ Direct Flow
              </span>
            </div>

            <p className="text-[10px] text-zinc-600 font-sans leading-normal mt-1.5">
              Predicted conversion efficiency of call-to-action. Overlays use: <span className="font-bold underline text-black">{metrics.ctaLabel}</span>.
            </p>
          </div>

          <div className="w-full bg-zinc-200 h-1.5 rounded-none mt-4 overflow-hidden">
            <div 
              className="h-full bg-[#1A1A1A]/40 transition-all duration-350"
              style={{ width: `${metrics.ctaEffectiveness}%` }}
            />
          </div>
        </div>

      </div>

      {/* DETAILED HORIZONTAL INSIGHT DECK - VIBE CHECK & AUDIT TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 border-t border-black/10 pt-4 font-sans">
        
        {/* LEFT INSIGHT PANELS - ATTRIBUTE SCALERS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="flex items-center gap-1.5 select-none">
            <Sparkles className="w-4 h-4 text-black" />
            <h5 className="font-serif text-[13px] text-[#1A1A1A] font-bold tracking-tight">Direct Response Factor Evaluation</h5>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            {/* Visual Pattern Interrupt attribute slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-700 mb-1">
                <span>Visual Pattern Interrupt</span>
                <span className="font-mono text-black font-extrabold">{metrics.vibeMetrics.patternInterrupt} / 100</span>
              </div>
              <div className="w-full bg-[#FAF9F6] border border-black/10 h-2.5 rounded-none overflow-hidden relative">
                <div 
                  className="h-full bg-[#FEE21E]" 
                  style={{ width: `${metrics.vibeMetrics.patternInterrupt}%` }}
                />
              </div>
            </div>

            {/* Under-the-radar Authenticity attribute slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-700 mb-1">
                <span>Under-the-radar Authenticity</span>
                <span className="font-mono text-black font-extrabold">{metrics.vibeMetrics.authenticity} / 100</span>
              </div>
              <div className="w-full bg-[#FAF9F6] border border-black/10 h-2.5 rounded-none overflow-hidden relative">
                <div 
                  className="h-full bg-black" 
                  style={{ width: `${metrics.vibeMetrics.authenticity}%` }}
                />
              </div>
            </div>

            {/* Urgency Quotient attribute slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-700 mb-1">
                <span>Direct-Response Call Urgency</span>
                <span className="font-mono text-black font-extrabold">{metrics.vibeMetrics.urgency} / 100</span>
              </div>
              <div className="w-full bg-[#FAF9F6] border border-black/10 h-2.5 rounded-none overflow-hidden relative">
                <div 
                  className="h-full bg-zinc-400" 
                  style={{ width: `${metrics.vibeMetrics.urgency}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT INSIGHT PANELS - CADENCE CALIBRATION (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 border-t lg:border-t-0 lg:border-l border-black/10 pt-4 lg:pt-0 lg:pl-5">
          <div className="flex items-center gap-1.5 select-none">
            <Timer className="w-4 h-4 text-black" />
            <h5 className="font-serif text-[13px] text-[#1A1A1A] font-bold tracking-tight">Cadence & timing Calibration</h5>
          </div>

          <div className="flex flex-col gap-2.5 font-sans">
            {/* Word count stats */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-550">Script Word Count:</span>
              <span className="font-bold text-black font-serif italic">{metrics.totalWordCount} words</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-550">Teleprompter Delivery Speed:</span>
              <span className="font-bold text-black font-mono">{teleprompterSpeed} WPM ({creatorPacing})</span>
            </div>

            {/* Calculated active duration bar */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-550">Estimated Visual Run Time:</span>
              <span className="font-bold text-black bg-[#FAF9F6] px-1.5 border border-black/10 font-mono">~ {metrics.durationSeconds} seconds</span>
            </div>

            {/* Timing check status bubble */}
            <div className={`border p-2 mt-1 rounded-none flex items-start gap-1.5 text-[10px] leading-relaxed ${metrics.timingColor}`}>
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">{metrics.timingVibe}</span>
                {metrics.durationSeconds > 50 ? (
                  <span>The scripted flow is slightly long for high-speed TikTok attention spans. Consider using "pacing: rapid" of 160 WPM or trimming redundant paragraphs of core hooks.</span>
                ) : metrics.durationSeconds < 25 ? (
                  <span>Extremely fast. This works well for ultra-aggressive retargeting loop strategies. Make sure visuals remain highly descriptive.</span>
                ) : (
                  <span>Beautiful timing framework. Complete screen story will run inside the 45-second direct-response sweet spot, minimizing drops.</span>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QUICK DATA-DRIVEN RECO FEEDBACKS PANEL */}
      <div className="bg-[#1A1A1A] hover:bg-black/95 transition-colors p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white border border-black font-sans shadow-xs mt-1">
        <div className="flex items-start gap-2 max-w-[80%]">
          <Award className="w-4 h-4 text-yellow-450 mt-0.5 shrink-0" />
          <div className="text-left font-sans select-text">
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-300 block mb-0.5">UGC Direct performance Recommendation</span>
            <p className="text-[11px] text-zinc-100 select-text leading-relaxed">
              {metrics.vibeMetrics.authenticity < 60 ? (
                <span>Your tone is set to "{creatorTone}". Dynamic corporate hype raises suspicion levels on social networks. Swap to a "Sarcastic & Honest" or "Casual" delivery style to raise the Authenticity Rating by 35%.</span>
              ) : activeHook.type.toLowerCase().includes("opinion") ? (
                <span>"Unpopular Opinion" hooks excel in visual forums. Start the video overlay immediately from Frame 0.1 to stop aggressive scroll drops. Recommended visual action: "aggressive eye-to-camera contact."</span>
              ) : activeHook.type.toLowerCase().includes("convenience") || activeHook.type.toLowerCase().includes("lazy") ? (
                <span>Extreme convenience is the highest converting sub-angle of 2026. Emphasize how much physical effort is completely bypassed by the app in scene 2.</span>
              ) : (
                <span>Your active hook setup carries a stellar {metrics.scrollStopRatio}% predicted Stop Rate! Trigger rehearsal mode via the Phone Canvas to lock down natural creator talking-head delays.</span>
              )}
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            const el = document.getElementById("brief-exporter-module");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-white hover:text-[#FEE21E] text-[10px] font-bold uppercase tracking-widest font-sans flex items-center gap-1 min-w-max self-end sm:self-center cursor-pointer select-none"
        >
          Download Brief <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
