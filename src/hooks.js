import { useState, useEffect } from 'react';
import { TOAST_DURATION } from './constants/index.js';

/** Monotonically-increasing counter used to generate unique toast IDs. */
let toastCounter = 0;

/**
 * Custom hook that manages an array of toast notifications.
 *
 * Provides `showToast` to create a new notification and `removeToast`
 * to dismiss one by ID. Auto-dismissal is handled internally via
 * `setTimeout` when a positive `duration` is supplied.
 *
 * @returns {{ toasts: Array, showToast: Function, removeToast: Function }}
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new toast notification to the stack.
   *
   * @param {'success'|'error'|'info'} type    - Visual variant.
   * @param {string}                   title   - Short headline text.
   * @param {string}                   [message=''] - Optional body text.
   * @param {number}                   [duration=TOAST_DURATION] - Auto-dismiss delay in ms. Pass 0 to persist.
   */
  function showToast(type, title, message = '', duration = TOAST_DURATION) {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }

  /**
   * Removes a toast from the stack by its unique ID.
   *
   * @param {number} id - The toast ID returned when it was created.
   */
  function removeToast(id) {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }

  return { toasts, showToast, removeToast };
}

/**
 * Custom hook that debounces a value, delaying updates until the user
 * stops typing for `delay` milliseconds.
 *
 * Useful for triggering expensive operations (e.g. search filtering)
 * only after input has settled, rather than on every keystroke.
 *
 * @param {*}      value - The value to debounce.
 * @param {number} [delay=250] - Debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cancel the previous timer if value changes before delay elapses.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
