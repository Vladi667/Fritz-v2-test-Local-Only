export type AccentMode = 'glide' | 'lift' | 'flare' | 'drift';

export type CategoryBeat = {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  start: number;
  end: number;
  accent: AccentMode;
  align: 'start' | 'end';
};
