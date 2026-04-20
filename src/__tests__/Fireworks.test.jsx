import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Fireworks from '../components/Fireworks';

describe('Fireworks', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders the label text', () => {
    render(<Fireworks label="New PR!" onDismiss={() => {}} />);
    expect(screen.getByText('New PR!')).toBeInTheDocument();
  });

  it('defaults label to "New PR!" when not provided', () => {
    render(<Fireworks onDismiss={() => {}} />);
    expect(screen.getByText('New PR!')).toBeInTheDocument();
  });

  it('has role="dialog" for accessibility', () => {
    render(<Fireworks label="New Best!" onDismiss={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sets aria-label based on the label prop', () => {
    render(<Fireworks label="New Best!" onDismiss={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'New Best! celebration');
  });

  it('calls onDismiss after 2500ms', () => {
    const onDismiss = vi.fn();
    render(<Fireworks label="New PR!" onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2500));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss before 2500ms', () => {
    const onDismiss = vi.fn();
    render(<Fireworks label="New PR!" onDismiss={onDismiss} />);
    act(() => vi.advanceTimersByTime(2499));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss immediately when overlay is clicked', () => {
    const onDismiss = vi.fn();
    render(<Fireworks label="New PR!" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
