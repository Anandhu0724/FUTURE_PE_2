import React, { useState, useEffect } from "react";
import { 
  User, Mail, ArrowRight, Check, Shield, Award, Sparkles, 
  Share2, RefreshCw, BarChart3, Instagram, Twitter, Facebook, 
  HelpCircle, Settings, LogIn, Lock, CheckSquare, Eye, Copy, Download
} from "lucide-react";
import { UGCProject, Hook } from "../types";

export interface UserActivity {
  scriptsGenerated: number;
  rehearsalsRun: number;
  hooksSwapped: number;
  briefsExported: number;
  socialShares: number;
}

export interface UserProfileData {
  username: string;
  avatar: string; // 'director' | 'creator' | 'actor' | 'hustler'
  email: string;
  isLoggedIn: boolean;
  preferences: {
    teleprompterSpeed: number;
    preferredTone: string;
    brandColor: string;
  };
}

interface UserProfileProps {
  project: UGCProject;
  activeHook: Hook;
  activity: UserActivity;
  onUpdateActivity: (activity: Partial<UserActivity>) => void;
  onLoadPreferences: (prefs: { preferredTone: string; teleprompterSpeed: number }) => void;
  teleprompterSpeed: number;
  creatorTone: string;
}

const AVATARS = [
  { id: "director", label: "Creative Director", icon: "🎬", desc: "For campaign strategy & analytical buyers" },
  { id: "creator", label: "Pro UGC Maker", icon: "📱", desc: "For authentic vertical-talking content builders" },
  { id: "actor", label: "Talking Head Model", icon: "🗣️", desc: "For physical performance actors" },
  { id: "hustler", label: "D2C Brand Hustler", icon: "🔥", desc: "For rapid-scaling ecommerce founders" }
];

