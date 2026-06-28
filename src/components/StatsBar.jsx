export default function StatsBar({ users, filtered, currentPage, totalPages }) {
  const depts = new Set(users.map(u => u.department).filter(Boolean));
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-value">{users.length}</span>
        <span className="stat-label">Total Users</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{filtered.length}</span>
        <span className="stat-label">Showing</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{users.length ? `${currentPage} / ${totalPages}` : '—'}</span>
        <span className="stat-label">Page</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{depts.size}</span>
        <span className="stat-label">Departments</span>
      </div>
    </div>
  );
}
