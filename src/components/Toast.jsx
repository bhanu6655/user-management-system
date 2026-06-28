/**
 * SVG icon map for each toast variant.
 * Defined outside the component to avoid re-creating on every render.
 */
const TOAST_ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

/**
 * Single toast notification card.
 *
 * Rendered by the toast container in App. Provides a dismiss button;
 * auto-dismissal is handled by the `useToast` hook via setTimeout.
 *
 * @param {Object}   props
 * @param {Object}   props.toast          - Toast data object {id, type, title, message}.
 * @param {Function} props.onRemove       - Called with the toast ID to dismiss it.
 */
export function Toast({ toast, onRemove }) {
  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
      <div className="toast-icon">
        {TOAST_ICONS[toast.type] ?? TOAST_ICONS.info}
      </div>
      <div className="toast-body">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-msg">{toast.message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