export default function UserProfile({ 
  project, 
  activeHook, 
  activity, 
  onUpdateActivity, 
  onLoadPreferences,
  teleprompterSpeed,
  creatorTone
}: UserProfileProps) {
  // Authentication & Profile States
  const [profile, setProfile] = useState<UserProfileData>(() => {
    const saved = localStorage.getItem("ugc_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      username: "Creative_Director_Pro",
      avatar: "director",
      email: "",
      isLoggedIn: false,
      preferences: {
        teleprompterSpeed: 140,
        preferredTone: "Sarcastic & Honest",
        brandColor: "black"
      }
    };
  });

  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear data confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Social Share State
  const [selectedMilestone, setSelectedMilestone] = useState<string>("script-ready");
  const [currentSocialPlatform, setCurrentSocialPlatform] = useState<"instagram" | "twitter" | "facebook">("twitter");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Save profile to local storage on changes
  useEffect(() => {
    localStorage.setItem("ugc_user_profile", JSON.stringify(profile));
  }, [profile]);

  // Handle Login & Signup Simulations
  const handleAuth = (type: "login" | "signup", e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setProfile(prev => ({
      ...prev,
      email: emailInput,
      username: usernameInput || emailInput.split("@")[0],
      isLoggedIn: true
    }));

    setSuccessMsg(`Successfully authenticated as ${usernameInput || emailInput.split("@")[0]}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLogout = () => {
    setProfile(prev => ({
      ...prev,
      isLoggedIn: false,
      email: ""
    }));
  };

  const handleSaveProfileChanges = () => {
    setProfile(prev => ({
      ...prev,
      username: usernameInput
    }));
    setIsEditingProfile(false);
    setSuccessMsg("Profile username updated successfully.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSelectAvatar = (avatarId: string) => {
    setProfile(prev => ({
      ...prev,
      avatar: avatarId
    }));
    setSuccessMsg(`Avatar updated to: ${AVATARS.find(a => a.id === avatarId)?.label}`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Synchronize Preferences into active form
  const handleApplySavedPrefs = () => {
    onLoadPreferences({
      preferredTone: profile.preferences.preferredTone,
      teleprompterSpeed: profile.preferences.teleprompterSpeed
    });
    setSuccessMsg("Your saved campaign configurations have been applied to the workspace form.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveCurrentPrefsAsDefault = () => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        teleprompterSpeed: teleprompterSpeed,
        preferredTone: creatorTone
      }
    }));
    setSuccessMsg("Successfully saved current workspace variables as your permanent default preferences!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Generate the smart campaign feedback tips based on activities and project specs
  const getSmartAdvisorTips = () => {
    const tips = [];
    
    // Check rehearsals activity
    if (activity.rehearsalsRun === 0) {
      tips.push({
        id: "rehearse",
        priority: "high",
        title: "Rehearsal Energy Rating: Untested",
        description: "Your camera-direct scripts haven't been practiced yet. Use the 'Play Preview' button under the screen canvas to rehearsal-tune your visual pacing."
      });
    } else if (activity.rehearsalsRun < 3) {
      tips.push({
        id: "rehearse-more",
        priority: "medium",
        title: "Pacing Calibration Active",
        description: "Good start! Aim for 3 mock script rehearsals to fully master the talk-pauses before shooting raw footage. Current speed is calibrated for " + teleprompterSpeed + " WPM."
      });
    }

    // Check hook swaps
    if (activity.hooksSwapped === 0) {
      tips.push({
        id: "hook-test",
        priority: "high",
        title: "Vulnerable to Single-Hook Fatigue",
        description: "Warning: Relying only on the default hook can raise Facebook/TikTok ad costs. Try swapping in our high-impact 'POV Relatability' alternate hook."
      });
    } else {
      tips.push({
        id: "hook-optimized",
        priority: "low",
        title: "Hook Strategy: Multi-Angle Calibrated",
        description: "Smart! Swapping hooks prepares alternate creator footage angles. This saves up to 45% in media buyer ad-spend optimization metrics."
      });
    }

    // Check exports
    if (activity.briefsExported === 0) {
      tips.push({
        id: "export-brief",
        priority: "medium",
        title: "Brief Offline Cache: Pending",
        description: "Ensure your creators stay aligned. Download the 'Camera Dispatch Brief' to send them standard lighting, clothes, and staging commands."
      });
    }

    // Custom recommendations based on active tone and speed
    if (creatorTone.toLowerCase().includes("sarcastic") || creatorTone.toLowerCase().includes("honest")) {
      tips.push({
        id: "tone-strategy",
        priority: "low",
        title: "Direct-Response Hook Insight",
        description: "Sarcastic & Honest copywriting draws 2.4x higher average hook-retention rate under tech-fatigued markets. Ensure the actor keeps a deadpan face in Scene 1."
      });
    }

    // Fallback default tip if things are fully optimized
    if (tips.length === 0) {
      tips.push({
        id: "fully-optimized",
        priority: "low",
        title: "UGC Staging Status: Direct-Response Champion",
        description: "Your activities indicate a highly optimized workflow! You've checked hooks, ran previews, and drafted your handoffs. Share the campaign to lock in the milestone."
      });
    }

    return tips;
  };

  // Dynamic share text generator
  const getShareSnippet = () => {
    const defaultBacklink = window.location.origin + "?app=" + encodeURIComponent(project.masterScript[0]?.textOverlay || "ugc-script-maker");
    switch (currentSocialPlatform) {
      case "twitter":
        return `🔥 Just built a campaign screenplay for my app "${project.masterScript[0]?.textOverlay}" using the Direct-Response Smartphone Method! 45s optimal vertical retention framework. Check out my UGC workspace design: ${defaultBacklink}`;
      case "instagram":
        return `📽️ UGC SCREENPLAY BRIEF CALIDRATION\nCampaign Name: ${project.masterScript[0]?.textOverlay}\nPlatform Format: 9:16 Tik-Tok/IG Reel\nActive Angle: ${activeHook.type} (${activeHook.concept})\nCompiled on UGC Studio: ${defaultBacklink}`;
      case "facebook":
        return `📣 I just synthesized a complete direct-response video ad flow for "${project.masterScript[0]?.textOverlay}". Standard horizontal ads are dead—using human face storytelling & hook variations to cut CPA by 65%. View app setup: ${defaultBacklink}`;
    }
  };

  const handleShareToPlatform = () => {
    // Increment social share activity
    onUpdateActivity({ socialShares: activity.socialShares + 1 });
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 4000);
  };

  const handleCopyShareLink = () => {
    const link = window.location.origin + "?app=" + encodeURIComponent(project.masterScript[0]?.textOverlay || "ugc-script-maker");
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Get selected avatar image representation
  const getAvatarEmoji = (id: string) => {
    return AVATARS.find(a => a.id === id)?.icon || "👤";
  };

  return (
    <div id="brand-strategy-desk" className="flex flex-col gap-6 bg-white border border-black/15 p-5 md:p-6 shadow-sm w-full select-none text-left">
      {/* HUB SECTION TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <User className="w-5 h-5 text-black" />
            <h3 className="text-xl font-serif text-[#1A1A1A] tracking-tight font-medium">UGC Studio Desk & Personal Advisor</h3>
          </div>
          <p className="text-xs font-sans text-zinc-650 mt-1">
            Configure profile credentials, track media KPIs, and load smart campaign calibrations.
          </p>
        </div>

        {/* LOGGED IN BADGE STAT */}
        {profile.isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#F1EFEC] text-zinc-800 font-mono border border-black/10 px-2 py-1 font-bold">
              {getAvatarEmoji(profile.avatar)} {profile.username}
            </span>
            <button 
              onClick={handleLogout}
              className="text-[9px] uppercase tracking-widest font-sans font-bold text-red-650 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <span className="text-[9px] uppercase tracking-wider font-bold bg-[#FAF9F6] border border-black/10 text-zinc-650 px-2 py-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-zinc-400" /> Guest Workstation
          </span>
        )}
      </div>

      {/* ERROR / SUCCESS NOTIFIER INSIDE COMPONENT */}
      {successMsg && (
        <div className="bg-[#FAF9F6] border border-green-700/30 p-3 rounded-none flex items-center gap-2 text-xs text-green-800 animate-fade-in font-sans font-medium">
          <CheckSquare className="w-4 h-4 text-green-700" />
          {successMsg}
        </div>
      )}

      {/* TWO COLUMN GRID: PROFILE SETTINGS OR AUTH / STATS & SMART AI ADVISOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN 1: INTEGRATED SIGN UP / LOGIN & SETTINGS */}
        <div className="flex flex-col gap-4">
          
          {/* USER SIGN-UP STATE CONDITIONAL */}
          {!profile.isLoggedIn ? (
            <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col gap-3 font-sans">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1">
                  <LogIn className="w-3.5 h-3.5" /> Initialize Creator Profile
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAuthView("login")} 
                    className={`text-[9px] uppercase tracking-wider font-bold ${authView === "login" ? "text-black underline" : "text-zinc-500 hover:text-black"}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setAuthView("signup")} 
                    className={`text-[9px] uppercase tracking-wider font-bold ${authView === "signup" ? "text-black underline" : "text-zinc-500 hover:text-black"}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-zinc-650">
                Create a secure brand operator profile to cache workspace scripts, customize avatars, and unlock smart video optimizations.
              </p>

              <form onSubmit={(e) => handleAuth(authView, e)} className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[8px] tracking-wider uppercase font-extrabold text-[#1A1A1A] block mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input 
                      type="email" 
                      placeholder="e.g. creative@brand.com"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full text-xs py-2 pl-8 pr-3 border border-black/15 bg-white text-black outline-none font-sans focus:border-black"
                    />
                  </div>
                </div>

                {authView === "signup" && (
                  <div>
                    <label className="text-[8px] tracking-wider uppercase font-extrabold text-[#1A1A1A] block mb-1">Handle / Username</label>
                    <input 
                      type="text" 
                      placeholder="e.g. UGC_Hustler_300"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full text-xs py-2 px-3 border border-black/15 bg-white text-black outline-none font-sans focus:border-black"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[8px] tracking-wider uppercase font-extrabold text-[#1A1A1A] block">Account Password</label>
                    {authView === "login" && <span className="text-[8px] text-zinc-500 hover:underline cursor-pointer">Forgot?</span>}
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-black/15 bg-white text-black outline-none font-sans focus:border-black"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-black hover:bg-black/90 text-white font-sans text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 border border-black"
                >
                  {authView === "login" ? "Unlock Workstation" : "Construct Profile"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* SOCIAL CONNECT SHORTCUTS */}
              <div className="mt-2 text-center">
                <span className="text-[8px] tracking-wider uppercase text-zinc-500 block font-bold mb-1.5">Or connect direct via social API</span>
                <div className="grid grid-cols-2 gap-2 text-black text-[9px] font-bold uppercase tracking-wider font-sans">
                  <button 
                    onClick={() => {
                      setProfile(prev => ({ ...prev, isLoggedIn: true, username: "TikTok_Partner_UGC", email: "tiktok@ugc.api" }));
                    }}
                    className="px-2.5 py-1.5 bg-[#FAF9F6] border border-black/10 hover:border-black/30 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    🎵 TikTok Connect
                  </button>
                  <button 
                    onClick={() => {
                      setProfile(prev => ({ ...prev, isLoggedIn: true, username: "Instagram_Stager", email: "instagram@ugc.api" }));
                    }}
                    className="px-2.5 py-1.5 bg-[#FAF9F6] border border-black/10 hover:border-black/30 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    📸 Meta Social
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // LOGGED IN: DISPLAY ACTIVE USER PROFILE CHANGER
            <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col gap-4 font-sans">
              
              {/* Profile card core */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-none bg-black border border-white/20 flex items-center justify-center text-3xl shadow-sm">
                  {getAvatarEmoji(profile.avatar)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isEditingProfile ? (
                      <input 
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onBlur={handleSaveProfileChanges}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveProfileChanges()}
                        className="text-sm font-bold border border-black/20 bg-white px-2 py-0.5 outline-none max-w-[150px] text-black"
                        autoFocus
                      />
                    ) : (
                      <h4 className="text-sm font-extrabold text-black font-sans leading-none flex items-center gap-1.5">
                        {profile.username}
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="text-[9px] text-zinc-500 hover:text-black font-normal underline cursor-pointer"
                        >
                          edit
                        </button>
                      </h4>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-550 mt-1 uppercase font-mono tracking-wider">
                    ROLE: {AVATARS.find(a => a.id === profile.avatar)?.label}
                  </p>
                  <p className="text-[9px] text-zinc-500 overflow-ellipsis truncate">{profile.email}</p>
                </div>
              </div>

              {/* Avatar Swapper Carousel */}
              <div className="border-t border-black/5 pt-3">
                <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold mb-2">Identify performance Avatar style</span>
                <div className="grid grid-cols-2 gap-2">
                  {AVATARS.map((av) => {
                    const isActive = profile.avatar === av.id;
                    return (
                      <button
                        key={av.id}
                        onClick={() => handleSelectAvatar(av.id)}
                        className={`p-2 rounded-none border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                          isActive 
                            ? "bg-black text-white border-black" 
                            : "bg-white border-black/10 hover:border-black/25 text-[#1A1A1A]"
                        }`}
                      >
                        <span className="text-md flex items-center justify-between w-full">
                          <span>{av.icon}</span>
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider block">{av.label}</span>
                        <span className={`text-[8px] mt-0.5 leading-snug block ${isActive ? "text-white/70" : "text-zinc-550"}`}>
                          {av.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prefs Auto Syncer & Saver Component */}
              <div className="border-t border-black/5 pt-3 flex flex-col gap-2.5">
                <span className="text-[8px] tracking-widest uppercase text-zinc-500 block font-bold">Workspace Preferences Tuning</span>
                
                <div className="bg-white border border-black/5 p-2.5 text-[11px] text-zinc-750 flex flex-col gap-1 inline-block">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Cached defaults:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono leading-relaxed text-black font-bold">
                    <span>⏱️ Scroller: {profile.preferences.teleprompterSpeed} WPM</span>
                    <span>🎭 Default Tone: {profile.preferences.preferredTone}</span>
                  </div>
                </div>

                <div className="flex gap-2 text-[9px] uppercase font-bold tracking-wider font-sans">
                  <button 
                    onClick={handleApplySavedPrefs}
                    className="flex-1 py-1.5 bg-[#F1EFEC] hover:bg-black hover:text-white text-zinc-800 border border-black/10 transition-colors cursor-pointer text-center"
                  >
                    📂 Load defaults to form
                  </button>
                  <button 
                    onClick={handleSaveCurrentPrefsAsDefault}
                    className="flex-1 py-1.5 bg-white hover:bg-[#F1EFEC] text-black border border-black/15 transition-colors cursor-pointer text-center"
                    title="Remember speed and tone preference"
                  >
                    💾 Save current layout as default
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PERFORMANCE COUNTERS BOX */}
          <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col gap-2.5 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1 border-b border-black/5 pb-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Direct Response Performance metrics
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-black">
              <div className="bg-white p-2 border border-black/5">
                <span className="text-xl font-mono font-bold block">{activity.scriptsGenerated}</span>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider block mt-0.5">Scripts Compiled</span>
              </div>
              <div className="bg-white p-2 border border-black/5">
                <span className="text-xl font-mono font-bold block">{activity.rehearsalsRun}</span>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider block mt-0.5">Rehearsals Played</span>
              </div>
              <div className="bg-white p-2 border border-black/5">
                <span className="text-xl font-mono font-bold block">{activity.socialShares}</span>
                <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-wider block mt-0.5">Shares Outward</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
              <div className="flex items-center justify-between bg-white border border-black/5 px-2 py-1">
                <span className="text-zinc-550">Hooks Interchanged:</span>
                <span className="font-mono font-bold text-black">{activity.hooksSwapped}</span>
              </div>
              <div className="flex items-center justify-between bg-white border border-black/5 px-2 py-1">
                <span className="text-zinc-550">Briefs Downloaded:</span>
                <span className="font-mono font-bold text-black">{activity.briefsExported}</span>
              </div>
            </div>

            {/* DESTRUCTIVE ACTION / WIPE CACHE PANEL */}
            <div className="border-t border-black/5 pt-2 flex flex-col gap-2 font-sans select-none">
              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full py-1.5 text-center text-[9px] uppercase tracking-widest font-sans font-bold text-zinc-550 hover:text-red-650 border border-dashed border-black/10 hover:border-red-650/40 bg-[#FAF9F6]/55 transition-all cursor-pointer"
                >
                  ⚠️ Reset Workspace & Wipe Cache History
                </button>
              ) : (
                <div className="bg-red-50/90 p-3 border border-red-200 flex flex-col gap-2.5 text-left transition-all animate-fade-in">
                  <p className="text-[10px] leading-relaxed text-red-950 font-bold">
                    Confirm Reset? This permanently deletes your cached screenplays, personalized default metrics, and custom briefs.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1 text-center text-[9px] uppercase tracking-wider font-extrabold bg-white border border-black/15 text-black hover:bg-zinc-100 cursor-pointer"
                    >
                      Keep Session
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="flex-1 py-1 text-center text-[9px] uppercase tracking-wider font-extrabold bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                    >
                      Delete Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMN 2: SMART CAMPAIGN ADVISOR & MILESTONE SHARE STATION */}
        <div className="flex flex-col gap-4">
          
          {/* USER SMART CREATIVE ADVISOR FEED */}
          <div className="bg-[#F1EFEC] border border-black/15 p-4 rounded-none flex flex-col gap-3 font-sans relative">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5 border-b border-black/10 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-black" /> Smart Copywriter & Advisor Feed
            </span>

            <div className="flex flex-col gap-2.5 max-h-[195px] overflow-y-auto pr-1">
              {getSmartAdvisorTips().map((tip) => (
                <div 
                  key={tip.id} 
                  className={`p-3 border text-left flex flex-col gap-1 select-text transition-all ${
                    tip.priority === "high" 
                      ? "bg-white border-l-4 border-l-red-650 border-black/10" 
                      : tip.priority === "medium"
                      ? "bg-white border-l-4 border-l-black border-black/10"
                      : "bg-[#FAF9F6]/80 border-l-4 border-l-zinc-400 border-black/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black font-sans block">
                      {tip.title}
                    </span>
                    <span className={`text-[7px] font-extrabold uppercase px-1.5 tracking-wider inline-block ${
                      tip.priority === "high" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-gray-200 text-zinc-700"
                    }`}>
                      {tip.priority} priority
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-700 leading-relaxed font-sans select-text mt-0.5">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SOCIAL SHARING HUB STATION */}
          <div className="bg-[#FAF9F6] border border-black/10 p-4 rounded-none flex flex-col gap-3 font-sans text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-1.5 border-b border-black/5 pb-2">
              <Share2 className="w-3.5 h-3.5 text-black" /> Brand Campaign Share Station
            </span>

            <p className="text-[11px] text-zinc-650">
              Select an optimized digital marketing milestone below to generate an organic, highly formatted brand card preview. Share it instantly online!
            </p>

            {/* MILESTONE SELECTION SLIDER */}
            <div className="grid grid-cols-3 gap-1.5 select-none font-sans text-[9px] tracking-wider uppercase font-extrabold">
              <button
                onClick={() => setSelectedMilestone("script-ready")}
                className={`py-1.5 px-2 border text-center transition-colors cursor-pointer ${
                  selectedMilestone === "script-ready" ? "bg-black text-white border-black" : "bg-white border-black/10 text-zinc-650 hover:bg-[#F1EFEC]"
                }`}
              >
                🎬 Script Vibe
              </button>
              <button
                onClick={() => setSelectedMilestone("perfect-rehearsal")}
                className={`py-1.5 px-2 border text-center transition-colors cursor-pointer ${
                  selectedMilestone === "perfect-rehearsal" ? "bg-black text-white border-black" : "bg-white border-black/10 text-zinc-650 hover:bg-[#F1EFEC]"
                }`}
              >
                ⏱️ Rehearsal Flow
              </button>
              <button
                onClick={() => setSelectedMilestone("hook-strategy")}
                className={`py-1.5 px-2 border text-center transition-colors cursor-pointer ${
                  selectedMilestone === "hook-strategy" ? "bg-black text-white border-black" : "bg-white border-black/10 text-zinc-650 hover:bg-[#F1EFEC]"
                }`}
              >
                🪝 Hook Deployed
              </button>
            </div>

            {/* REALISTIC VISUAL PREVIEW CARD OF SHARE PIECE */}
            <div className="bg-[#1A1A1A] border border-black rounded-none p-4 text-white relative flex flex-col gap-3 overflow-hidden select-text font-sans min-h-[140px] shadow-sm">
              
              {/* BRAND CARD BACKGROUND METRIC WATERMARK */}
              <div className="absolute right-2 bottom-2 text-[36px] font-bold font-mono text-white/5 uppercase select-none pointer-events-none tracking-tight">
                9:16 UGC
              </div>

              {/* STYLISH GRAPHICAL CHOPPED TEXT LINES */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 select-none">
                <span className="text-[10px] font-mono tracking-wider text-yellow-400 font-bold uppercase">
                  ⚡ CAMPAIGN MILESTONE LOCK
                </span>
                <span className="text-[8px] bg-red-650 text-white font-mono px-1 font-bold">
                  Verified Screenplay System
                </span>
              </div>

              {/* Dynamic content rendering based on selected milestone */}
              {selectedMilestone === "script-ready" && (
                <div className="text-left font-sans select-text">
                  <h5 className="text-xs font-serif italic text-white leading-snug">"Standard corporate ads are dead. Just synthesized a 45s conversational screenplay targeting {project.masterScript[3]?.textOverlay || "authentic painpoints"}"</h5>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/10 text-zinc-300 px-2 py-0.5 border border-white/5">
                      🎬 Script: {project.masterScript.length} scenes
                    </span>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/10 text-zinc-300 px-2 py-0.5 border border-white/5">
                      🎭 Tone: {creatorTone}
                    </span>
                  </div>
                </div>
              )}

              {selectedMilestone === "perfect-rehearsal" && (
                <div className="text-left font-sans select-text">
                  <h5 className="text-xs font-serif italic text-white leading-snug">"Calibrated natural voice pauses at {teleprompterSpeed} WPM in our live smartphone mockup. UGC performance pacing completely matched the sweet spot."</h5>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/10 text-zinc-300 px-2 py-0.5 border border-white/5">
                      ⏱️ speed: {teleprompterSpeed} WPM
                    </span>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/10 text-zinc-300 px-2 py-0.5 border border-white/5">
                      🌟 Status: Rehearsed
                    </span>
                  </div>
                </div>
              )}

              {selectedMilestone === "hook-strategy" && (
                <div className="text-left font-sans select-text">
                  <h5 className="text-xs font-serif italic text-white leading-snug">"Testing a psychology-based alternative hook variation. Adopting negative framing to completely shut down standard scroll-fatigue."</h5>
                  <div className="mt-2 flex flex-col gap-1 text-[9px] text-[#FAF9F6] italic select-text">
                    <span>🎬 Action Hook: {activeHook.concept}</span>
                    <span>📱 Cap Text: "{activeHook.textOverlay}"</span>
                  </div>
                </div>
              )}

              {/* BRAND SIGN OFF INFO */}
              <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] text-zinc-400 select-none">
                <span>Designed & verified at ugc-script-workbench</span>
                <span className="font-mono text-white tracking-widest">AUTHENTIC CONTENT HUB</span>
              </div>
            </div>

            {/* PLATFORM SELECTOR TABS & ACTION INJECT */}
            <div className="border-t border-black/5 pt-2.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] tracking-wider uppercase text-zinc-500 block font-bold">Transfer channel:</span>
                
                {/* Visual Platform Selection Buttons */}
                <div className="flex bg-[#F1EFEC] p-0.5 border border-black/5 gap-0.5">
                  <button
                    onClick={() => setCurrentSocialPlatform("twitter")}
                    className={`p-1 transition-colors cursor-pointer ${currentSocialPlatform === "twitter" ? "bg-white text-black font-bold border border-black/5" : "text-zinc-500 hover:text-black"}`}
                    title="Share to X / Twitter"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentSocialPlatform("instagram")}
                    className={`p-1 transition-colors cursor-pointer ${currentSocialPlatform === "instagram" ? "bg-white text-black font-bold border border-black/5" : "text-zinc-500 hover:text-black"}`}
                    title="Share to Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentSocialPlatform("facebook")}
                    className={`p-1 transition-colors cursor-pointer ${currentSocialPlatform === "facebook" ? "bg-white text-black font-bold border border-black/5" : "text-zinc-500 hover:text-black"}`}
                    title="Share to Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* PRE-FORMATTED RAW TEXT BOX FOR SOCIAL COPYING */}
              <div className="bg-white border border-black/10 p-2.5 h-[80px] overflow-y-auto font-mono text-[9px] text-zinc-600 select-text leading-normal whitespace-pre-wrap">
                {getShareSnippet()}
              </div>

              {/* ACTION CALL TO SHARES */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-2 bg-[#F1EFEC] hover:bg-[#FAF9F6] text-black border border-black/10 text-[9px] font-sans font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy direct share referral web link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> Copied Link!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy App referral link
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareToPlatform}
                  className="flex-1 py-2 bg-black hover:bg-black/95 text-white text-[9px] font-sans font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {currentSocialPlatform === "twitter" && <Twitter className="w-3.5 h-3.5" />}
                  {currentSocialPlatform === "instagram" && <Instagram className="w-3.5 h-3.5" />}
                  {currentSocialPlatform === "facebook" && <Facebook className="w-3.5 h-3.5" />}
                  Dispatch Share Post!
                </button>
              </div>

              {/* SUCCESS NOTICE SIMULATOR */}
              {shareSuccess && (
                <div className="bg-[#FAF9F6] border-2 border-black p-3 animate-fade-in text-[11px] text-[#1A1A1A] text-left">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="font-extrabold uppercase text-[9px] tracking-wider text-black">Share dispatched successfully!</span>
                  </div>
                  <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed">
                    Milestone published to simulated {currentSocialPlatform} feed with brand cards and active app workspace backlinks. Track metrics has been counted!
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
