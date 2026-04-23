import {useMemo, useRef} from 'react';
import {categories} from '../data/categories';
import {useImageSequence} from '../hooks/useImageSequence';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useScrollProgress} from '../hooks/useScrollProgress';
import {getActiveBeat, quantizeProgress} from '../lib/motion';
import {CategoryOverlay} from './CategoryOverlay';
import {SequenceCanvas} from './SequenceCanvas';

export function CinematicStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const prefersReducedMotion = useReducedMotion();
  const normalizedProgress = prefersReducedMotion ? quantizeProgress(progress) : progress;
  const {images, isReady} = useImageSequence();

  const activeBeat = useMemo(() => getActiveBeat(normalizedProgress, categories), [normalizedProgress]);
  const introVisible = normalizedProgress < 0.15;
  const endingVisible = normalizedProgress > 0.92;

  return (
    <section className="sequence-section" ref={sectionRef}>
      <div className="sequence-sticky">
        <SequenceCanvas images={images} progress={normalizedProgress} ready={isReady} />
        <div className={`title-overlay ${introVisible ? 'is-visible' : ''}`}>
          <p className="overlay-kicker">Fritz v2</p>
          <h1>One figure. One atmosphere.</h1>
          <p className="overlay-copy">The image becomes the world. The motion stays precise.</p>
        </div>
        <div className="overlay-grid">
          {categories.map((beat) => (
            <CategoryOverlay key={beat.id} beat={beat} active={activeBeat?.id === beat.id} />
          ))}
        </div>
        <div className={`end-overlay ${endingVisible ? 'is-visible' : ''}`}>
          <p className="overlay-kicker">Last beat</p>
          <h2>Only the personage remains.</h2>
        </div>
        <div className="scroll-prompt" aria-hidden="true">
          <span />
          <p>Scroll through the sequence</p>
        </div>
        <div className="sequence-progress" aria-hidden="true">
          <span style={{transform: `scaleX(${normalizedProgress || 0.001})`}} />
        </div>
      </div>
    </section>
  );
}
