/**
 * Stats summary bar shown below the header.
 *
 * Displays four at-a-glance metrics: total users in the system, users
 * currently matching active filters, current page / total pages, and
 * the number of distinct departments.
 *
 * @param {Object} props
 * @param {Array}  props.users       - The full unfiltered user list.
 * @param {Array}  props.filtered    - The filtered user list (after search/filter).
 * @param {number} props.currentPage - Current pagination page.
 * @param {number} props.totalPages  - Total number of pages for the filtered list.
 */
export default function StatsBar({ users, filtered, currentPage, totalPages }) {
  // Count unique department names across all users, ignoring blank values.
  const uniqueDepartments = new Set(users.map(u => u.department).filter(Boolean));

  const stats = [
    { label: 'Total Users',  value: users.length },
    { label: 'Showing',      value: filtered.length },
    { label: 'Page',         value: users.length ? `${currentPage} / ${totalPages}` : '—' },
    { label: 'Departments',  value: uniqueDepartments.size },
  ];

  return (
    <div className="stats-bar">
      {stats.map(({ label, value }) => (
        <div key={label} className="stat-card">
          <span className="stat-value">{value}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
