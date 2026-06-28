import { useState } from 'react';

export default function FilterPopup({ isOpen, filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters });

  function handleOpen() {
    setLocal({ ...filters });
  }

  function handleApply() {
    onApply(local);
    onClose();
  }

  function handleReset() {
    const empty = { firstName: '', lastName: '', email: '', department: '' };
    setLocal(empty);
    onApply(empty);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="filter-popup">
        <div className="popup-header">
          <h2 className="popup-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter Users
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="popup-body">
          {[
            { key: 'firstName', label: 'First Name', placeholder: 'e.g. John' },
            { key: 'lastName',  label: 'Last Name',  placeholder: 'e.g. Doe' },
            { key: 'email',     label: 'Email',      placeholder: 'e.g. john@example.com' },
            { key: 'department',label: 'Department', placeholder: 'e.g. Engineering' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <input
                type="text"
                className="form-input"
                placeholder={f.placeholder}
                value={local[f.key]}
                onChange={e => setLocal(prev => ({ ...prev, [f.key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleApply()}
              />
            </div>
          ))}
        </div>
        <div className="popup-footer">
          <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary" onClick={handleApply}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}
