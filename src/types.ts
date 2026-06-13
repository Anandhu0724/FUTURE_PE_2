export interface Hook {
  type: string;
  concept: string;
  textOverlay: string;
  audioLine: string;
  visualCue: string;
}

export interface ScriptSegment {
  segmentId: number;
  segmentName: string;
  duration: number; // in seconds
  visualCue: string;
  textOverlay: string;
  audioLine: string;
}

export interface CTA {
  style: string;
  phrase: string;
  spokenCta: string;
  textOverlay: string;
}

export interface CreatorDirectives {
  vibeDescription: string;
  clothingSuggestions: string;
  cameraSetup: string;
}

export interface UGCProject {
  hooks: Hook[];
  masterScript: ScriptSegment[];
  ctas: CTA[];
  creatorDirectives: CreatorDirectives;
}

export interface PresetBrief {
  id: string;
  label: string;
  appName: string;
  appCategory: string;
  targetAudience: string;
  corePainPoint: string;
  killerFeature: string;
  creatorTone: string;
  creatorPacing: string;
  defaultProject: UGCProject;
}
