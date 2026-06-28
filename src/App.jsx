import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import UsersTable from './components/UsersTable.jsx';
import UserModal from './components/UserModal.jsx';
import DeleteModal from './components/DeleteModal.jsx';
import FilterPopup from './components/FilterPopup.jsx';
import { Toast } from './components/Toast.jsx';
import { getUsers, addUser, updateUser, deleteUser } from './api.js';
import { useToast, useDebounce } from './hooks.js';

let nextId = 209;

export default function App() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filters, setFilters]           = useState({ firstName: '', lastName: '', email: '', department: '' });
  const [sortKey, setSortKey]           = useState('id');
  const [sortDir, setSortDir]           = useState('asc');
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen]     = useState(false);

  const { toasts, showToast, removeToast } = useToast();
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') {
        setModalOpen(false);
        setDeleteOpen(false);
        setFilterOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
      showToast('info', 'Users loaded', `${data.length} users fetched.`);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Failed to load', err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = (() => {
    let result = [...users];
    const q = debouncedSearch.toLowerCase();
    if (q) result = result.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
    if (filters.firstName)  result = result.filter(u => u.firstName.toLowerCase().includes(filters.firstName.toLowerCase()));
    if (filters.lastName)   result = result.filter(u => u.lastName.toLowerCase().includes(filters.lastName.toLowerCase()));
    if (filters.email)      result = result.filter(u => u.email.toLowerCase().includes(filters.email.toLowerCase()));
    if (filters.department) result = result.filter(u => u.department.toLowerCase().includes(filters.department.toLowerCase()));
    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'id') return sortDir === 'asc' ? av - bv : bv - av;
      av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  })();

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  }

  function handlePageSizeChange(size) {
    setPageSize(size);
    setCurrentPage(1);
  }

  function handleFilterApply(newFilters) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  function handleFilterRemove(key) {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setCurrentPage(1);
  }

  function handleResetAll() {
    setSearch('');
    setFilters({ firstName: '', lastName: '', email: '', department: '' });
    setSortKey('id');
    setSortDir('asc');
    setCurrentPage(1);
  }

  function openAdd() {
    setEditUser(null);
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditUser(user);
    setModalOpen(true);
  }

  function openDelete(user) {
    setDeleteTarget(user);
    setDeleteOpen(true);
  }

  async function handleSave(formData, id) {
    try {
      if (id) {
        await updateUser(id, formData);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...formData } : u));
        showToast('success', 'User updated!', `${formData.firstName} ${formData.lastName} has been updated.`);
      } else {
        await addUser(formData);
        setUsers(prev => [{ id: nextId++, ...formData }, ...prev]);
        showToast('success', 'User added!', `${formData.firstName} ${formData.lastName} has been added.`);
      }
    } catch (err) {
      showToast('error', 'Save failed', err.message);
      throw err;
    }
  }

  async function handleDelete() {
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      showToast('success', 'User deleted', `${deleteTarget.firstName} ${deleteTarget.lastName} removed.`);
    } catch (err) {
      showToast('error', 'Delete failed', err.message);
      throw err;
    }
  }

  const filterCount = Object.values(filters).filter(v => v).length;

  return (
    <>
      <div id="toast-container">
        {toasts.map(t => <Toast key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      <Header
        search={search}
        onSearchChange={v => { setSearch(v); setCurrentPage(1); }}
        onClearSearch={() => { setSearch(''); setCurrentPage(1); }}
        onAddUser={openAdd}
      />

      <main className="main-content">
        <StatsBar users={users} filtered={filtered} currentPage={safePage} totalPages={totalPages} />

        {error ? (
          <div className="table-card">
            <div className="error-state">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="error-title">Failed to load users</h3>
              <p className="error-text">{error}</p>
              <button className="btn btn-primary" onClick={loadUsers}>Retry</button>
            </div>
          </div>
        ) : (
          <UsersTable
            users={filtered}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            currentPage={safePage}
            pageSize={pageSize}
            totalPages={totalPages}
            filters={filters}
            filterCount={filterCount}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={openDelete}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            onFilterOpen={() => setFilterOpen(true)}
            onFilterRemove={handleFilterRemove}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      <FilterPopup
        isOpen={filterOpen}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setFilterOpen(false)}
      />

      <UserModal
        isOpen={modalOpen}
        user={editUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <DeleteModal
        isOpen={deleteOpen}
        user={deleteTarget}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
