import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fresh module per test to reset internal state
let startLoading, stopLoading, setLoadingListener;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const mod = await import('../data/loadingTracker.js');
  startLoading = mod.startLoading;
  stopLoading = mod.stopLoading;
  setLoadingListener = mod.setLoadingListener;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadingTracker', () => {
  it('fires true on first startLoading, false when counter hits 0', () => {
    const listener = vi.fn();
    setLoadingListener(listener);

    startLoading();
    expect(listener).toHaveBeenCalledWith(true);

    stopLoading();
    vi.advanceTimersByTime(300);
    expect(listener).toHaveBeenCalledWith(false);
  });

  it('fires false only when ALL concurrent calls complete', () => {
    const listener = vi.fn();
    setLoadingListener(listener);

    startLoading();
    startLoading();
    startLoading();
    expect(listener).toHaveBeenCalledTimes(1); // only one true

    stopLoading();
    stopLoading();
    vi.advanceTimersByTime(300);
    // Still one active — should not have fired false
    expect(listener).toHaveBeenCalledTimes(1);

    stopLoading();
    vi.advanceTimersByTime(300);
    expect(listener).toHaveBeenCalledWith(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('enforces minimum 250ms display time', () => {
    const listener = vi.fn();
    setLoadingListener(listener);

    startLoading();
    expect(listener).toHaveBeenCalledWith(true);

    // Stop immediately
    stopLoading();
    expect(listener).toHaveBeenCalledTimes(1); // false not yet

    vi.advanceTimersByTime(200);
    expect(listener).toHaveBeenCalledTimes(1); // still waiting

    vi.advanceTimersByTime(100);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(false);
  });

  it('does not flicker on rapid start/stop/start', () => {
    const listener = vi.fn();
    setLoadingListener(listener);

    startLoading();
    stopLoading(); // triggers delayed false
    vi.advanceTimersByTime(100); // still within 250ms

    startLoading(); // new loading session — should cancel pending false
    vi.advanceTimersByTime(300); // past the original min end time

    // Should still be loading (counter = 1), no false fired
    expect(listener).toHaveBeenCalledTimes(2); // true, true
    expect(listener).toHaveBeenLastCalledWith(true);

    stopLoading();
    vi.advanceTimersByTime(300);
    expect(listener).toHaveBeenLastCalledWith(false);
  });
});
