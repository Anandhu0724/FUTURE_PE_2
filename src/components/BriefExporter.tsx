import React, { useState } from "react";
import { Download, Copy, Check, FileText, Share2, ClipboardSignature } from "lucide-react";
import { UGCProject, Hook } from "../types";

interface BriefExporterProps {
  project: UGCProject;
  activeHook: Hook;
  onExport?: () => void;
}

export default function BriefExporter({ project, activeHook, onExport }: BriefExporterProps) {
  const [copied, setCopied] = useState(false);

  // Generate the formatted Markdown brief text block
  const generateMarkdownBrief = () => {
    const totalDuration = project.masterScript.reduce((acc, s) => acc + s.duration, 0);
    
    return `# UGC CREATOR BRIEF & SHOOTING SCRIPT
Generated via UGC Script Workbench

## 🎬 Creative Direction Notes
- **Vibe & Delivery**: ${project.creatorDirectives.vibeDescription}
- **Clothing/Outfit Suggestions**: ${project.creatorDirectives.clothingSuggestions}
- **Camera Setup & Angles**: ${project.creatorDirectives.cameraSetup}
- **Target Video Duration**: ~${totalDuration} seconds (9:16 vertical video format)

## 🪝 Active Psychological Hook
- **Hook Style/Frame**: ${activeHook.type}
- **Psychological Strategy**: ${activeHook.concept}
- **Creator Action Directions**: ${activeHook.visualCue}
- **On-screen Cap Overlay**: ${activeHook.textOverlay}
- **Colloquial Spoken Line**: "${activeHook.audioLine}"

---

## 📽️ Chronological Shooting Script (Timeline)

${project.masterScript.map((segment) => {
  return `### Scene ${segment.segmentId}: ${segment.segmentName} (${segment.duration}s)
- **[Visual Cue / Actor Action]**: ${segment.visualCue}
- **[On-Screen Text Caption]**: ✨ ${segment.textOverlay}
- **[Audio delivery spoken monologue]**: "${segment.audioLine}"
`;
}).join("\n")}

---

## 📣 Ultimate Urgency Call To Actions (CTAs)
${project.ctas.map((cta, idx) => {
  return `### Option ${idx + 1}: ${cta.style}
- **Dynamic Button Text**: "${cta.phrase}"
- **Spoken CTA Monologue**: "${cta.spokenCta}"
- **Native text overlay**: "${cta.textOverlay}"
`;
}).join("\n")}

---
*Created using UGC Video Script Generator & Director @ 2026.*`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateMarkdownBrief());
    setCopied(true);
    if (onExport) onExport();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = generateMarkdownBrief();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `UGC_Creator_Brief_Script.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onExport) onExport();
  };

  return (
    <div id="brief-exporter-module" className="bg-white border border-black/15 rounded-none p-5 sm:p-6 shadow-sm w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3 font-sans">
        <div className="flex items-center gap-2">
          <ClipboardSignature className="w-4.5 h-4.5 text-black" />
          <h4 className="font-serif text-lg text-[#1A1A1A] tracking-tight font-medium">Camera Dispatch Brief</h4>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 bg-[#F1EFEC] hover:bg-black hover:text-white text-zinc-800 rounded-none text-[10px] tracking-wider uppercase font-bold transition-all border border-black/10 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Raw Brief
              </>
            )}
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-3 py-1.5 bg-black hover:bg-black/95 text-white rounded-none text-[10px] tracking-wider uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Brief .MD
          </button>
        </div>
      </div>

      <div className="bg-[#FAF9F6] rounded-none p-4 border border-black/10 text-zinc-700 text-xs leading-relaxed font-sans">
        Ready to dispatch this script to your UGC creators? Use this brief to copy directly into email threads, slack channels, or save it as a markdown file. It contains the complete campaign parameters (visual frames, captions, talking parts, and alternative dynamic hook variations for scaling performance).
      </div>

      {/* RAW TEXT FIELD SUMMARY PREVIEW */}
      <div className="bg-[#FAF9F6] border border-black/10 rounded-none p-4 h-[180px] overflow-y-auto font-mono text-[10px] text-zinc-600 select-text leading-relaxed whitespace-pre-wrap">
        {generateMarkdownBrief()}
      </div>
    </div>
  );
}
