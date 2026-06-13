import React, { useState } from "react";
import { Sparkles, Library, Volume1, Compass, ShieldAlert, BadgeInfo } from "lucide-react";
import { PresetBrief } from "../types";
import { PRESET_BRIEFS } from "../data";

interface BriefFormProps {
  appName: string;
  setAppName: (val: string) => void;
  appCategory: string;
  setAppCategory: (val: string) => void;
  targetAudience: string;
  setTargetAudience: (val: string) => void;
  corePainPoint: string;
  setCorePainPoint: (val: string) => void;
  killerFeature: string;
  setKillerFeature: (val: string) => void;
  creatorTone: string;
  setCreatorTone: (val: string) => void;
  creatorPacing: string;
  setCreatorPacing: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onLoadPreset: (preset: PresetBrief) => void;
}

export default function BriefForm({
  appName,
  setAppName,
  appCategory,
  setAppCategory,
  targetAudience,
  setTargetAudience,
  corePainPoint,
  setCorePainPoint,
  killerFeature,
  setKillerFeature,
  creatorTone,
  setCreatorTone,
  creatorPacing,
  setCreatorPacing,
  onGenerate,
  isGenerating,
  onLoadPreset,
}: BriefFormProps) {
  const [activePresetId, setActivePresetId] = useState<string>("mbceats");

  // Custom states for validation and confirmation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [shakingField, setShakingField] = useState<string | null>(null);
  const [pendingPreset, setPendingPreset] = useState<PresetBrief | null>(null);

  // Status logs shown during script generation to provide rich psychological immersion
  const [generationStep, setGenerationStep] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < 3 ? prev + 1 : 3));
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Handle Preset Load Safeguards
  const handlePresetSelect = (preset: PresetBrief) => {
    // Check if the user has active customized content on form before wiping it
    const isDirty = 
      appName !== PRESET_BRIEFS.find(p => p.id === activePresetId)?.appName ||
      appCategory !== PRESET_BRIEFS.find(p => p.id === activePresetId)?.appCategory ||
      corePainPoint !== PRESET_BRIEFS.find(p => p.id === activePresetId)?.corePainPoint ||
      killerFeature !== PRESET_BRIEFS.find(p => p.id === activePresetId)?.killerFeature;

    if (isDirty) {
      setPendingPreset(preset);
    } else {
      setActivePresetId(preset.id);
      onLoadPreset(preset);
      setErrors({});
      setShakingField(null);
    }
  };

  const confirmOverwrittenPreset = () => {
    if (pendingPreset) {
      setActivePresetId(pendingPreset.id);
      onLoadPreset(pendingPreset);
      setPendingPreset(null);
      setErrors({});
      setShakingField(null);
    }
  };

  // Safe manual input changes to clear stale validation warnings
  const handleInputChange = (field: string, val: string, setter: (v: string) => void) => {
    setter(val);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (shakingField === field) {
      setShakingField(null);
    }
  };

  // Form Validation Engine & Shaking Intercept
  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!appName.trim()) {
      newErrors.appName = "App name is required for video overlay watermark placement.";
    }
    if (!appCategory.trim()) {
      newErrors.appCategory = "Category is required to establish creator relevance guidelines.";
    }
    if (!targetAudience.trim()) {
      newErrors.targetAudience = "Target audience is required to address client-side painpoints.";
    }
    if (!corePainPoint.trim()) {
      newErrors.corePainPoint = "Pain point is required to anchor a relatable visual hook.";
    }
    if (!killerFeature.trim()) {
      newErrors.killerFeature = "Killer feature is required; cannot synthesize an empty solution.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Determine first empty field to initiate shaking
      const firstErrorKey = Object.keys(newErrors)[0];
      setShakingField(firstErrorKey);
      
      // Auto-focus the field to promote easy resolution
      const firstEl = document.getElementsByName(firstErrorKey)[0];
      if (firstEl) {
        (firstEl as HTMLElement).focus();
      }

      // Automatically reset shake state class after 600ms so they can trigger shaking again if needed
      setTimeout(() => {
        setShakingField(null);
      }, 600);
      return;
    }

    setErrors({});
    setShakingField(null);
    onGenerate();
  };

  const steps = [
    "Analyzing target audience psychology & core pain points...",
    "Drafting psychological hooks (Unpopular Opinion & POV frames)...",
    "Weaving conversational audio lines with organic filler words...",
    "Formatting native TikTok overlay captions and CTAs..."
  ];

  return (
    <div id="brief-builder-panel" className="bg-white border border-black/15 rounded-none p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col gap-6">
      
      {/* Decorative top pill badge */}
      <div className="flex items-center gap-1.5 self-start px-2.5 py-1 bg-[#F1EFEC] border border-black/10 text-[9px] text-[#1A1A1A] font-sans tracking-[0.18em] uppercase font-bold">
        <Sparkles className="w-3 h-3 text-red-650" /> UGC Studio Workbench
      </div>

      {/* SECTION EXPLANATION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif text-[#1A1A1A] tracking-tight">
          Creative Brief Workstation
        </h2>
        <p className="text-xs font-sans text-zinc-650 leading-relaxed mt-1 italic">
          Draft specifications for your app. The AI script engine builds direct-response hooks that sound like relatable talking-heads rather than dry commercials.
        </p>
      </div>

      {/* ACTION CONFIRMATION MODAL OVERLAY */}
      {pendingPreset && (
        <div className="bg-red-50/70 border border-red-200 p-4 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in text-left">
          <div className="font-sans flex-1">
            <h4 className="font-extrabold text-[10px] text-red-700 uppercase tracking-wider font-sans">
              ⚠️ Warning: Confirm Autofill Overwrite
            </h4>
            <p className="text-xs text-red-950 leading-relaxed mt-1">
              You have made custom edits to the parameters. Autofilling <strong>"{pendingPreset.appName}"</strong> study will permanently replace your active workspace changes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPendingPreset(null)}
              className="px-3 py-1.5 bg-white border border-black/15 text-black hover:bg-gray-100 transition-all font-sans text-[10px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmOverwrittenPreset}
              className="px-3 py-1.5 bg-red-700 text-white hover:bg-red-800 transition-all font-sans text-[10px] uppercase font-bold cursor-pointer"
            >
              Confirm and Overwrite
            </button>
          </div>
        </div>
      )}

      {/* QUICK PRESETS INJECTION MODULE */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A]/80 flex items-center gap-1.5">
          <Library className="w-3.5 h-3.5" /> Autofill Real Case Studies
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_BRIEFS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              type="button"
              className={`p-3 rounded-none border text-left transition-all duration-200 cursor-pointer ${
                activePresetId === preset.id
                  ? "bg-[#F1EFEC] border-black text-[#1A1A1A] shadow-xs"
                  : "bg-[#FAF9F6]/50 border-black/10 hover:border-black/30 text-zinc-550"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-red-650">
                {preset.appName}
              </p>
              <p className="text-[10px] font-serif text-[#1A1A1A]/70 line-clamp-1 mt-0.5 leading-relaxed">
                {preset.appCategory}
              </p>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-black/5" />

      {/* FORM INPUTS BLOCK */}
      <form onSubmit={validateAndSubmit} noValidate className="flex flex-col gap-5">
        
        {/* APP NAME & CATEGORY ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A] opacity-70 block">
              App Name
            </label>
            <input
              name="appName"
              type="text"
              value={appName}
              onChange={(e) => handleInputChange("appName", e.target.value, setAppName)}
              className={`bg-white border rounded-none px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-zinc-400 font-sans transition-all w-full outline-hidden focus:ring-2 focus:ring-black/5 ${
                errors.appName ? "border-red-600 focus:border-red-650" : "border-black/15 focus:border-black"
              } ${shakingField === "appName" ? "animate-shake" : ""}`}
              placeholder="e.g. HabitTracker"
            />
            {errors.appName && (
              <p className="text-[9px] text-red-650 font-sans font-bold uppercase tracking-wider mt-0.5">
                ⚠️ {errors.appName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A] opacity-70 block">
              App Category / Type
            </label>
            <input
              name="appCategory"
              type="text"
              value={appCategory}
              onChange={(e) => handleInputChange("appCategory", e.target.value, setAppCategory)}
              className={`bg-white border rounded-none px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-zinc-400 font-sans transition-all w-full outline-hidden focus:ring-2 focus:ring-black/5 ${
                errors.appCategory ? "border-red-600 focus:border-red-650" : "border-black/15 focus:border-black"
              } ${shakingField === "appCategory" ? "animate-shake" : ""}`}
              placeholder="e.g. Productivity application"
            />
            {errors.appCategory && (
              <p className="text-[9px] text-red-650 font-sans font-bold uppercase tracking-wider mt-0.5">
                ⚠️ {errors.appCategory}
              </p>
            )}
          </div>
        </div>

        {/* PRIMARY TARGET USER ROW */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A] opacity-70 block">
            Primary Target User / Audience
          </label>
          <input
            name="targetAudience"
            type="text"
            value={targetAudience}
            onChange={(e) => handleInputChange("targetAudience", e.target.value, setTargetAudience)}
            className={`bg-white border rounded-none px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-zinc-400 font-sans transition-all w-full outline-hidden focus:ring-2 focus:ring-black/5 ${
              errors.targetAudience ? "border-red-600 focus:border-red-650" : "border-black/15 focus:border-black"
            } ${shakingField === "targetAudience" ? "animate-shake" : ""}`}
            placeholder="e.g. Busy remote workers who are exhausted by 5 PM"
          />
          {errors.targetAudience && (
            <p className="text-[9px] text-red-650 font-sans font-bold uppercase tracking-wider mt-0.5">
              ⚠️ {errors.targetAudience}
            </p>
          )}
        </div>

        {/* CORE PAIN POINT */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A] opacity-70 block">
            The Core Pain Point (The Hook Basis)
          </label>
          <textarea
            name="corePainPoint"
            value={corePainPoint}
            onChange={(e) => handleInputChange("corePainPoint", e.target.value, setCorePainPoint)}
            rows={2}
            className={`bg-white border rounded-none px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-zinc-400 font-sans transition-all w-full outline-hidden resize-none focus:ring-2 focus:ring-black/5 ${
              errors.corePainPoint ? "border-red-600 focus:border-red-650" : "border-black/15 focus:border-black"
            } ${shakingField === "corePainPoint" ? "animate-shake" : ""}`}
            placeholder="e.g. Struggling to build habits or routines without quitting after 3 days"
          />
          {errors.corePainPoint && (
            <p className="text-[9px] text-red-650 font-sans font-bold uppercase tracking-wider mt-0.5">
              ⚠️ {errors.corePainPoint}
            </p>
          )}
        </div>

        {/* THE KILLER FEATURE */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-sans tracking-[0.15em] font-bold text-[#1A1A1A] opacity-70 block">
            The "Killer Feature" (The Core Solution)
          </label>
          <input
            name="killerFeature"
            type="text"
            value={killerFeature}
            onChange={(e) => handleInputChange("killerFeature", e.target.value, setKillerFeature)}
            className={`bg-white border rounded-none px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-zinc-400 font-sans transition-all w-full outline-hidden focus:ring-2 focus:ring-black/5 ${
              errors.killerFeature ? "border-red-600 focus:border-red-650" : "border-black/15 focus:border-black"
            } ${shakingField === "killerFeature" ? "animate-shake" : ""}`}
            placeholder="e.g. 10-second micro-challenges with group accountability to never break streaks"
          />
          {errors.killerFeature && (
            <p className="text-[9px] text-red-650 font-sans font-bold uppercase tracking-wider mt-0.5">
              ⚠️ {errors.killerFeature}
            </p>
          )}
        </div>

        {/* TONE & PACING SETTINGS BLOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F1EFEC] p-4 border border-black/5 rounded-none">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-sans tracking-wider font-bold text-[#1A1A1A]/70 block">
              Creator Tone Style
            </label>
            <select
              value={creatorTone}
              onChange={(e) => setCreatorTone(e.target.value)}
              className="bg-white border border-black/15 focus:border-black rounded-none px-2.5 py-2 text-xs text-[#1A1A1A] outline-none cursor-pointer font-sans transition-all"
            >
              <option value="Sarcastic & Honest">Sarcastic & Honest</option>
              <option value="Empathetic Friend">Empathetic Friend</option>
              <option value="Excited Lifehacker">Excited Lifehacker</option>
              <option value="Casual & Relatable">Casual & Relatable</option>
              <option value="Deadpan & Witty">Deadpan & Witty</option>
              <option value="Overly Enthusiastic Fan">Overly Enthusiastic Fan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-sans tracking-wider font-bold text-[#1A1A1A]/70 block">
              Creator Speech Pacing
            </label>
            <select
              value={creatorPacing}
              onChange={(e) => setCreatorPacing(e.target.value)}
              className="bg-white border border-black/15 focus:border-black rounded-none px-2.5 py-2 text-xs text-[#1A1A1A] outline-none cursor-pointer font-sans transition-all"
            >
              <option value="natural">Natural Conversational</option>
              <option value="rapid-fast">Rapid-Fast (Punch Cuts)</option>
              <option value="relaxed">Relaxed & Reflective</option>
            </select>
          </div>
        </div>

        {/* IMMERSIVE GENERATION LOGS SKELETON LOADER WHEN ACTIVE */}
        {isGenerating && (
          <div className="bg-[#FAF9F6] border border-black/15 p-4 sm:p-5 rounded-none flex flex-col gap-4 animate-pulse">
            <div className="flex items-center justify-between border-b border-black/10 pb-2 select-none">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[9px] text-black font-sans tracking-[0.2em] font-bold uppercase">
                  Director AI Synthesizing Campaign
                </span>
              </div>
              <span className="text-[8px] font-mono font-bold bg-white border border-black/10 px-2 py-0.5">
                SPEED: 45 W/SEC
              </span>
            </div>

            <p className="text-xs text-[#1A1A1A] font-serif italic text-left leading-relaxed">
              Task progress: <span className="font-sans font-bold text-red-650">{steps[generationStep]}</span>
            </p>

            {/* Skeleton blocks representing script segments */}
            <div className="flex flex-col gap-3 mt-1.5 select-none">
              <div className="h-4 bg-[#F1EFEC]/85 w-3/4 rounded-none"></div>
              <div className="h-3 bg-[#F1EFEC]/50 w-5/6 rounded-none"></div>
              <div className="h-3.5 bg-[#F1EFEC]/75 w-1/2 rounded-none"></div>
            </div>

            {/* Micro-bar loader */}
            <div className="w-full h-[3px] bg-black/5 rounded-none overflow-hidden mt-2">
              <div 
                className="h-full bg-black rounded-none transition-all duration-350"
                style={{ width: `${(generationStep + 1) * 25}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* TRIGGER BUTTON */}
        <button
          type="submit"
          disabled={isGenerating}
          className={`py-3 px-5 rounded-none font-bold text-[11px] font-sans tracking-widest uppercase select-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isGenerating
              ? "bg-[#FAF9F6] border border-black/10 text-zinc-400 cursor-not-allowed"
              : "bg-black hover:bg-black/90 text-white active:scale-98 shadow-sm"
          }`}
        >
          <div className="w-4 h-4 rounded-none flex items-center justify-center">
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          {isGenerating ? "Synthesizing Campaign Brief..." : "Synthesize High-Converting UGC Brief"}
        </button>

      </form>
    </div>
  );
}
