import {useMemo, useRef} from 'react';
import {categories} from '../data/categories';
import {useImageSequence} from '../hooks/useImageSequence';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useScrollProgress} from '../hooks/useScrollProgress';
import {getActiveBeat, quantizeProgress} from '../lib/motion';
import {Atmosphere} from './Atmosphere';
import {CategoryOverlay} from './CategoryOverlay';
import {SequenceCanvas} from './SequenceCanvas';

export function CinematicStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const prefersReducedMotion = useReducedMotion();
  const normalizedProgress = prefersReducedMotion ? quantizeProgress(progress) : progress;
  const {images, isReady} = useImageSequence();

  const activeBeat = useMemo(() => getActiveBeat(normalizedProgress, categories), [normalizedProgress]);

  return (
    <section className="sequence-section" ref={sectionRef}>
      <div className="sequence-sticky">
        <Atmosphere progress={normalizedProgress} />
        <div className="stage-headline">
          <p>Interactive sequence</p>
          <span>{String(Math.round(normalizedProgress * 100)).padStart(2, '0')} / 100</span>
        </div>
        <SequenceCanvas images={images} progress={normalizedProgress} ready={isReady} />
        <div className="overlay-grid">
          {categories.map((beat) => (
            <CategoryOverlay key={beat.id} beat={beat} active={activeBeat?.id === beat.id} />
          ))}
        </div>
        <div className="sequence-progress" aria-hidden="true">
          <span style={{transform: `scaleX(${normalizedProgress || 0.001})`}} />
        </div>
      </div>
    </section>
  );
}
