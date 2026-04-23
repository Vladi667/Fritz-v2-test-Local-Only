import {render, screen} from '@testing-library/react';
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
  it('shows the arrival intrigue copy and discovery progress indicator', () => {
    render(<CinematicStage />);

    expect(screen.getByText('Some worlds are not introduced.')).toBeInTheDocument();
    expect(screen.getByText('They are discovered.')).toBeInTheDocument();
    expect(screen.getByText('Scroll to enter')).toBeInTheDocument();
    expect(screen.getByLabelText('Discovery progress')).toBeInTheDocument();
  });
});
