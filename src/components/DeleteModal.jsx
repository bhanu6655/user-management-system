import { useState } from 'react';

export default function DeleteModal({ isOpen, user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // error toast handled in parent
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title danger">Delete User</h2>
          <button className="icon-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
              <p className="delete-user-name">{user ? `${user.firstName} ${user.lastName}` : ''}</p>
              <p className="delete-note">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading
              ? <><span className="spinner" /><span style={{ opacity: 0.5 }}>Deleting...</span></>
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
