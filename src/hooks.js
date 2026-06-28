import { useState, useEffect, useRef } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  function showToast(type, title, message = '', duration = 4000) {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return { toasts, showToast, removeToast };
}

export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
