import type {CategoryBeat} from '../types';

type CategoryOverlayProps = {
  beat: CategoryBeat;
  active: boolean;
};

export function CategoryOverlay({beat, active}: CategoryOverlayProps) {
  return (
    <article
      className={`category-overlay accent-${beat.accent} align-${beat.align} ${active ? 'is-active' : ''}`}
    >
      <p className="category-eyebrow">{beat.eyebrow}</p>
      <h3>{beat.label}</h3>
      <span className="category-line" />
      <p className="category-copy">{beat.description}</p>
    </article>
  );
}
