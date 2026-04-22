# Personage Scroll Cinematic Landing Page Design

Date: 2026-04-23
Status: Draft approved in chat, pending written-spec review

## Project intent

Build a single-page cinematic landing page that uses the provided frame sequence of the personage to create a scroll-driven narrative. The experience should begin as a composed title moment, then progressively reveal four categories while the subject moves through a realistic action arc: reaching for the cigar, bringing in the lighter, ignition, then relaxed smoking. The page should end on a calm closing section.

## Goals

- Make scroll feel like directing a short fashion-film moment rather than browsing a normal landing page
- Keep the background simple and neutral so the clothes, posture, and gesture remain the focus
- Reveal four categories as discoveries inside the motion, not as generic cards below the hero
- Maintain even perceived lighting and visual continuity across the action
- Keep the experience performant on desktop and mobile with reduced-motion support

## Non-goals

- No extra photo galleries or secondary pages in this phase
- No placeholder image panels beyond subtle SVG atmosphere
- No dense product-marketing sections, stats grids, or standard feature-card layouts

## Experience concept

### Visual thesis

A restrained neo-noir editorial with bone, stone, taupe, tobacco, charcoal, and muted brass. The subject carries the spectacle; the interface stays quiet, architectural, and precise.

### Narrative arc

1. Opening poster-like title frame
2. Reach: the first category appears as the subject begins to pick up the cigar
3. Preparation: the second category appears as the lighter enters the gesture
4. Ignition: the third category appears at the lighting beat with the strongest scroll emphasis
5. Ease: the fourth category appears as the subject settles into a relaxed smoking rhythm
6. Ending frame with a concise closing message / CTA

### Category posture

Each category is a cinematic chapter, not a card. Categories appear as framed typographic callouts or architectural labels that slide, mask, or drift into place around the sticky stage. Each contains:

- category title
- one short descriptor line
- minimal directional cue or index marker

## Information architecture

### Sections

1. Hero intro
2. Sticky scroll stage covering the full action arc
3. End section

### Sticky stage internals

The sticky stage is one full-screen pinned viewport whose internal progress is driven by a taller scroll container. Within that pinned stage:

- the image sequence plays continuously
- atmospheric SVG layers move at slower parallax rates
- category overlays appear at specific progress thresholds
- the background tone shifts subtly between neutral variants

## Interaction design

### Primary interaction

Scroll scrubs through the provided frame sequence. Progress is mapped smoothly to the full image set so the subject motion feels fluid and realistic.

### Motion language

- The personage remains the anchor and should not jump between layout contexts
- Scroll velocity is eased in software so transitions feel cinematic rather than mechanical
- Category reveals use distinct entrance behaviors to avoid repetition
- Background movement stays subordinate to the subject action

### Planned reveal behaviors

- Category 1: lateral glide with masked text uncover
- Category 2: soft vertical lift with line-draw accent
- Category 3: ignition reveal with restrained flash / glow pulse and tighter framing cue
- Category 4: drifting dissolve with relaxed spacing and slower text motion
- Ending: gentle fade and settle, avoiding dramatic exit effects

### Depth system

Use a three-plane composition:

- background plane: soft radial gradients, paper-like texture, subtle vignette
- subject plane: image sequence or canvas-rendered frame playback
- foreground plane: category labels, linework, smoke-like SVG strokes, and minimal UI chrome

## Visual system

### Palette

- bone: warm light background for opening and closing
- stone: neutral field for most of the sticky sequence
- taupe: supporting surfaces and soft gradients
- charcoal: primary text and fine lines
- muted brass: small accent for cues and ignition emphasis

### Typography

Use one expressive editorial display face and one restrained sans or serif companion. The title should feel poster-like; category labels should feel sharp and architectural. Copy remains minimal.

### Atmosphere

SVG-only atmospheric details:

- drifting smoke contours
- tapered linework
- subtle grain or woven texture effect
- soft circular light fields behind the subject

These should echo the clothing texture and design language without competing with the figure.

## Content plan

### Hero

- title
- short supporting line
- scroll cue

### Categories

Four discoverable category moments integrated into the sticky stage. Final category names can be filled during implementation if not provided by the user, but the structure expects concise, premium labels.

### End

- short closing line
- optional CTA or anchor action

## Technical design

### Build approach

Create a modern front-end project suited for a single premium landing page. Preferred implementation shape:

- React-based app
- smooth scroll-linked animation using browser-native scroll progress plus lightweight interpolation
- image-sequence playback rendered via canvas for performance and precise frame control
- SVG overlays for atmosphere and linework

If the repo remains empty, scaffold a minimal Vite React app because it is fast to stand up for a single-page experience and keeps the animation logic straightforward.

### Assets

- Extract the ZIP into a local assets directory
- Normalize file ordering and preload critical frames
- Generate an indexable frame list for deterministic playback

### Responsive behavior

- Desktop: full cinematic stage with generous negative space around the subject
- Mobile: preserve the pinned sequence, but simplify overlay positions and reduce atmospheric density
- Maintain readable text in safe zones away from the figure

### Reduced motion

When reduced motion is preferred:

- replace frame scrubbing with sparse key stills or heavily reduced frame stepping
- minimize parallax and glow pulses
- keep content fully readable without motion dependency

## Error handling and performance

- Preload an initial frame range so the first visual state appears immediately
- Use progressive frame readiness to avoid blank flashes during scroll
- Cap expensive effects; no large blur stacks or continuous heavy filters
- Fallback gracefully if some frames fail to load

## Testing strategy

- Verify smooth scroll progression across desktop and mobile viewport sizes
- Confirm category thresholds appear at the intended motion beats
- Check that the subject remains visually continuous through all sections
- Validate reduced-motion behavior
- Perform a final visual pass for spacing, contrast, and atmosphere restraint

## Open implementation choices already resolved

- Use a single-page landing experience
- Use four discoverable categories
- Use only SVG atmosphere for supporting detail in this phase
- Use a cinematic “surprise me” direction rather than a literal film homage surfaced in the UI

## Risks and mitigations

### Risk: sequence playback feels choppy

Mitigation: preload strategically, use canvas drawing, and smooth scroll progress with interpolation.

### Risk: category overlays feel like generic marketing UI

Mitigation: treat them as typographic scene markers with distinct entrance choreography, not boxed cards.

### Risk: atmosphere muddies the clothing silhouette

Mitigation: keep SVG detail low-contrast and keep the figure plane visually dominant.

## Delivery plan

1. Scaffold the front-end app if needed
2. Extract and organize the frames
3. Build the sticky cinematic stage and frame scrubber
4. Add category choreography and SVG atmosphere
5. Refine responsive and reduced-motion behavior
6. Verify visually and tune timing

## Implementation notes

- The production build will use a Vite + React + TypeScript stack for fast local iteration.
- The four category reveals are currently labeled `Gesture`, `Spark`, `Ignition`, and `Ease`.
- Reduced-motion mode will quantize the scrubbed sequence into calmer key beats instead of full continuous playback.

## Spec self-review

- No placeholder TBD sections remain
- Scope is constrained to one landing page
- Architecture matches the requested motion-first experience
- Requirements are specific enough to move into implementation planning
