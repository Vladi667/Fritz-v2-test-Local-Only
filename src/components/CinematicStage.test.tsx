import {render, screen, within} from '@testing-library/react';
import {CinematicStage} from './CinematicStage';

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

vi.mock('../hooks/useImageSequence', () => ({
  useImageSequence: () => ({
    images: [],
    isReady: true,
  }),
}));

vi.mock('../hooks/useScrollProgress', () => ({
  useScrollProgress: () => 0,
}));

vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('./SequenceCanvas', () => ({
  SequenceCanvas: () => <div data-testid="sequence-canvas" />,
}));

describe('CinematicStage', () => {
  it('shows the poetic arrival copy in italic and the discovery progress indicator', () => {
    render(<CinematicStage />);

    expect(screen.getByTestId('story-stage-backdrop')).toHaveClass('story-stage__backdrop');
    expect(screen.getByTestId('story-stage-backdrop-veil')).toHaveClass(
      'story-stage__backdrop',
      'story-stage__backdrop--veil',
    );
    const landingPrelude = screen.getByLabelText('Arrival introduction');
    expect(landingPrelude).toHaveClass('scene-prelude', 'scene-prelude--landing', 'scene-prelude--split');
    const leftLine = screen.getByText('Certain worlds do not present themselves.');
    const rightLine = screen.getByText('They are discovered in silence.');
    expect(leftLine).toHaveClass('scene-italic', 'scene-prelude__line', 'scene-prelude__line--left');
    expect(rightLine).toHaveClass('scene-italic', 'scene-prelude__line', 'scene-prelude__line--right');
    const landingScrollHint = within(landingPrelude).getByText('Scroll to enter');
    expect(landingScrollHint).toHaveClass('scene-scroll-hint', 'scene-scroll-hint--landing');
    expect(screen.getByLabelText('Discovery progress')).toBeInTheDocument();
  });

  it('treats quiet as a distinct cinematic line in the hero title', () => {
    render(<CinematicStage />);

    const quietLine = screen.getByText('quiet');
    expect(quietLine).toBeInTheDocument();
    expect(quietLine).toHaveClass('scene-title__quiet');
    expect(quietLine.closest('.scene-title--hero')).toBeInTheDocument();
  });

  it('renders chapter italic lines on the opposite side with the updated brand sentence', () => {
    render(<CinematicStage />);

    const brandSection = screen.getByLabelText('Brand Design');
    const brandQuote = within(brandSection).getByText('Before buying the offer, they buy the feeling.');
    expect(brandQuote).toBeInTheDocument();
    expect(brandQuote).toHaveClass('scene-italic');
    expect(brandQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--start', 'scene-quote--center');

    const websiteSection = screen.getByLabelText('Website Creation');
    const websiteQuote = within(websiteSection).getByText(
      'A website should not just present a business. It should elevate it.',
    );
    expect(websiteQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--end', 'scene-quote--center');
  });
});
