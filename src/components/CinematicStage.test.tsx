import {act, render, screen, within} from '@testing-library/react';
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
  useScrollProgress: vi.fn(() => 0),
}));

vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('./SequenceCanvas', () => ({
  SequenceCanvas: () => <div data-testid="sequence-canvas" />,
}));

describe('CinematicStage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    const {useScrollProgress} = await import('../hooks/useScrollProgress');
    vi.mocked(useScrollProgress).mockReturnValue(0);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('opens with the cinematic loading intro before the homepage scenes', () => {
    render(<CinematicStage />);

    expect(screen.getByTestId('story-viewport')).toHaveStyle({
      '--backdrop-scale': '1.0000',
      '--backdrop-shift-y': '0.00px',
    });
    expect(screen.getByTestId('story-stage-backdrop')).toHaveClass('story-stage__backdrop');
    expect(screen.getByTestId('story-stage-backdrop-veil')).toHaveClass(
      'story-stage__backdrop',
      'story-stage__backdrop--veil',
    );

    const loadingIntro = screen.getByLabelText('Loading introduction');
    expect(within(loadingIntro).getByText('Certain worlds do not present themselves.')).toHaveClass(
      'scene-italic',
      'loading-intro__line',
      'loading-intro__line--first',
    );
    expect(within(loadingIntro).getByText('They are discovered in silence.')).toHaveClass(
      'scene-italic',
      'loading-intro__line',
      'loading-intro__line--second',
    );
    expect(within(loadingIntro).getByText('Scroll to enter')).toHaveClass(
      'scene-scroll-hint',
      'scene-scroll-hint--landing',
      'scene-scroll-hint--compact',
      'loading-intro__hint',
    );

    const nav = screen.getByLabelText('Primary');
    expect(within(nav).queryByText('Arrival')).not.toBeInTheDocument();
    expect(within(nav).getByText('Website Creation')).toBeInTheDocument();
    expect(within(nav).getByText('TBA')).toBeInTheDocument();
    expect(screen.getByLabelText('Discovery progress')).toBeInTheDocument();
  });

  it('hands off from the loading intro to the homepage after the cinematic hold', () => {
    render(<CinematicStage />);

    act(() => {
      vi.advanceTimersByTime(3700);
    });

    expect(screen.queryByLabelText('Loading introduction')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Website Creation')).toBeInTheDocument();
  });

  it('renders chapter italic lines on the opposite side and includes the placeholder TBA chapter', () => {
    render(<CinematicStage />);

    const brandSection = screen.getByLabelText('Brand Design');
    const brandQuote = within(brandSection).getByText('Before buying the offer, they buy the feeling.');
    expect(brandQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--start', 'scene-quote--center');

    const websiteSection = screen.getByLabelText('Website Creation');
    const websiteQuote = within(websiteSection).getByText(
      'A website should not just present a business. It should elevate it.',
    );
    expect(websiteQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--start', 'scene-quote--center');

    const tbaSection = screen.getByLabelText('TBA');
    expect(within(tbaSection).getAllByText('TBA').length).toBeGreaterThanOrEqual(4);

    const joinSection = screen.getByLabelText('Join the Adventure');
    const joinQuote = within(joinSection).getByText(
      'Some brands ask for visibility. Others build a world people want to enter.',
    );
    expect(joinQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--end', 'scene-quote--center');
  });
});
