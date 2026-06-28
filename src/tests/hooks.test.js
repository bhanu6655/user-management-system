import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useToast } from '../hooks.js';

// ── useDebounce ───────────────────────────────────────────────────────────────

describe('useDebounce()', () => {
  it('returns the initial value immediately without waiting', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update the debounced value before the delay elapses', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    // Before the timer fires the value should still be the old one.
    expect(result.current).toBe('initial');

    vi.useRealTimers();
  });

  it('updates the debounced value after the delay elapses', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('updated');
    vi.useRealTimers();
  });

  it('resets the timer when the value changes again before the delay elapses', async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(150)); // Halfway — should not have fired yet.
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(300)); // Full delay from last change.

    expect(result.current).toBe('c');
    vi.useRealTimers();
  });
});

// ── useToast ──────────────────────────────────────────────────────────────────

describe('useToast()', () => {
  it('starts with an empty toast list', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds a toast when showToast is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('success', 'User saved', 'Details saved.', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type:    'success',
      title:   'User saved',
      message: 'Details saved.',
    });
  });

  it('removes a toast when removeToast is called with its ID', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('error', 'Failed', '', 0);
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('assigns unique IDs to each toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('info', 'First',  '', 0);
      result.current.showToast('info', 'Second', '', 0);
    });

    const ids = result.current.toasts.map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });
});
