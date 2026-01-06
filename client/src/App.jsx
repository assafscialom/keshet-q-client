import { useMemo, useState } from 'react';
import axios from 'axios';
import './index.css';

const SAMPLE_DEPARTMENTS = [
  { id: 1, name: 'מחלקת נקניקים / Колбасный отдел' },
  { id: 2, name: 'מחלקת גבינות ודגים / Отдел сыров и рыбы' },
  { id: 3, name: 'קצביה / Мясной отдел' },
];

const shortcuts = [
  { id: 'cashier', title: 'כניסת קופאי / Касир', icon: '🧾' },
  { id: 'sorter', title: 'כניסת אורז / Сортировщик', icon: '📦' },
];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

export default function App() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return SAMPLE_DEPARTMENTS;
    return SAMPLE_DEPARTMENTS.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  return (
    <div className="page">
      <header className="hero-card">
        <div className="hero-logo">
          <div className="logo-placeholder">לוגו</div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">מחלקה</h1>
          <div className="search-wrapper">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש"
              className="search-input"
            />
          </div>
          <section className="list-card">
            <div className="list-header" />
            <ul className="department-list">
              {filtered.map((item) => (
                <li key={item.id} className="department-row">
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </header>

      <div className="shortcut-grid">
        {shortcuts.map((item) => (
          <div key={item.id} className="shortcut-card">
            <div className="accent" />
            <div className="shortcut-content">
              <span className="shortcut-title">{item.title}</span>
              <span className="shortcut-icon" aria-hidden>
                {item.icon}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
