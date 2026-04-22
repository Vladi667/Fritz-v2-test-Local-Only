import type {CategoryBeat} from '../types';

export const categories: CategoryBeat[] = [
  {
    id: 'reach',
    label: 'Gesture',
    eyebrow: 'Category 01',
    description: 'The first reach sets the pace with deliberate, almost tailored restraint.',
    start: 0.08,
    end: 0.27,
    accent: 'glide',
    align: 'start',
  },
  {
    id: 'prepare',
    label: 'Spark',
    eyebrow: 'Category 02',
    description: 'The lighter enters with a sharper tempo and a more focused frame.',
    start: 0.28,
    end: 0.46,
    accent: 'lift',
    align: 'end',
  },
  {
    id: 'ignite',
    label: 'Ignition',
    eyebrow: 'Category 03',
    description: 'A warm ignition beat lands in the center of the scroll sequence.',
    start: 0.48,
    end: 0.7,
    accent: 'flare',
    align: 'start',
  },
  {
    id: 'settle',
    label: 'Ease',
    eyebrow: 'Category 04',
    description: 'Everything opens up into a slower, relaxed silhouette and cleaner breathing room.',
    start: 0.72,
    end: 0.96,
    accent: 'drift',
    align: 'end',
  },
];
