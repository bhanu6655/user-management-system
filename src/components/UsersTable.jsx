import { GRADIENTS, getPageRange } from '../utils.js';

function Skeleton() {
  return (
    <tbody>
      {Array.from({ length: 8 }, (_, i) => (
        <tr key={i} className="skeleton-row">
          <td><span className="skeleton" style={{ width: 32, height: 20 }} /></td>
          <td><div className="name-cell">
            <span className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <span className="skeleton" style={{ width: 80 + i * 10, height: 16 }} />
          </div></td>
          <td><span className="skeleton" style={{ width: 70 + i * 8, height: 16 }} /></td>
          <td><span className="skeleton" style={{ width: 140 + i * 5, height: 16 }} /></td>
          <td><span className="skeleton" style={{ width: 90, height: 24, borderRadius: 99 }} /></td>
          <td><div className="action-btns">
            <span className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
            <span className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
          </div></td>
        </tr>
      ))}
    </tbody>
  );
}

export default function UsersTable({ users, loading, sortKey, sortDir, currentPage, pageSize, totalPages, onSort, onEdit, onDelete, onPageChange, onPageSizeChange, filters, onFilterOpen, onFilterRemove, filterCount, onResetAll }) {
  const start = (currentPage - 1) * pageSize;
  const paged = users.slice(start, start + pageSize);
  const pages = getPageRange(currentPage, totalPages);

  const labels = { firstName: 'First Name', lastName: 'Last Name', email: 'Email', department: 'Department' };

  function SortIcon({ col }) {
    const active = sortKey === col;
    return (
      <span className="sort-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: active && sortDir === 'desc' ? 'rotate(180deg)' : '' }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </span>
    );
  }

  function thClass(col) {
    if (sortKey !== col) return 'sortable';
    return `sortable ${sortDir === 'asc' ? 'sort-asc' : 'sort-desc'}`;
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-outline" onClick={onFilterOpen}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
          </button>
          <div className="active-filters">
            {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => (
              <div key={key} className="filter-tag">
                <span>{labels[key]}: <strong>{val}</strong></span>
                <button className="filter-tag-remove" onClick={() => onFilterRemove(key)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <span className="page-size-label">Rows:</span>
          <select className="select-control" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                {[['id','ID'],['firstName','First Name'],['lastName','Last Name'],['email','Email'],['department','Department']].map(([col, label]) => (
                  <th key={col} className={thClass(col)} data-sort={col} onClick={() => onSort(col)}>
                    <div className="th-inner"><span>{label}</span><SortIcon col={col} /></div>
                  </th>
                ))}
                <th className="col-actions">Actions</th>
              </tr>
            </thead>

            {loading ? <Skeleton /> : (
              <tbody>
                {paged.map(u => {
                  const initials = ((u.firstName[0] || '') + (u.lastName[0] || '')).toUpperCase() || '?';
                  const grad = GRADIENTS[u.id % GRADIENTS.length];
                  return (
                    <tr key={u.id}>
                      <td><span className="id-badge">{u.id}</span></td>
                      <td>
                        <div className="name-cell">
                          <div className="user-avatar" style={{ background: grad }}>{initials}</div>
                          <span>{u.firstName}</span>
                        </div>
                      </td>
                      <td>{u.lastName}</td>
                      <td><a href={`mailto:${u.email}`} className="email-link">{u.email}</a></td>
                      <td>{u.department ? <span className="dept-badge">{u.department}</span> : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn action-btn-edit" onClick={() => onEdit(u)} title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="action-btn action-btn-delete" onClick={() => onDelete(u)} title="Delete">
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

        {!loading && users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-text">Try adjusting your search or filters.</p>
            <button className="btn btn-outline" onClick={onResetAll}>Reset All Filters</button>
          </div>
        )}
      </div>

      {!loading && users.length > 0 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="page-numbers">
            {pages.map((p, i) =>
              p === '…'
                ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                : <button key={p} className={`page-number${p === currentPage ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
            )}
          </div>
          <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
