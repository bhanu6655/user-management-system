import { REQUIRED_FIELDS, AVATAR_GRADIENTS } from './constants/index.js';

/**
 * Validates a single form field value.
 *
 * @param {string} fieldName - The field identifier (e.g. 'email', 'firstName').
 * @param {string} value     - The raw string value entered by the user.
 * @returns {string} An error message, or an empty string when the value is valid.
 */
export function validate(fieldName, value) {
  const trimmed = value.trim();

  // Required-field check takes priority over format checks.
  if (REQUIRED_FIELDS.includes(fieldName) && !trimmed) {
    return 'This field is required.';
  }

  // Optional fields with no value pass all remaining checks.
  if (!trimmed) return '';

  if ((fieldName === 'firstName' || fieldName === 'lastName') && trimmed.length < 2) {
    return 'Must be at least 2 characters.';
  }

  if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  if (fieldName === 'phone' && !/^[+\d\s\-().]{7,20}$/.test(trimmed)) {
    return 'Enter a valid phone number.';
  }

  if (fieldName === 'website' && !/^(https?:\/\/)?([\w\d\-]+\.)+[\w]{2,}(\/.*)?$/i.test(trimmed)) {
    return 'Enter a valid URL.';
  }

  return '';
}

/**
 * Builds the array of page numbers (and ellipsis markers) to show in
 * the pagination bar.
 *
 * Always includes the first and last page, the current page, and its
 * immediate neighbours. Gaps are represented by the '…' string.
 *
 * @param {number} currentPage - The currently active page (1-indexed).
 * @param {number} totalPages  - Total number of pages.
 * @returns {Array<number|string>} Ordered list of page numbers and '…' separators.
 */
export function getPageRange(currentPage, totalPages) {
  // When there are 7 or fewer pages, show every page number.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const candidates = [1, totalPages, currentPage, currentPage - 1, currentPage + 1];
  const validPages  = candidates.filter(p => p >= 1 && p <= totalPages);
  const sortedPages = [...new Set(validPages)].sort((a, b) => a - b);

  const result = [];
  let previousPage = 0;

  for (const page of sortedPages) {
    // Insert an ellipsis when there is a gap between consecutive page numbers.
    if (page - previousPage > 1) result.push('…');
    result.push(page);
    previousPage = page;
  }

  return result;
}

/**
 * Filters a list of users against a free-text search term and a set of
 * column-level filter values.
 *
 * @param {Array}  users      - Full list of user objects.
 * @param {string} searchTerm - Free-text query (case-insensitive).
 * @param {Object} filters    - Column filter map {firstName, lastName, email, department}.
 * @returns {Array} Filtered user list.
 */
export function filterUsers(users, searchTerm, filters) {
  let result = [...users];
  const term = searchTerm.toLowerCase();

  if (term) {
    result = result.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term)  ||
      user.email.toLowerCase().includes(term)     ||
      user.department.toLowerCase().includes(term)||
      String(user.id).includes(term)
    );
  }

  // Apply each active column filter independently.
  const columnFilters = ['firstName', 'lastName', 'email', 'department'];
  columnFilters.forEach(col => {
    if (filters[col]) {
      result = result.filter(user =>
        user[col].toLowerCase().includes(filters[col].toLowerCase())
      );
    }
  });

  return result;
}

/**
 * Sorts a list of users by a given column key and direction.
 *
 * Numeric comparison is used for the ID column; string comparison for all others.
 *
 * @param {Array}  users   - User list to sort (not mutated; a new array is returned).
 * @param {string} sortKey - Column name to sort by (e.g. 'firstName').
 * @param {string} sortDir - Sort direction: 'asc' or 'desc'.
 * @returns {Array} New sorted array.
 */
export function sortUsers(users, sortKey, sortDir) {
  return [...users].sort((userA, userB) => {
    // Use numeric comparison for the ID column.
    if (sortKey === 'id') {
      return sortDir === 'asc' ? userA.id - userB.id : userB.id - userA.id;
    }

    const aVal = String(userA[sortKey]).toLowerCase();
    const bVal = String(userB[sortKey]).toLowerCase();

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

/**
 * Returns the avatar gradient for a given user ID by cycling through
 * the AVATAR_GRADIENTS palette.
 *
 * @param {number} userId - The user's numeric ID.
 * @returns {string} A CSS gradient string.
 */
export function getAvatarGradient(userId) {
  return AVATAR_GRADIENTS[userId % AVATAR_GRADIENTS.length];
}

// Re-export so existing imports from utils.js still resolve.
export { AVATAR_GRADIENTS as GRADIENTS };
