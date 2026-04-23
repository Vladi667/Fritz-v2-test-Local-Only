import {useEffect, useMemo, useRef, useState} from 'react';
import {categories} from '../data/categories';
import {useImageSequence} from '../hooks/useImageSequence';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useScrollProgress} from '../hooks/useScrollProgress';
import {quantizeProgress} from '../lib/motion';
import {SequenceCanvas} from './SequenceCanvas';

type Scene = {
  id: string;
  navLabel: string;
  eyebrow: string;
  preludeLines?: string[];
  scrollHint?: string;
  title: string;
  italicLine?: string;
  description: string;
  cta: string;
  href: string;
  align: 'start' | 'end';
  kind: 'hero' | 'chapter';
};

function renderHeroTitle(title: string) {
  const parts = title.match(/Brands built with\s+quiet\s+power\./i);

  if (!parts) {
    return title;
  }

  return (
    <>
      <span className="scene-title__line">Brands built with</span>
      <span className="scene-title__line scene-title__quiet">quiet</span>
      <span className="scene-title__line">power.</span>
    </>
  );
}

const joinScene: Scene = {
  id: 'join-the-adventure',
  navLabel: 'Join the Adventure',
  eyebrow: 'Join the Adventure',
  title: 'Join the Adventure',
  italicLine: 'Some brands ask for visibility. Others build a world people want to enter.',
  description:
    'FRITZ brings together UX/UI, cinematic direction, Superpower, and Remotion to shape digital experiences that feel less like marketing and more like gravity.',
  cta: 'Join the Adventure',
  href: '#arrival',
  align: 'end',
  kind: 'chapter',
};

