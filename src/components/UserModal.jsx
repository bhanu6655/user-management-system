import { useState, useEffect } from 'react';
import { validate } from '../utils.js';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', department: '', phone: '', website: '' };

export default function UserModal({ isOpen, user, onClose, onSave }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, department: user.department, phone: user.phone || '', website: user.website || '' } : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const err = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  }

  function validateAll() {
    const fields = ['firstName', 'lastName', 'email', 'department', 'phone', 'website'];
    const errs = {};
    fields.forEach(f => { errs[f] = validate(f, form[f]); });
    setErrors(errs);
    return Object.values(errs).every(e => !e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      await onSave(form, user?.id);
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
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Edit User' : 'Add User'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-row">
              <Field label="First Name" name="firstName" value={form.firstName} error={errors.firstName} onChange={handleChange} onBlur={handleBlur} required placeholder="John" />
              <Field label="Last Name"  name="lastName"  value={form.lastName}  error={errors.lastName}  onChange={handleChange} onBlur={handleBlur} required placeholder="Doe" />
            </div>
            <Field label="Email Address" name="email"      type="email" value={form.email}      error={errors.email}      onChange={handleChange} onBlur={handleBlur} required placeholder="john.doe@example.com" />
            <div className="form-row">
              <Field label="Department"  name="department" value={form.department} error={errors.department} onChange={handleChange} onBlur={handleBlur} required placeholder="Engineering" />
              <Field label="Phone"       name="phone"      type="tel"   value={form.phone}      error={errors.phone}      onChange={handleChange} onBlur={handleBlur} placeholder="+1 555-0100" />
            </div>
            <Field label="Website" name="website" value={form.website} error={errors.website} onChange={handleChange} onBlur={handleBlur} placeholder="https://example.com" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner" /><span style={{ opacity: 0.5 }}>{user ? 'Saving...' : 'Adding...'}</span></>
                : <span>{user ? 'Save Changes' : 'Save User'}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, error, onChange, onBlur, required, placeholder }) {
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
