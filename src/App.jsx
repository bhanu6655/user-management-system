import { useState, useEffect } from 'react';

import Header      from './components/Header.jsx';
import StatsBar    from './components/StatsBar.jsx';
import UsersTable  from './components/UsersTable.jsx';
import UserModal   from './components/UserModal.jsx';
import DeleteModal from './components/DeleteModal.jsx';
import FilterPopup from './components/FilterPopup.jsx';
import { Toast }   from './components/Toast.jsx';

import { getUsers, addUser, updateUser, deleteUser } from './api.js';
import { useToast, useDebounce }                     from './hooks.js';
import { filterUsers, sortUsers }                    from './utils.js';
import { DEFAULT_FILTERS, DEFAULT_SORT, NEXT_ID_START } from './constants/index.js';

/**
 * Counter used to generate unique IDs for locally-created users.
 * Starts above the DummyJSON range (1-208) to avoid collisions.
 */
let localIdCounter = NEXT_ID_START;

/**
 * Root application component.
 *
 * Owns all global state: the user list, UI visibility flags, search/filter/sort
 * parameters, and pagination settings. Child components receive only the slice
 * of state they need and callbacks to request changes.
 */
export default function App() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ── Search / filter / sort state ────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters]         = useState(DEFAULT_FILTERS);
  const [sortKey, setSortKey]         = useState(DEFAULT_SORT.key);
  const [sortDir, setSortDir]         = useState(DEFAULT_SORT.dir);

  // ── Pagination state ─────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  // ── Modal / overlay visibility ───────────────────────────────────────────────
  const [isFilterOpen, setIsFilterOpen]   = useState(false);
  const [isUserModalOpen, setIsUserModalOpen]     = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ── Selected-item state for edit / delete flows ──────────────────────────────
  const [userBeingEdited, setUserBeingEdited]   = useState(null);
  const [userBeingDeleted, setUserBeingDeleted] = useState(null);

  const { toasts, showToast, removeToast } = useToast();

  // Debounce the raw search input so filtering only runs after typing stops.
  const debouncedSearch = useDebounce(searchInput, 250);

  // Fetch users once on mount.
  useEffect(() => { loadUsers(); }, []);

  // Close all overlays when the user presses Escape.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') return;
      setIsUserModalOpen(false);
      setIsDeleteModalOpen(false);
      setIsFilterOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────────

  /**
   * Loads all users from the API and replaces the local user list.
   * Handles loading and error states so the UI can respond appropriately.
   */
  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
      showToast('info', 'Users loaded', `${data.length} users fetched.`);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Failed to load users', err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  /**
   * Apply search, column filters, and sort to produce the visible user list.
   * Computed inline so it always reflects the latest state.
   */
  const filteredUsers = sortUsers(
    filterUsers(users, debouncedSearch, filters),
    sortKey,
    sortDir
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  // Ensure currentPage never exceeds the available pages after filtering.
  const safePage   = Math.min(currentPage, totalPages);

  // Count of active column filters shown on the filter button badge.
  const activeFilterCount = Object.values(filters).filter(val => val).length;

  // ── Sort handlers ─────────────────────────────────────────────────────────────

  /**
   * Toggles sort direction when clicking the same column, or switches to a new
   * column with ascending direction.
   *
   * @param {string} columnKey - The column field name to sort by.
   */
  function handleSort(columnKey) {
    if (sortKey === columnKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(columnKey);
      setSortDir('asc');
    }
    setCurrentPage(1);
  }

  // ── Pagination handlers ───────────────────────────────────────────────────────

  /**
   * Changes the number of rows shown per page and resets to page 1.
   *
   * @param {number} size - New page size value.
   */
  function handlePageSizeChange(size) {
    setPageSize(size);
    setCurrentPage(1);
  }

  // ── Filter handlers ───────────────────────────────────────────────────────────

  /**
   * Applies the user's filter selections from the Filter popup.
   *
   * @param {Object} newFilters - Filter map from FilterPopup.
   */
  function handleFilterApply(newFilters) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  /**
   * Clears a single column filter by key.
   *
   * @param {string} filterKey - The filter field name to clear (e.g. 'email').
   */
  function handleFilterRemove(filterKey) {
    setFilters(prev => ({ ...prev, [filterKey]: '' }));
    setCurrentPage(1);
  }

  /** Resets all search, filter, and sort state to their defaults. */
  function handleResetAll() {
    setSearchInput('');
    setFilters(DEFAULT_FILTERS);
    setSortKey(DEFAULT_SORT.key);
    setSortDir(DEFAULT_SORT.dir);
    setCurrentPage(1);
  }

  // ── Modal open handlers ───────────────────────────────────────────────────────

  /** Opens the Add User modal with no pre-filled user. */
  function openAddUserModal() {
    setUserBeingEdited(null);
    setIsUserModalOpen(true);
  }

  /**
   * Opens the Edit User modal pre-filled with the selected user's data.
   *
   * @param {Object} user - The user object to edit.
   */
  function openEditUserModal(user) {
    setUserBeingEdited(user);
    setIsUserModalOpen(true);
  }

  /**
   * Opens the Delete confirmation modal for the selected user.
   *
   * @param {Object} user - The user object to delete.
   */
  function openDeleteModal(user) {
    setUserBeingDeleted(user);
    setIsDeleteModalOpen(true);
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────────────

  /**
   * Saves a user — creates a new one or updates an existing one depending on
   * whether `userId` is provided.
   *
   * Optimistically updates local state so the UI reflects changes immediately.
   *
   * @param {Object}      formData - Validated form values from UserModal.
   * @param {number|null} userId   - ID of the user to update, or null for create.
   * @throws {Error} Re-throws API errors so UserModal can keep its loading state.
   */
  async function handleSaveUser(formData, userId) {
    try {
      if (userId) {
        await updateUser(userId, formData);
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...formData } : u)));
        showToast('success', 'User updated!', `${formData.firstName} ${formData.lastName} has been updated.`);
      } else {
        await addUser(formData);
        // Assign a local ID since DummyJSON does not persist the new record.
        setUsers(prev => [{ id: localIdCounter++, ...formData }, ...prev]);
        showToast('success', 'User added!', `${formData.firstName} ${formData.lastName} has been added.`);
      }
    } catch (err) {
      showToast('error', 'Save failed', err.message);
      throw err;
    }
  }

  /**
   * Deletes the currently targeted user after API confirmation.
   *
   * @throws {Error} Re-throws API errors so DeleteModal can keep its loading state.
   */
  async function handleDeleteUser() {
    try {
      await deleteUser(userBeingDeleted.id);
      setUsers(prev => prev.filter(u => u.id !== userBeingDeleted.id));
      showToast('success', 'User deleted', `${userBeingDeleted.firstName} ${userBeingDeleted.lastName} removed.`);
    } catch (err) {
      showToast('error', 'Delete failed', err.message);
      throw err;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast notification stack — rendered outside the main layout flow */}
      <div id="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      <Header
        search={searchInput}
        onSearchChange={value => { setSearchInput(value); setCurrentPage(1); }}
        onClearSearch={() => { setSearchInput(''); setCurrentPage(1); }}
        onAddUser={openAddUserModal}
      />

      <main className="main-content">
        <StatsBar
          users={users}
          filtered={filteredUsers}
          currentPage={safePage}
          totalPages={totalPages}
        />

        {/* Show an error card if the initial data fetch failed */}
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
            users={filteredUsers}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            currentPage={safePage}
            pageSize={pageSize}
            totalPages={totalPages}
            filters={filters}
            filterCount={activeFilterCount}
            onSort={handleSort}
            onEdit={openEditUserModal}
            onDelete={openDeleteModal}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            onFilterOpen={() => setIsFilterOpen(true)}
            onFilterRemove={handleFilterRemove}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      <FilterPopup
        isOpen={isFilterOpen}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setIsFilterOpen(false)}
      />

      <UserModal
        isOpen={isUserModalOpen}
        user={userBeingEdited}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        user={userBeingDeleted}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}
