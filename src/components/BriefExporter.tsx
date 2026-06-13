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
  const [copiedScript, setCopiedScript] = useState(false);

  // Generate script segments only in clear readable text block
  const generateSocialScriptText = () => {
    const totalDuration = project.masterScript.reduce((acc, s) => acc + s.duration, 0);
    
    const scenesText = project.masterScript.map((segment) => { // Map segments cleanly
      return `🎬 SCENE ${segment.segmentId}: ${segment.segmentName} (${segment.duration}s)
🎥 ACTION/VISUAL: ${segment.visualCue}
🗣️ DIALOGUE: "${segment.audioLine}"
📱 CAPTION: ✨ ${segment.textOverlay}`;
    }).join("\n\n");

    return `🎥 UGC VIDEO SCRIPT 🎥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ EST. DURATION: ~${totalDuration}s

🪝 ACTIVE HOOK STYLE: ${activeHook.type}
🗣️ HOOK DIALOGUE: "${activeHook.audioLine}"
📱 HOOK CAPTION: ✨ ${activeHook.textOverlay}
🎥 HOOK VISUAL: ${activeHook.visualCue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 SCENE-BY-SCENE STORYBOARD:

${scenesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📣 CALL TO ACTION (CTA) OPTIONS:
${project.ctas.map((cta, idx) => `
👉 Option ${idx + 1} (${cta.style}):
🗣️ Spoken: "${cta.spokenCta}"
📱 Caption: "${cta.textOverlay}"
🖱️ Button: "${cta.phrase}"`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via UGC Script Workbench`;
  };

  const handleCopyScriptOnly = () => {
    navigator.clipboard.writeText(generateSocialScriptText());
    setCopiedScript(true);
    if (onExport) onExport();
    setTimeout(() => setCopiedScript(false), 2000);
  };

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

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const totalDuration = project.masterScript.reduce((acc, s) => acc + s.duration, 0);

    let y = 20;
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - margin * 2;
    const limitY = 270;

    // Helper functions for page flow
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > limitY) {
        doc.addPage();
        y = 20;

        // Running Header
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text("UGC DIRECT-RESPONSE CREATOR BRIEF • PRODUCTION TIMELINE", margin, 12);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(margin, 14, pageWidth - margin, 14);
        y = 22;
      }
    };

    const drawSectionHeader = (title: string) => {
      checkPageBreak(18);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(139, 0, 0); // Crimson dark label
      doc.text(title.toUpperCase(), margin, y);
      y += 2;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    };

    const drawRow = (label: string, text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const cleanLabel = label + ": ";
      const labelWidth = 35;

      const wrappedText = doc.splitTextToSize(text, contentWidth - labelWidth);
      const textHeight = wrappedText.length * 4.5;
      const rowHeight = Math.max(5, textHeight + 2);

      checkPageBreak(rowHeight);

      doc.text(cleanLabel, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(wrappedText, margin + labelWidth, y);
      y += rowHeight;
    };

    // PAGE 1 HEADER
    doc.setFillColor(245, 244, 240);
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 24, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("CREATOR SHOOTING SCRIPT & BRIEF", margin + 5, y + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} • Format: 9:16 Vertical Video (UGC Sandbox)`, margin + 5, y + 14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`TARGET RUNTIME: ~${totalDuration}s`, pageWidth - margin - 45, y + 14);

    y += 28;

    // SECTION 1: CAMPAIGN DIRECTIVES
    drawSectionHeader("1. Creative Guidelines & Styling");
    drawRow("Vibe & Delivery", project.creatorDirectives.vibeDescription);
    drawRow("Outfit & Styling", project.creatorDirectives.clothingSuggestions);
    drawRow("Camera Tech Set", project.creatorDirectives.cameraSetup);

    y += 3;

    // SECTION 2: ATTENTION HOOK
    drawSectionHeader("2. Psychological Hook Variant");
    drawRow("Hook Style/Frame", activeHook.type);
    drawRow("Mental Hook", activeHook.concept);
    drawRow("Action Cue", activeHook.visualCue);
    drawRow("Caption Overlay", activeHook.textOverlay);
    doc.setFont("helvetica", "oblique");
    drawRow("Spoken Monologue", `"${activeHook.audioLine}"`);

    y += 3;

    // SECTION 3: CHRONOLOGICAL SHOOOTING TIMELINE
    drawSectionHeader("3. Chronological Script Shooting Board");

    project.masterScript.forEach((segment) => {
      // Calculate layout bounds for segment block
      const visualWrap = doc.splitTextToSize(segment.visualCue, 48);
      const textWrap = doc.splitTextToSize(segment.textOverlay, 48);
      const speechWrap = doc.splitTextToSize(`"${segment.audioLine}"`, 55);

      const maxTextLines = Math.max(visualWrap.length, textWrap.length, speechWrap.length);
      const blockHeight = maxTextLines * 4.5 + 16;

      checkPageBreak(blockHeight);

      // Draw light container background
      doc.setFillColor(250, 249, 246);
      doc.rect(margin, y, contentWidth, blockHeight, "F");
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.25);
      doc.rect(margin, y, contentWidth, blockHeight, "S");

      // Draw Segment header
      doc.setFillColor(30, 30, 30);
      doc.rect(margin, y, contentWidth, 6, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`SCENE ${segment.segmentId}: ${segment.segmentName.toUpperCase()}  (${segment.duration} seconds)`, margin + 3, y + 4.2);

      y += 8;

      // Draw columns titles
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 30, 30);
      doc.text("🎥 CAMERA & VISUAL ACTION", margin + 3, y);
      doc.text("📱 CAPTION OVERLAY", margin + 55, y);
      doc.text("🗣️ SPOKEN DIALOGUE", margin + 107, y);

      y += 3.5;

      // Draw dynamic wrap content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(visualWrap, margin + 3, y);
      doc.text(textWrap, margin + 55, y);
      
      doc.setFont("helvetica", "oblique");
      doc.setTextColor(10, 10, 10);
      doc.text(speechWrap, margin + 107, y);

      y += blockHeight - 11.5;
    });

    y += 4;

    // SECTION 4: CALL TO ACTIONS
    drawSectionHeader("4. Call to Action Variations");

    project.ctas.forEach((cta, idx) => {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(190, 0, 0);
      doc.text(`Option #${idx + 1}: ${cta.style.toUpperCase()}`, margin, y);
      y += 3.5;

      drawRow("Button Callout", cta.phrase);
      drawRow("Caption Text", cta.textOverlay);
      doc.setFont("helvetica", "oblique");
      drawRow("Spoken CTA Voice", `"${cta.spokenCta}"`);
      y += 2;
    });

    // Write footer counters on all pages
    const totalPagesCount = doc.getNumberOfPages();
    for (let pi = 1; pi <= totalPagesCount; pi++) {
      doc.setPage(pi);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${pi} of ${totalPagesCount} • UGC Workbench System @ 2026`, pageWidth - margin - 60, pageHeight - 10);
      doc.text("CONFIDENTIAL PRODUCTION SCRIPT - DO NOT DISTRIBUTE OUTSIDE TEAM", margin, pageHeight - 10);
    }

    // Trigger save
    doc.save("UGC_Production_Script_Brief.pdf");
    if (onExport) onExport();
  };

  return (
    <div id="brief-exporter-module" className="bg-white border border-black/15 rounded-none p-5 sm:p-6 shadow-sm w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3 font-sans">
        <div className="flex items-center gap-2">
          <ClipboardSignature className="w-4.5 h-4.5 text-black" />
          <h4 className="font-serif text-lg text-[#1A1A1A] tracking-tight font-medium">Camera Dispatch Brief</h4>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyScriptOnly}
            className="px-3 py-1.5 bg-[#FAF9F6] border border-black hover:bg-black hover:text-white text-zinc-900 rounded-none text-[10px] tracking-wider uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Copy clean script and active captions optimized for social media and messaging"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> Script Copied!
              </>
            ) : (
              <>
                <ClipboardSignature className="w-3.5 h-3.5 text-zinc-700" /> Copy Script to Clipboard
              </>
            )}
          </button>

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

          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-none text-[10px] tracking-wider uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-red-950"
            title="Download premium print-optimized PDF with full timeline blocks"
          >
            <FileText className="w-3.5 h-3.5 text-white" /> Export PDF (Printer Friendly)
          </button>
        </div>
      </div>

      <div className="bg-[#FAF9F6] rounded-none p-4 border border-black/10 text-zinc-700 text-xs leading-relaxed font-sans">
        Ready to dispatch this script to your UGC creators? Use this brief to copy directly into email threads, slack channels, or save it as a markdown file or printer-ready PDF. It contains the complete campaign parameters (visual frames, captions, talking parts, and alternative dynamic hook variations for scaling performance).
      </div>

      {/* RAW TEXT FIELD SUMMARY PREVIEW */}
      <div className="bg-[#FAF9F6] border border-black/10 rounded-none p-4 h-[180px] overflow-y-auto font-mono text-[10px] text-zinc-600 select-text leading-relaxed whitespace-pre-wrap">
        {generateMarkdownBrief()}
      </div>
    </div>
  );
}

