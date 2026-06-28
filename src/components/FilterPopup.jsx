import { useState } from 'react';

/**
 * Filter popup overlay.
 *
 * Manages its own local draft state so the user can adjust filters without
 * affecting the table until they click "Apply". Filters are applied by
 * calling `onApply` with the new filter object.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen   - Controls visibility of the popup.
 * @param {Object}   props.filters  - Current active filters to pre-fill the fields.
 * @param {Function} props.onApply  - Called with the new filter object on Apply.
 * @param {Function} props.onClose  - Called when the popup should be dismissed.
 */
export default function FilterPopup({ isOpen, filters, onApply, onClose }) {
  // Local draft state — changes are only committed to App when Apply is clicked.
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  // Sync draft with external filters whenever the popup opens.
  // (Using a key on the parent would also work; this approach is explicit.)
  function handleOpen() {
    setDraftFilters({ ...filters });
  }

  /** Updates a single filter field in the local draft. */
  function handleDraftChange(fieldKey, value) {
    setDraftFilters(prev => ({ ...prev, [fieldKey]: value }));
  }

  /** Commits the draft filters and closes the popup. */
  function handleApply() {
    onApply(draftFilters);
    onClose();
  }

  /** Clears all filter fields and immediately commits the empty state. */
  function handleReset() {
    const emptyFilters = { firstName: '', lastName: '', email: '', department: '' };
    setDraftFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  }

  if (!isOpen) return null;

  // Field definitions keep the JSX loop DRY.
  const filterFields = [
    { key: 'firstName',  label: 'First Name',  placeholder: 'e.g. John' },
    { key: 'lastName',   label: 'Last Name',   placeholder: 'e.g. Doe' },
    { key: 'email',      label: 'Email',        placeholder: 'e.g. john@example.com' },
    { key: 'department', label: 'Department',  placeholder: 'e.g. Engineering' },
  ];

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
          <button className="icon-btn" onClick={onClose} aria-label="Close filter panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="popup-body">
          {filterFields.map(({ key, label, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={draftFilters[key]}
                onChange={e => handleDraftChange(key, e.target.value)}
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
