/**
 * Application-wide constants.
 * Centralising magic values here ensures a single source of truth
 * and avoids scattering literals across multiple files.
 */

/** Page-size options shown in the rows-per-page selector. */
export const PAGE_SIZES = [10, 25, 50, 100];

/** Starting ID for locally-created users (DummyJSON has IDs 1-208). */
export const NEXT_ID_START = 209;

/** Default empty filter state used on first load and reset. */
export const DEFAULT_FILTERS = {
  firstName:  '',
  lastName:   '',
  email:      '',
  department: '',
};

/** Default sort state. */
export const DEFAULT_SORT = {
  key: 'id',
  dir: 'asc',
};

/**
 * Avatar background gradients cycled by user ID.
 * Using a fixed palette ensures visual consistency across sessions.
 */
export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#22c55e,#06b6d4)',
  'linear-gradient(135deg,#f97316,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#14b8a6,#22c55e)',
];

/** Fields that are required when adding or editing a user. */
export const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'department'];

/** Toast auto-dismiss duration in milliseconds. */
export const TOAST_DURATION = 4000;
