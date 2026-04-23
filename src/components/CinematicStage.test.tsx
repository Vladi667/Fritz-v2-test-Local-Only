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

    expect(screen.getByText('Certain worlds do not present themselves.')).toBeInTheDocument();
    expect(screen.getByText('They are discovered in silence.')).toBeInTheDocument();
    expect(screen.getByText('Scroll to enter')).toBeInTheDocument();
    expect(screen.getByLabelText('Discovery progress')).toBeInTheDocument();
    expect(screen.getByText('Certain worlds do not present themselves.')).toHaveClass('scene-italic');
    expect(screen.getByText('They are discovered in silence.')).toHaveClass('scene-italic');
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
    expect(brandQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--start');

    const websiteSection = screen.getByLabelText('Website Creation');
    const websiteQuote = within(websiteSection).getByText(
      'A website should not just present a business. It should elevate it.',
    );
    expect(websiteQuote.closest('.scene-quote')).toHaveClass('scene-quote', 'scene-quote--end');
  });
});
