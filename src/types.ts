export type AccentMode = 'glide' | 'lift' | 'flare' | 'drift';

export type CategoryBeat = {
  id: string;
  label: string;
  navLabel: string;
  eyebrow: string;
  italicLine: string;
  description: string;
  cta: string;
  start: number;
  end: number;
  accent: AccentMode;
  align: 'start' | 'end';
};
