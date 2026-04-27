export type AccentMode = 'glide' | 'lift' | 'flare' | 'drift';

export type CategoryBeat = {
  id: string;
  label: string;
  navLabel: string;
  eyebrow: string;
  italicLine: string;
  ghostWord?: string;
  verse?: string[];
  description: string;
  cta: string;
  href?: string;
  start: number;
  end: number;
  accent: AccentMode;
  align: 'start' | 'end';
  /** Optional overrides for the dedicated category page */
  pageTitle?: string;
  pageDescription?: string;
};
