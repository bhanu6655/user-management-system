import { useState } from 'react';

/**
 * Delete confirmation modal.
 *
 * Asks the user to confirm before permanently removing a user record.
 * Displays the user's full name so the action target is unambiguous.
 *
 * @param {Object}      props
 * @param {boolean}     props.isOpen    - Controls modal visibility.
 * @param {Object|null} props.user      - The user to be deleted (provides name for display).
 * @param {Function}    props.onClose   - Called when the modal should dismiss.
 * @param {Function}    props.onConfirm - Async callback that performs the deletion.
 */
export default function DeleteModal({ isOpen, user, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  /** Triggers the delete API call, then closes the modal on success. */
  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error toast is shown by App; the modal just stops its loading state.
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isOpen) return null;

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title danger">Delete User</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close delete dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <div className="delete-warning-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div>
              <p className="delete-confirm-text">Are you sure you want to delete</p>
              <p className="delete-user-name">{fullName}</p>
              <p className="delete-note">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting
              ? <><span className="spinner" /><span style={{ opacity: 0.5 }}>Deleting...</span></>
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
