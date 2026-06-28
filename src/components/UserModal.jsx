import { useState, useEffect } from 'react';
import { validate }            from '../utils.js';
import { REQUIRED_FIELDS }     from '../constants/index.js';

/** Empty form shape used when opening the Add User modal. */
const EMPTY_FORM = {
  firstName:  '',
  lastName:   '',
  email:      '',
  department: '',
  phone:      '',
  website:    '',
};

/**
 * Reusable labelled input field with inline error message.
 *
 * @param {Object}   props
 * @param {string}   props.label       - Visible label text.
 * @param {string}   props.name        - Field name (must match the form state key).
 * @param {string}   [props.type]      - HTML input type (default: 'text').
 * @param {string}   props.value       - Controlled input value.
 * @param {string}   [props.error]     - Error message to display; empty string = no error.
 * @param {Function} props.onChange    - Change handler passed down from the form.
 * @param {Function} props.onBlur     - Blur handler for triggering validation on focus-out.
 * @param {boolean}  [props.required]  - When true, adds a required indicator (*) to the label.
 * @param {string}   [props.placeholder]
 */
function FormField({ label, name, type = 'text', value, error, onChange, onBlur, required, placeholder }) {
  return (
    <div className="form-group">
      <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
      <input
        type={type}
        name={name}
        className={`form-input${error ? ' is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

/**
 * Modal dialog for adding a new user or editing an existing one.
 *
 * Manages its own form state, validation errors, and loading state.
 * The parent (`App`) is responsible for actually calling the API via `onSave`.
 *
 * @param {Object}      props
 * @param {boolean}     props.isOpen  - Controls modal visibility.
 * @param {Object|null} props.user    - User to edit; null means "add new".
 * @param {Function}    props.onClose - Called when the modal should close.
 * @param {Function}    props.onSave  - Async callback: (formData, userId) => Promise.
 */
export default function UserModal({ isOpen, user, onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync form values whenever the modal opens or switches between add/edit.
  useEffect(() => {
    if (!isOpen) return;
    setFormData(
      user
        ? {
            firstName:  user.firstName,
            lastName:   user.lastName,
            email:      user.email,
            department: user.department,
            phone:      user.phone  || '',
            website:    user.website || '',
          }
        : EMPTY_FORM
    );
    setErrors({});
  }, [isOpen, user]);

  /**
   * Updates a single form field in state.
   * If the field already has a validation error, re-validates immediately
   * so the error clears as soon as the user's input becomes valid.
   */
  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear the error live once the field becomes valid.
    if (errors[name]) {
      const errorMessage = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  }

  /**
   * Validates a field when focus moves away from it.
   * This gives the user a chance to finish typing before errors appear.
   */
  function handleFieldBlur(event) {
    const { name, value } = event.target;
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  }

  /**
   * Runs validation on every field and returns true only if all pass.
   *
   * @returns {boolean} True when the form is valid and safe to submit.
   */
  function validateAllFields() {
    const allFields = ['firstName', 'lastName', 'email', 'department', 'phone', 'website'];
    const newErrors = {};
    allFields.forEach(fieldName => {
      newErrors[fieldName] = validate(fieldName, formData[fieldName]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every(msg => !msg);
  }

  /** Handles form submission: validates, calls onSave, closes on success. */
  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateAllFields()) return;

    setIsSaving(true);
    try {
      await onSave(formData, user?.id ?? null);
      onClose();
    } catch {
      // Error toast is displayed by App; UserModal just stops its spinner.
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  const isEditMode = Boolean(user);

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEditMode ? 'Edit User' : 'Add User'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-row">
              <FormField label="First Name"  name="firstName"  value={formData.firstName}  error={errors.firstName}  onChange={handleFieldChange} onBlur={handleFieldBlur} required placeholder="John" />
              <FormField label="Last Name"   name="lastName"   value={formData.lastName}   error={errors.lastName}   onChange={handleFieldChange} onBlur={handleFieldBlur} required placeholder="Doe" />
            </div>
            <FormField label="Email Address" name="email"      type="email" value={formData.email}      error={errors.email}      onChange={handleFieldChange} onBlur={handleFieldBlur} required placeholder="john.doe@example.com" />
            <div className="form-row">
              <FormField label="Department"  name="department" value={formData.department} error={errors.department} onChange={handleFieldChange} onBlur={handleFieldBlur} required placeholder="Engineering" />
              <FormField label="Phone"       name="phone"      type="tel"   value={formData.phone}      error={errors.phone}      onChange={handleFieldChange} onBlur={handleFieldBlur} placeholder="+1 555-0100" />
            </div>
            <FormField label="Website" name="website" value={formData.website} error={errors.website} onChange={handleFieldChange} onBlur={handleFieldBlur} placeholder="https://example.com" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving
                ? <><span className="spinner" /><span style={{ opacity: 0.5 }}>{isEditMode ? 'Saving...' : 'Adding...'}</span></>
                : <span>{isEditMode ? 'Save Changes' : 'Save User'}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
