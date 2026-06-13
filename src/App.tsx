import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Smartphone, CheckSquare, ListVideo, BadgeAlert, Clapperboard, HelpCircle } from "lucide-react";
import { PRESET_BRIEFS } from "./data";
import { Hook, UGCProject, PresetBrief } from "./types";
import PhoneEmulator from "./components/PhoneEmulator";
import BriefForm from "./components/BriefForm";
import ScriptTimeline from "./components/ScriptTimeline";
import BriefExporter from "./components/BriefExporter";
import UserProfile, { UserActivity } from "./components/UserProfile";
import ScriptAnalytics from "./components/ScriptAnalytics";

export default function App() {
  // Preset defaults setup
  const defaultPreset = PRESET_BRIEFS[0]; // MBCeats canteen preordering

  // Attempt to parse shared configuration from URL query params
  const loadSharedState = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedData = params.get("share");
      if (sharedData) {
        // Decode safely preserving UTF-8 string values
        const decoded = decodeURIComponent(escape(atob(sharedData)));
        const parsed = JSON.parse(decoded);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse shared state", e);
    }
    return null;
  };

  const sharedConfig = loadSharedState();

  // App Brief Inputs initialized from cache or url sharing config
  const [appName, setAppName] = useState<string>(() => sharedConfig?.appName || localStorage.getItem("ugc_appName") || defaultPreset.appName);
  const [appCategory, setAppCategory] = useState<string>(() => sharedConfig?.appCategory || localStorage.getItem("ugc_appCategory") || defaultPreset.appCategory);
  const [targetAudience, setTargetAudience] = useState<string>(() => sharedConfig?.targetAudience || localStorage.getItem("ugc_targetAudience") || defaultPreset.targetAudience);
  const [corePainPoint, setCorePainPoint] = useState<string>(() => sharedConfig?.corePainPoint || localStorage.getItem("ugc_corePainPoint") || defaultPreset.corePainPoint);
  const [killerFeature, setKillerFeature] = useState<string>(() => sharedConfig?.killerFeature || localStorage.getItem("ugc_killerFeature") || defaultPreset.killerFeature);
  const [creatorTone, setCreatorTone] = useState<string>(() => sharedConfig?.creatorTone || localStorage.getItem("ugc_creatorTone") || defaultPreset.creatorTone);
  const [creatorPacing, setCreatorPacing] = useState<string>(() => sharedConfig?.creatorPacing || localStorage.getItem("ugc_creatorPacing") || defaultPreset.creatorPacing);

  // Active generated program structure
  const [project, setProject] = useState<UGCProject>(() => {
    if (sharedConfig?.project) {
      return sharedConfig.project;
    }
    const saved = localStorage.getItem("ugc_project");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultPreset.defaultProject;
  });

  // Active playback state
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeHookType, setActiveHookType] = useState<string>(() => sharedConfig?.activeHookType || localStorage.getItem("ugc_active_hook_type") || "Unpopular Opinion");

  // Interaction logs
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);
  const [sharedLoadedMessage, setSharedLoadedMessage] = useState<string | null>(null);

  // Lifted Teleprompter State initialized from cache or url sharing config
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(() => {
    if (sharedConfig?.teleprompterSpeed) {
      return Number(sharedConfig.teleprompterSpeed);
    }
    const saved = localStorage.getItem("ugc_teleprompter_speed");
    return saved ? Number(saved) : 140;
  });

  // Handle URL purification with success animation on component mount
  useEffect(() => {
    if (sharedConfig) {
      setSharedLoadedMessage(`Imported Campaign: "${sharedConfig.appName}" successfully compiled in workstation! You can customize hooks, tweak CTAs, or test layouts.`);
      const url = new URL(window.location.href);
      url.searchParams.delete("share");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, []);

  // Sync core workstation variables to localStorage
  useEffect(() => {
    localStorage.setItem("ugc_appName", appName);
    localStorage.setItem("ugc_appCategory", appCategory);
    localStorage.setItem("ugc_targetAudience", targetAudience);
    localStorage.setItem("ugc_corePainPoint", corePainPoint);
    localStorage.setItem("ugc_killerFeature", killerFeature);
    localStorage.setItem("ugc_creatorTone", creatorTone);
    localStorage.setItem("ugc_creatorPacing", creatorPacing);
  }, [appName, appCategory, targetAudience, corePainPoint, killerFeature, creatorTone, creatorPacing]);

  useEffect(() => {
    localStorage.setItem("ugc_project", JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem("ugc_active_segment_index", String(activeSegmentIndex));
  }, [activeSegmentIndex]);

  useEffect(() => {
    localStorage.setItem("ugc_active_hook_type", activeHookType);
  }, [activeHookType]);

  useEffect(() => {
    localStorage.setItem("ugc_teleprompter_speed", String(teleprompterSpeed));
  }, [teleprompterSpeed]);

  // User Activity Tracking
  const [activity, setActivity] = useState<UserActivity>(() => {
    const saved = localStorage.getItem("ugc_user_activity");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      scriptsGenerated: 2, // pre-populated defaults
      rehearsalsRun: 1,
      hooksSwapped: 1,
      briefsExported: 0,
      socialShares: 0
    };
  });

  // Persist user activities
  useEffect(() => {
    localStorage.setItem("ugc_user_activity", JSON.stringify(activity));
  }, [activity]);

  // Monitor playback play activity trigger
  useEffect(() => {
    if (isPlaying) {
      setActivity(prev => ({
        ...prev,
        rehearsalsRun: prev.rehearsalsRun + 1
      }));
    }
  }, [isPlaying]);

  // Update activities callback
  const handleUpdateActivity = (updated: Partial<UserActivity>) => {
    setActivity(prev => ({
      ...prev,
      ...updated
    }));
  };

  const handleLoadPreferences = (prefs: { preferredTone: string; teleprompterSpeed: number }) => {
    setCreatorTone(prefs.preferredTone);
    setTeleprompterSpeed(prefs.teleprompterSpeed);
  };

  // Load a pre-crafted theme
  const handleLoadPreset = (preset: PresetBrief) => {
    setAppName(preset.appName);
    setAppCategory(preset.appCategory);
    setTargetAudience(preset.targetAudience);
    setCorePainPoint(preset.corePainPoint);
    setKillerFeature(preset.killerFeature);
    setCreatorTone(preset.creatorTone);
    setCreatorPacing(preset.creatorPacing);
    
    // De-serialize preset project
    setProject(preset.defaultProject);
    setActiveSegmentIndex(0);
    setIsPlaying(false);
    setActiveHookType(preset.defaultProject.hooks[0]?.type || "Unpopular Opinion");
    setErrorMessage(null);
  };

  // Swap dynamic direct hook from hook-swapper into the active timeline
  const handleReplaceHook = (newHook: Hook) => {
    setActiveHookType(newHook.type);
    setActivity(prev => ({ ...prev, hooksSwapped: prev.hooksSwapped + 1 }));
    setProject((prev) => {
      const updatedScript = [...prev.masterScript];
      if (updatedScript.length > 0) {
        // Swap Hook (which resides in slot 0 or Hook Segment)
        updatedScript[0] = {
          ...updatedScript[0],
          segmentName: `Hook: ${newHook.type}`,
          textOverlay: newHook.textOverlay,
          audioLine: newHook.audioLine,
          visualCue: newHook.visualCue,
        };
      }
      return {
        ...prev,
        masterScript: updatedScript,
      };
    });

    // Preview hook instantly in phone emulator
    setActiveSegmentIndex(0);
    setIsPlaying(false);
  };

  // Trigger server-side AI script creation with backend
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setAlertSuccess(false);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          appCategory,
          targetAudience,
          corePainPoint,
          killerFeature,
          creatorTone,
          creatorPacing,
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

      const generatedProject: UGCProject = await response.json();
      setProject(generatedProject);
      setActivity(prev => ({ ...prev, scriptsGenerated: prev.scriptsGenerated + 1 }));
      
      // Reset playback metrics
      setActiveSegmentIndex(0);
      setIsPlaying(false);
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 3000);

      if (generatedProject.hooks && generatedProject.hooks.length > 0) {
        setActiveHookType(generatedProject.hooks[0].type);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback message with graceful instructions on environment set-up while preserving active state
      setErrorMessage(
        err.message || "Failed to establish a live connection with Gemini. Please verify that your process env secrets are active."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Find currently active hook matching hook category
  const activeHookObject = project.hooks.find(
    (h) => h.type.toLowerCase() === activeHookType.toLowerCase()
  ) || project.hooks[0];

  // Serializes structural parameter layout and script campaign structure into single URL
  const handleShareScript = () => {
    try {
      const stateToShare = {
        appName,
        appCategory,
        targetAudience,
        corePainPoint,
        killerFeature,
        creatorTone,
        creatorPacing,
        teleprompterSpeed,
        activeHookType,
        project,
      };
      const json = JSON.stringify(stateToShare);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      
      // Reward collaboration shares in stats
      setActivity((prev) => ({
        ...prev,
        socialShares: prev.socialShares + 1,
      }));

      return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    } catch (e) {
      console.error("Link serialization failed2", e);
      return window.location.href;
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] min-h-screen font-serif flex flex-col justify-between selection:bg-black selection:text-white antialiased">
      
      {/* EDITORIAL HEADER */}
      <header className="border-b border-black/10 bg-[#FAF9F6] sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-[#1A1A1A] text-white rounded-none">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold opacity-60">
                  UGC Creative Direction
                </span>
                <span className="text-[9px] font-mono border border-black/15 text-[#1A1A1A] px-1.5 py-0.2 rounded-none bg-white font-bold">
                  v2.4
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif tracking-tight mt-0.5 text-[#1A1A1A]">
                Campaign Generator: <span className="italic font-light">"The Smartphone Method"</span>
              </h1>
            </div>
          </div>

          {/* Sizing Indicator metrics to look highly crafted & professional */}
          <div className="flex items-center gap-4 text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A]">
            <div className="hidden md:flex items-center gap-1.5 bg-white border border-black/10 px-3 py-1.5 rounded-none text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse"></span>
              ● Live Preview
            </div>
            <div className="hidden lg:block text-[10px] bg-black text-white p-1.5 px-3.5 rounded-none font-sans font-extrabold">
              🎯 45s OPTIMAL
            </div>
          </div>
        </div>
      </header>

      {/* CORE CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full flex flex-col gap-8 transition-opacity duration-300">
        
        {/* BRAND STRATEGY DESK & CREATOR CONTROLS */}
        <UserProfile
          project={project}
          activeHook={activeHookObject}
          activity={activity}
          onUpdateActivity={handleUpdateActivity}
          onLoadPreferences={handleLoadPreferences}
          teleprompterSpeed={teleprompterSpeed}
          creatorTone={creatorTone}
        />

        {/* GRACEFUL ERROR OR SUCCESS NOTICES */}
        {errorMessage && (
          <div className="bg-[#F1EFEC] border border-black/15 p-5 rounded-none flex items-start gap-4 animate-fade-in text-left">
            <div className="p-2 bg-red-650 text-white rounded-none self-start">
              <BadgeAlert className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <h4 className="font-extrabold text-[10px] text-red-650 uppercase tracking-widest font-sans">
                Notice: Creator Connection Needed
              </h4>
              <p className="text-xs text-[#1A1A1A] leading-relaxed mt-1">
                {errorMessage}
              </p>
              <div className="mt-3 text-[11px] bg-white p-3 rounded-none border border-black/5 text-[#1A1A1A]/70">
                💡 **Editorial Note**: Feel free to use the **built-in visual templates** below! You can fully test, swap psychological hooks, and preview them inside the interactive 9:16 mobile mockup.
              </div>
            </div>
          </div>
        )}

        {alertSuccess && (
          <div className="bg-[#FAF9F6] border-2 border-black p-4 rounded-none flex items-center gap-3.5 animate-fade-in text-left">
            <div className="p-2 bg-black text-white rounded-none">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="font-sans">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-black">Campaign Script Synthesized</h4>
              <p className="text-xs text-[#1A1A1A]/85 mt-0.5">
                Gemini compiled conversational dialogue, native style overlays, and urgency calls.
              </p>
            </div>
          </div>
        )}

        {sharedLoadedMessage && (
          <div className="bg-[#FAF9F6] border-2 border-emerald-700 p-4 rounded-none flex items-start gap-3.5 animate-fade-in text-left relative">
            <div className="p-2 bg-emerald-700 text-white rounded-none self-start">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="font-sans flex-1">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-850 font-sans">Collaborator Script Loaded Successfully</h4>
              <p className="text-xs text-[#1A1A1A]/85 mt-0.5 leading-relaxed pr-8 font-sans">
                {sharedLoadedMessage}
              </p>
            </div>
            <button
              onClick={() => setSharedLoadedMessage(null)}
              className="absolute top-4 right-4 text-[10px] font-sans text-zinc-500 hover:text-black font-extrabold uppercase tracking-wider cursor-pointer"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* WORKSPACE SIDE-BY-SIDE SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CONTAINER (The creative brief and config panel) - 7 cols on large screens */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <BriefForm
              appName={appName}
              setAppName={setAppName}
              appCategory={appCategory}
              setAppCategory={setAppCategory}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              corePainPoint={corePainPoint}
              setCorePainPoint={setCorePainPoint}
              killerFeature={killerFeature}
              setKillerFeature={setKillerFeature}
              creatorTone={creatorTone}
              setCreatorTone={setCreatorTone}
              creatorPacing={creatorPacing}
              setCreatorPacing={setCreatorPacing}
              onGenerate={handleGenerateScript}
              isGenerating={isGenerating}
              onLoadPreset={handleLoadPreset}
            />

            <ScriptTimeline
              project={project}
              activeSegmentIndex={activeSegmentIndex}
              setActiveSegmentIndex={setActiveSegmentIndex}
              onReplaceHook={handleReplaceHook}
              activeHookType={activeHookType}
              teleprompterSpeed={teleprompterSpeed}
              setTeleprompterSpeed={setTeleprompterSpeed}
              onShareScript={handleShareScript}
              onUpdateSegments={(newSegments) => {
                setProject(prev => ({
                  ...prev,
                  masterScript: newSegments
                }));
              }}
            />

            <ScriptAnalytics
              project={project}
              activeHook={activeHookObject}
              creatorTone={creatorTone}
              creatorPacing={creatorPacing}
              teleprompterSpeed={teleprompterSpeed}
            />
          </div>

          {/* RIGHT CONTAINER (The vertical phone emulator and live teleprompter display) - 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            
            <div className="bg-white border border-black/15 rounded-none p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3 select-none">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-black" />
                  <h4 className="font-serif text-lg text-[#1A1A1A] tracking-tight font-medium">9:16 Video Canvas</h4>
                </div>
                <span className="text-[10px] font-mono text-zinc-650 bg-[#FAF9F6] px-2 py-0.5 rounded-none border border-black/10 font-bold">
                  60 FPS
                </span>
              </div>
              
              <PhoneEmulator
                project={project}
                activeSegmentIndex={activeSegmentIndex}
                setActiveSegmentIndex={setActiveSegmentIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </div>

            <BriefExporter
              project={project}
              activeHook={activeHookObject}
              onExport={() => setActivity(prev => ({ ...prev, briefsExported: prev.briefsExported + 1 }))}
            />

          </div>

        </div>

      </main>

      {/* DETAILED BOTTOM EDUCATIONAL FOOTER */}
      <footer className="border-t border-black/15 bg-white py-8 mt-12 select-none text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-zinc-650 font-sans">
            <div>
              <h5 className="font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 font-sans text-[10px] opacity-70">What makes UGC convert?</h5>
              <p className="leading-relaxed font-light">
                High-converting video ads ignore traditional product pitches. They start with an immediate emotional pattern-interrupt, show a relatable problem, introduce the app as an organic shortcut, and finish with a strong call-to-action.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 font-sans text-[10px] opacity-70">Direct Response Formula</h5>
              <p className="leading-relaxed font-light">
                Our templates strictly generate scripts containing negative frames and relatable POV angles. It focuses purely on authentic user-experience delivery rather than high-production commercial look.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 font-sans text-[10px] opacity-70">Handoff Guidelines</h5>
              <p className="leading-relaxed font-light">
                Send the exported markdown creator brief directly to your hired actors. They can load the screen caption prompts directly inside their smartphone while shooting their casual face-camera footage.
              </p>
            </div>
          </div>
          <div className="border-t border-black/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center font-sans">
            <p className="text-[11px] text-[#1A1A1A] opacity-60">
              UGC Script Generator & Teleprompter Workstation &copy; 2026. Powered by professional Gemini intelligence.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
              <span>Layout Status:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              <span>Fully Functional Editorial Preview</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
