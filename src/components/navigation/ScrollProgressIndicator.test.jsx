import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScrollProgressIndicator from './ScrollProgressIndicator';

const setPageMeasurements = ({ scrollHeight, scrollY = 0, viewportHeight = 400 }) => {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(document.body, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: viewportHeight,
  });
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value: scrollY,
  });
};

describe('ScrollProgressIndicator', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it('highlights the step matching the current page position and supports navigation', () => {
    setPageMeasurements({ scrollHeight: 1400, scrollY: 700 });

    render(
      <MemoryRouter>
        <ScrollProgressIndicator />
      </MemoryRouter>,
    );

    const steps = screen.getAllByRole('button');
    expect(steps).toHaveLength(4);
    expect(steps[2].getAttribute('aria-current')).toBe('step');

    fireEvent.click(steps[3]);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
  });

  it('updates the highlighted step while the window scrolls', async () => {
    setPageMeasurements({ scrollHeight: 1400, scrollY: 0 });

    render(
      <MemoryRouter>
        <ScrollProgressIndicator />
      </MemoryRouter>,
    );

    window.scrollY = 1000;
    fireEvent.scroll(window);

    await waitFor(() => {
      const steps = screen.getAllByRole('button');
      expect(steps[3].getAttribute('aria-current')).toBe('step');
    });
  });

  it('stays hidden when the page does not scroll', () => {
    setPageMeasurements({ scrollHeight: 400 });

    render(
      <MemoryRouter>
        <ScrollProgressIndicator />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