export function CinematicStage() {
  const storyRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Record<string, HTMLElement | null>>({});
  const progress = useScrollProgress(storyRef);
  const prefersReducedMotion = useReducedMotion();
  const normalizedProgress = prefersReducedMotion ? quantizeProgress(progress) : progress;
  const {images, isReady} = useImageSequence();

  const scenes = useMemo<Scene[]>(
    () => [
      {
        id: 'arrival',
        navLabel: 'Arrival',
        eyebrow: 'FRITZ',
        preludeLines: ['Certain worlds do not present themselves.', 'They are discovered in silence.'],
        scrollHint: 'Scroll to enter',
        title: 'Brands built with quiet power.',
        description:
          'FRITZ creates digital experiences, brand worlds, and growth systems for businesses that want to look sharper, feel rarer, and scale with control.',
        cta: 'Enter FRITZ',
        href: '#website-creation',
        align: 'start',
        kind: 'hero',
      },
      ...categories.map((category) => ({
        id: category.id,
        navLabel: category.navLabel,
        eyebrow: category.eyebrow,
        title: category.label,
        italicLine: category.italicLine,
        description: category.description,
        cta: category.cta,
        href: `#${category.id}`,
        align: category.align,
        kind: 'chapter' as const,
      })),
      joinScene,
    ],
    [],
  );

  const navigationItems = useMemo(
    () => scenes.map(({id, navLabel}) => ({id, label: navLabel})),
    [scenes],
  );

  const [revealedScenes, setRevealedScenes] = useState<Record<string, boolean>>({arrival: true});
  const [activeSceneId, setActiveSceneId] = useState<string>('arrival');

  useEffect(() => {
    const nodes = scenes
      .map((scene) => sceneRefs.current[scene.id])
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    if (nodes.length === 0) {
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        setRevealedScenes((current) => {
          let changed = false;
          const next = {...current};

          for (const entry of entries) {
            const id = entry.target.id;
            if (entry.isIntersecting && !next[id]) {
              next[id] = true;
              changed = true;
            }
          }

          return changed ? next : current;
        });
      },
      {
        threshold: 0.22,
        rootMargin: '0px 0px -12% 0px',
      },
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const activeEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (activeEntries.length === 0) {
          return;
        }

        const nextActiveScene = activeEntries[0].target.id;
        setActiveSceneId((current) => (current === nextActiveScene ? current : nextActiveScene));
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: '-18% 0px -18% 0px',
      },
    );

    for (const node of nodes) {
      revealObserver.observe(node);
      activeObserver.observe(node);
    }

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [scenes]);

  const registerScene = (id: string) => (node: HTMLElement | null) => {
    sceneRefs.current[id] = node;
  };

  const getOppositeAlign = (align: Scene['align']) => (align === 'start' ? 'end' : 'start');

  return (
    <div className="fritz-home">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brandmark" href="#arrival" aria-label="Go to FRITZ arrival">
            FRITZ
          </a>
          <nav className="site-nav" aria-label="Primary">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="site-nav__link"
                data-active={activeSceneId === item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="story-viewport" ref={storyRef}>
        <div className="story-stage" aria-hidden="true">
          <div className="story-stage__backdrop" data-testid="story-stage-backdrop" />
          <div
            className="story-stage__backdrop story-stage__backdrop--veil"
            data-testid="story-stage-backdrop-veil"
          />
          <SequenceCanvas
            images={images}
            progress={normalizedProgress}
            ready={isReady}
            subjectScale={0.76}
          />
          <div className="story-stage__vignette" />
          <div className="story-stage__shadow" />
        </div>

        <div
          className="story-progress"
          aria-label="Discovery progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(normalizedProgress * 100)}
          role="progressbar"
        >
          <span style={{transform: `scaleY(${Math.max(normalizedProgress, 0.04)})`}} />
        </div>

        {scenes.map((scene, index) => {
          const isVisible = revealedScenes[scene.id] ?? prefersReducedMotion;
          const isHero = scene.kind === 'hero';
          const quoteAlign = getOppositeAlign(scene.align);
          const secondaryHref = isHero ? '#paths' : '#join-the-adventure';
          const secondaryLabel = isHero ? 'Explore the paths' : undefined;

          return (
            <section
              key={scene.id}
              id={scene.id}
              ref={registerScene(scene.id)}
              className={`scene scene--${scene.align} scene--${scene.kind} ${isVisible ? 'is-visible' : ''}`}
              aria-labelledby={`${scene.id}-title`}
            >
              {index === 1 ? <div id="paths" className="scene-anchor" aria-hidden="true" /> : null}
              <div className="scene-grid">
                {isHero && scene.preludeLines ? (
                  <div className="scene-prelude scene-prelude--landing scene-prelude--split" aria-label="Arrival introduction">
                    <p className="scene-italic scene-prelude__line scene-prelude__line--left">
                      {scene.preludeLines[0]}
                    </p>
                    <p className="scene-italic scene-prelude__line scene-prelude__line--right">
                      {scene.preludeLines[1]}
                    </p>
                    {scene.scrollHint ? (
                      <p className="scene-scroll-hint scene-scroll-hint--landing">{scene.scrollHint}</p>
                    ) : null}
                  </div>
                ) : null}
                {!isHero && scene.italicLine ? (
                  <div className={`scene-quote scene-quote--${quoteAlign} scene-quote--center`}>
                    <p className="scene-italic">{scene.italicLine}</p>
                  </div>
                ) : null}
                <div className={`scene-copy scene-copy--${scene.align}`}>
                  <p className="scene-eyebrow">{scene.eyebrow}</p>
                  {isHero ? (
                    <h1 id={`${scene.id}-title`} className="scene-title scene-title--hero">
                      {renderHeroTitle(scene.title)}
                    </h1>
                  ) : (
                    <h2 id={`${scene.id}-title`} className="scene-title scene-title--chapter">
                      {scene.title}
                    </h2>
                  )}
                  {scene.scrollHint && !isHero ? (
                    <p className={`scene-scroll-hint ${isHero ? 'scene-scroll-hint--landing' : ''}`}>{scene.scrollHint}</p>
                  ) : null}
                  <p className="scene-body">{scene.description}</p>
                  <div className="scene-actions">
                    <a className="button-link button-link--primary" href={scene.href}>
                      {scene.cta}
                    </a>
                    {secondaryLabel ? (
                      <a className="button-link button-link--secondary" href={secondaryHref}>
                        {secondaryLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <footer className="site-footer">
        <p>Built with restraint. Designed for impact.</p>
      </footer>
    </div>
  );
}
