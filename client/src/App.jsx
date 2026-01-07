import { useEffect, useMemo, useState } from 'react';
import apiClient from './api/client';
import './index.css';

const shortcuts = [
  { id: 'cashier', title: 'כניסת קופאי / Касир', icon: '🧾' },
  { id: 'sorter', title: 'כניסת אורז / Сортировщик', icon: '📦' },
];

const findBranchId = (pathname) => {
  const match = pathname.match(/branch\/(\d+)/i);
  return match ? match[1] : null;
};

export default function App() {
  const [query, setQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  const branchId = useMemo(() => findBranchId(window.location.pathname), []);

  useEffect(() => {
    if (!branchId) {
      setError('Branch id is missing from the URL.');
      return;
    }

    let cancelled = false;

    const fetchDepartments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiClient.get(`/departments/${branchId}`);
        if (cancelled) return;

        const items = response?.data?.data ?? [];
        if (items.length) {
          setBranchName(items[0]?.branch_name ?? '');
          setBranchAddress(items[0]?.branch_address ?? '');
        }
        const normalized = items.map((item) => ({
          id: item.department_id ?? item.id,
          name: item.department_name ?? item.name ?? 'Department',
        }));

      setDepartments(normalized);
      if (!normalized.find((item) => item.id === selectedDepartmentId)) {
        setSelectedDepartmentId(null);
      }
    } catch (err) {
      if (cancelled) return;
      console.error('Failed to load departments', err);
      setError('Failed to load departments. Please try again.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setOrdersError('');
  };

  const handleShortcutClick = async (shortcutId) => {
    if (!selectedDepartmentId) return;
    if (shortcutId !== 'sorter') return;

    setOrdersLoading(true);
    setOrdersError('');

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/orders/lists/archive/${selectedDepartmentId}`,
      );
      console.log('Archive orders response', response?.data);
    } catch (err) {
      console.error('Failed to load archive orders', err);
      setOrdersError('Failed to load archive orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query) return departments;
    return departments.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [departments, query]);

  return (
    <div className="page">
      <header className="hero-card">
        <div className="hero-logo">
          <img src="/logo.png" alt="Keshet Taamim" className="logo-img" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">מחלקה</h1>
          {(branchName || branchAddress) && (
            <div className="branch-meta">
              {branchName && <div className="branch-name">{branchName}</div>}
              {branchAddress && <div className="branch-address">{branchAddress}</div>}
            </div>
          )}
          <div className="search-wrapper">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש"
              className="search-input"
            />
          </div>
          {loading && <div className="helper-text">טוען מחלקות...</div>}
          {error && <div className="helper-text error-text">{error}</div>}
          <section className="list-card">
            <div className="list-header" />
            <ul className="department-list">
              {filtered.length > 0 && !loading ? (
                filtered.map((item) => (
                  <li
                    key={item.id}
                    className={`department-row${selectedDepartmentId === item.id ? ' selected' : ''}`}
                    onClick={() => handleDepartmentSelect(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleDepartmentSelect(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedDepartmentId === item.id}
                  >
                    <span>{item.name}</span>
                  </li>
                ))
              ) : (
                !loading &&
                !error && (
                  <li className="department-row">
                    <span>אין מחלקות להצגה</span>
                  </li>
                )
              )}
            </ul>
          </section>
        </div>
      </header>

      <div className="shortcut-grid">
        {shortcuts.map((item) => (
          <button
            key={item.id}
            className="shortcut-card"
            type="button"
            disabled={!selectedDepartmentId}
            onClick={() => handleShortcutClick(item.id)}
          >
            <div className="accent" />
            <div className="shortcut-content">
              <span className="shortcut-title">{item.title}</span>
              <span className="shortcut-icon" aria-hidden>
                {item.icon}
              </span>
            </div>
          </button>
        ))}
      </div>
      {(ordersLoading || ordersError) && (
        <div className={`helper-text${ordersError ? ' error-text' : ''}`}>
          {ordersLoading ? 'טוען היסטוריית הזמנות...' : ordersError}
        </div>
      )}
    </div>
  );
}
