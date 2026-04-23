import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import {categories} from '../data/categories';
import {useImageSequence} from '../hooks/useImageSequence';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {useScrollProgress} from '../hooks/useScrollProgress';
import {quantizeProgress} from '../lib/motion';
import {SequenceCanvas} from './SequenceCanvas';

const INTRO_LINES = ['Certain worlds do not present themselves.', 'They are discovered in silence.'];
const INTRO_SCROLL_HINT = 'Scroll to enter';
const INTRO_FADE_DELAY_MS = 2500;
const INTRO_TOTAL_MS = 3600;

type Scene = {
  id: string;
  navLabel?: string;
  eyebrow: string;
  title: string;
  italicLine?: string;
  description: string;
  cta: string;
  href: string;
  align: 'start' | 'end';
  kind: 'hero' | 'chapter';
  secondaryCta?: string;
  secondaryHref?: string;
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

const heroScene: Scene = {
  id: 'fritz-introduction',
  eyebrow: 'FRITZ',
  title: 'Brands built with quiet power.',
  description:
    'FRITZ creates digital experiences, brand worlds, and growth systems for businesses that want to look sharper, feel rarer, and scale with control.',
  cta: 'Enter FRITZ',
  href: '#join-the-adventure',
  secondaryCta: 'Explore the paths',
  secondaryHref: '#brand-design',
  align: 'start',
  kind: 'hero',
};

const joinScene: Scene = {
  id: 'join-the-adventure',
  navLabel: 'Join the Adventure',
  eyebrow: 'Join the Adventure',
  title: 'Join the Adventure',
  italicLine: 'Some brands ask for visibility. Others build a world people want to enter.',
  description:
    'FRITZ brings together UX/UI, cinematic direction, Superpower, and Remotion to shape digital experiences that feel less like marketing and more like gravity.',
  cta: 'Join the Adventure',
  href: '#website-creation',
  align: 'start',
  kind: 'chapter',
};

type IntroPhase = 'visible' | 'fading' | 'done';

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
        ...categories[0],
        title: categories[0].label,
        href: `#${categories[0].id}`,
        kind: 'chapter' as const,
      },
      heroScene,
      ...categories.slice(1).map((category) => ({
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

  const firstSceneId = scenes[0]?.id ?? 'website-creation';
  const navigationItems = useMemo(
    () => scenes.filter((scene) => scene.navLabel).map(({id, navLabel}) => ({id, label: navLabel!})),
    [scenes],
  );
  const stageStyle = useMemo(
    () =>
      ({
        '--backdrop-scale': `${(1 + normalizedProgress * 0.075).toFixed(4)}`,
        '--backdrop-shift-y': `${(normalizedProgress * -30).toFixed(2)}px`,
        '--backdrop-veil-opacity': `${(0.9 + normalizedProgress * 0.08).toFixed(3)}`,
        '--backdrop-vignette-opacity': `${(0.86 + normalizedProgress * 0.12).toFixed(3)}`,
      }) as CSSProperties,
    [normalizedProgress],
  );

  const [revealedScenes, setRevealedScenes] = useState<Record<string, boolean>>(() => ({[firstSceneId]: true}));
  const [activeSceneId, setActiveSceneId] = useState<string>(firstSceneId);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(prefersReducedMotion ? 'done' : 'visible');

  useEffect(() => {
    if (prefersReducedMotion) {
      setIntroPhase('done');
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIntroPhase('fading');
    }, INTRO_FADE_DELAY_MS);

    const doneTimer = window.setTimeout(() => {
      setIntroPhase('done');
    }, INTRO_TOTAL_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [prefersReducedMotion]);

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
    <div className={`fritz-home ${introPhase !== 'done' ? 'fritz-home--intro' : ''}`}>
      <header className="site-header">
        <div className="site-header__inner">
          <a className="brandmark" href={`#${firstSceneId}`} aria-label="Go to FRITZ homepage">
            <img className="brandmark__logo" src="/assets/brand/fritz-logo.png" alt="FRITZ" />
          </a>
          <div className="site-nav-shell">
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
        </div>
      </header>

      {introPhase !== 'done' ? (
        <div
          className={`loading-intro ${introPhase === 'fading' ? 'loading-intro--fading' : 'loading-intro--visible'}`}
          aria-label="Loading introduction"
        >
          <div className="loading-intro__inner">
            <div className="loading-intro__sequence" aria-hidden="true">
              <p className="scene-italic loading-intro__line loading-intro__line--first">{INTRO_LINES[0]}</p>
              <p className="scene-italic loading-intro__line loading-intro__line--second">{INTRO_LINES[1]}</p>
            </div>
            <p className="scene-scroll-hint scene-scroll-hint--landing scene-scroll-hint--compact loading-intro__hint">
              {INTRO_SCROLL_HINT}
            </p>
          </div>
        </div>
      ) : null}

      <div className="story-viewport" data-testid="story-viewport" ref={storyRef} style={stageStyle}>
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
          const quoteAlign = getOppositeAlign(scene.align);
          const isLandingScene = index === 0;
          const isHero = scene.kind === 'hero';

          return (
            <section
              key={scene.id}
              id={scene.id}
              ref={registerScene(scene.id)}
              className={`scene scene--${scene.align} scene--${scene.kind} ${isLandingScene ? 'scene--landing' : ''} ${isVisible ? 'is-visible' : ''}`}
              data-active={activeSceneId === scene.id}
              aria-labelledby={`${scene.id}-title`}
            >
              {isLandingScene ? <div id="paths" className="scene-anchor" aria-hidden="true" /> : null}
              <div className="scene-grid">
                {scene.italicLine && !isHero ? (
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
                  <p className="scene-body">{scene.description}</p>
                  <div className="scene-actions">
                    <a className="button-link button-link--primary" href={scene.href}>
                      {scene.cta}
                    </a>
                    {scene.secondaryCta && scene.secondaryHref ? (
                      <a className="button-link button-link--secondary" href={scene.secondaryHref}>
                        {scene.secondaryCta}
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
