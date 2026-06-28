import { PAGE_SIZES } from '../constants/index.js';
import { getAvatarGradient, getPageRange } from '../utils.js';

/**
 * Renders a skeleton placeholder row while data is loading.
 * Uses CSS shimmer animation to indicate activity.
 */
function SkeletonRows() {
  return (
    <tbody>
      {Array.from({ length: 8 }, (_, rowIndex) => (
        <tr key={rowIndex} className="skeleton-row">
          <td><span className="skeleton" style={{ width: 32, height: 20 }} /></td>
          <td>
            <div className="name-cell">
              <span className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <span className="skeleton" style={{ width: 80 + rowIndex * 10, height: 16 }} />
            </div>
          </td>
          <td><span className="skeleton" style={{ width: 70 + rowIndex * 8, height: 16 }} /></td>
          <td><span className="skeleton" style={{ width: 140 + rowIndex * 5, height: 16 }} /></td>
          <td><span className="skeleton" style={{ width: 90, height: 24, borderRadius: 99 }} /></td>
          <td>
            <div className="action-btns">
              <span className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
              <span className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Sort-direction chevron icon shown in sortable table headers.
 *
 * @param {{ isActive: boolean, dir: string }} props
 */
function SortChevron({ isActive, dir }) {
  return (
    <span className="sort-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        style={{ transform: isActive && dir === 'desc' ? 'rotate(180deg)' : '' }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </span>
  );
}

/**
 * Main data table component.
 *
 * Renders the filter toolbar, the user data table (or skeleton / empty state),
 * and the pagination bar. Receives all data and event handlers from App.
 *
 * @param {Object}   props
 * @param {Array}    props.users           - Filtered and sorted user list.
 * @param {boolean}  props.loading         - True while data is being fetched.
 * @param {string}   props.sortKey         - Currently active sort column.
 * @param {string}   props.sortDir         - Sort direction: 'asc' | 'desc'.
 * @param {number}   props.currentPage     - Current pagination page.
 * @param {number}   props.pageSize        - Rows displayed per page.
 * @param {number}   props.totalPages      - Total number of available pages.
 * @param {Object}   props.filters         - Active column filter values.
 * @param {number}   props.filterCount     - Count of non-empty filters (for badge).
 * @param {Function} props.onSort          - Called with a column key when a header is clicked.
 * @param {Function} props.onEdit          - Called with a user object to open the edit modal.
 * @param {Function} props.onDelete        - Called with a user object to open the delete modal.
 * @param {Function} props.onPageChange    - Called with a page number to navigate.
 * @param {Function} props.onPageSizeChange- Called with a new page size.
 * @param {Function} props.onFilterOpen    - Opens the filter popup.
 * @param {Function} props.onFilterRemove  - Called with a filter key to clear it.
 * @param {Function} props.onResetAll      - Resets all search/filter/sort state.
 */
export default function UsersTable({
  users, loading, sortKey, sortDir,
  currentPage, pageSize, totalPages,
  filters, filterCount,
  onSort, onEdit, onDelete,
  onPageChange, onPageSizeChange,
  onFilterOpen, onFilterRemove, onResetAll,
}) {
  const startIndex = (currentPage - 1) * pageSize;
  const pagedUsers = users.slice(startIndex, startIndex + pageSize);
  const pageNumbers = getPageRange(currentPage, totalPages);

  // Human-readable labels for column filter tags.
  const filterLabels = {
    firstName:  'First Name',
    lastName:   'Last Name',
    email:      'Email',
    department: 'Department',
  };

  /** Returns the CSS class string for a sortable table header. */
  function getSortHeaderClass(columnKey) {
    if (sortKey !== columnKey) return 'sortable';
    return `sortable ${sortDir === 'asc' ? 'sort-asc' : 'sort-desc'}`;
  }

  // Column definitions for the table header — keeps the JSX DRY.
  const columns = [
    { key: 'id',         label: 'ID' },
    { key: 'firstName',  label: 'First Name' },
    { key: 'lastName',   label: 'Last Name' },
    { key: 'email',      label: 'Email' },
    { key: 'department', label: 'Department' },
  ];

  return (
    <>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-outline" onClick={onFilterOpen}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
          </button>

          {/* Active filter tags */}
          <div className="active-filters">
            {Object.entries(filters)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key} className="filter-tag">
                  <span>{filterLabels[key]}: <strong>{value}</strong></span>
                  <button className="filter-tag-remove" onClick={() => onFilterRemove(key)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="toolbar-right">
          <span className="page-size-label">Rows:</span>
          <select
            className="select-control"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    className={getSortHeaderClass(key)}
                    onClick={() => onSort(key)}
                  >
                    <div className="th-inner">
                      <span>{label}</span>
                      <SortChevron isActive={sortKey === key} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="col-actions">Actions</th>
              </tr>
            </thead>

            {loading ? <SkeletonRows /> : (
              <tbody>
                {pagedUsers.map(user => {
                  const initials = (
                    (user.firstName[0] || '') + (user.lastName[0] || '')
                  ).toUpperCase() || '?';

                  return (
                    <tr key={user.id}>
                      <td><span className="id-badge">{user.id}</span></td>
                      <td>
                        <div className="name-cell">
                          <div
                            className="user-avatar"
                            style={{ background: getAvatarGradient(user.id) }}
                          >
                            {initials}
                          </div>
                          <span>{user.firstName}</span>
                        </div>
                      </td>
                      <td>{user.lastName}</td>
                      <td>
                        <a href={`mailto:${user.email}`} className="email-link">
                          {user.email}
                        </a>
                      </td>
                      <td>
                        {user.department
                          ? <span className="dept-badge">{user.department}</span>
                          : <span style={{ color: 'var(--color-text-faint)' }}>—</span>
                        }
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => onEdit(user)}
                            title={`Edit ${user.firstName} ${user.lastName}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => onDelete(user)}
                            title={`Delete ${user.firstName} ${user.lastName}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Empty state — shown when filters return no results */}
        {!loading && users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-text">Try adjusting your search or filters.</p>
            <button className="btn btn-outline" onClick={onResetAll}>Reset All Filters</button>
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {!loading && users.length > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="page-numbers">
            {pageNumbers.map((pageNum, index) =>
              pageNum === '…'
                ? <span key={`ellipsis-${index}`} className="page-ellipsis">…</span>
                : (
                  <button
                    key={pageNum}
                    className={`page-number${pageNum === currentPage ? ' active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                )
            )}
          </div>

          <button
            className="page-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
