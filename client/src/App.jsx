import { useEffect, useMemo, useRef, useState } from 'react';
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

const isCashierRoute = (pathname) => pathname.startsWith('/cashier');
const isCashierNewRoute = (pathname) => pathname.startsWith('/cashier-new');

const getStoredDepartmentId = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('selectedDepartmentId');
};

const getStoredBranchId = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('selectedBranchId');
};

export default function App() {
  const [query, setQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [cashierOrders, setCashierOrders] = useState([]);
  const [cashierLoading, setCashierLoading] = useState(false);
  const [cashierError, setCashierError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [route, setRoute] = useState(window.location.pathname);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const homePathRef = useRef(window.location.pathname);

  const branchId = useMemo(() => findBranchId(route), [route]);
  const cashierDepartmentId = selectedDepartmentId || getStoredDepartmentId();
  const cashierBranchId = branchId || getStoredBranchId();

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isCashierRoute(route)) {
      homePathRef.current = route;
    }
  }, [route]);

  useEffect(() => {
    if (isCashierRoute(route) || isCashierNewRoute(route)) return;
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
        window.localStorage.setItem('selectedBranchId', branchId);
        if (!normalized.find((item) => item.id === selectedDepartmentId)) {
          setSelectedDepartmentId(null);
          window.localStorage.removeItem('selectedDepartmentId');
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
  }, [branchId, route, selectedDepartmentId]);

  useEffect(() => {
    if (!isCashierRoute(route)) return;
    if (!cashierDepartmentId) {
      setCashierOrders([]);
      setSelectedOrder(null);
      return;
    }

    let cancelled = false;
    const fetchCashierOrders = async () => {
      setCashierLoading(true);
      setCashierError('');

      try {
        const response = await apiClient.get(
          `https://qserver.keshet-teamim.co.il/api/orders/lists/archive/${cashierDepartmentId}`,
        );
        if (cancelled) return;
        const data = response?.data?.data ?? [];
        setCashierOrders(data);
        if (data.length === 0) {
          setSelectedOrder(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load cashier orders', err);
        setCashierError('Failed to load orders. Please try again.');
      } finally {
        if (!cancelled) {
          setCashierLoading(false);
        }
      }
    };

    fetchCashierOrders();
    return () => {
      cancelled = true;
    };
  }, [cashierDepartmentId, route]);

  useEffect(() => {
    if (!isCashierNewRoute(route)) return;
    if (!cashierBranchId || !cashierDepartmentId) {
      setProductResults([]);
      return;
    }

    const trimmed = productQuery.trim();
    if (!trimmed) {
      setProductResults([]);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setProductLoading(true);
      setProductError('');

      try {
        const response = await apiClient.get(
          `https://qserver.keshet-teamim.co.il/api/products/search/${cashierBranchId}/${cashierDepartmentId}?search=${encodeURIComponent(
            trimmed,
          )}`,
        );
        if (cancelled) return;
        setProductResults(response?.data?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to search products', err);
        setProductError('Failed to search products. Please try again.');
      } finally {
        if (!cancelled) {
          setProductLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [cashierBranchId, cashierDepartmentId, productQuery, route]);

  const mockOrderItems = [
    { id: 1, name: 'בקליק קבב בוקבינה', code: '201#', note: 'אין תגובה' },
    { id: 2, name: 'סלמי מילאנו פרוס', code: '203#', note: 'אין תגובה' },
    { id: 3, name: 'סרדליקה סבינה/סוסיסק', code: '206#', note: 'אין תגובה' },
    { id: 4, name: 'פיין סלמי', code: '207#', note: 'אין תגובה' },
    { id: 5, name: 'לשון דליבני', code: '208#', note: 'אין תגובה' },
  ];

  const navigate = (nextPath) => {
    if (nextPath === route) return;
    window.history.pushState({}, '', nextPath);
    setRoute(nextPath);
  };

  const handleDepartmentSelect = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    window.localStorage.setItem('selectedDepartmentId', departmentId);
    setOrdersError('');
  };

  const handleShortcutClick = async (shortcutId) => {
    if (!selectedDepartmentId) return;
    if (shortcutId === 'cashier') {
      navigate('/cashier');
      return;
    }
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

  const handleAddProduct = (product) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          note: '',
        },
      ];
    });
  };

  const handleQuantityChange = (productId, value) => {
    const parsed = Number.parseInt(value, 10);
    setOrderItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Number.isNaN(parsed) || parsed < 1 ? 1 : parsed }
          : item,
      ),
    );
  };

  const handleNoteChange = (productId, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, note: value } : item,
      ),
    );
  };

  const handleRemoveItem = (productId) => {
    setOrderItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleCreateOrder = async () => {
    if (!customerName.trim() || orderItems.length === 0 || !cashierDepartmentId) return;
    setCreateLoading(true);
    setCreateError('');

    const payload = {
      customer_name: customerName.trim(),
      department_id: cashierDepartmentId,
      products: orderItems.map((item) => ({
        comment: item.note || '',
        metric_type: item.metric_type || '',
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity || 1,
      })),
    };

    try {
      const response = await apiClient.post('https://qserver.keshet-teamim.co.il/api/orders', payload);
      const orderNumber = response?.data?.order_number;
      if (orderNumber) {
        setReceiptNumber(orderNumber);
      }
      setShowReceipt(true);
    } catch (err) {
      console.error('Failed to create order', err);
      setCreateError('Failed to create order. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (isCashierNewRoute(route)) {
    return (
      <div className="cashier-page">
        <header className="cashier-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/cashier')}
            aria-label="Back"
          >
            ↩
          </button>
          <h1 className="cashier-title">הזמנה חדשה / Новый заказ</h1>
        </header>
        <div className="cashier-shell">
          <section className="cashier-main cashier-main-flat">
            <div className="order-table">
              <div className="order-table-header">
                <div>№</div>
                <div>מקליט</div>
                <div>שם</div>
                <div>הערה</div>
                <div>כמות</div>
                <div>מדדים</div>
                <div />
              </div>
              <div className="order-table-body">
                {!cashierBranchId || !cashierDepartmentId ? (
                  <div className="helper-text error-text">
                    נדרש לבחור סניף ומחלקה לפני חיפוש מוצרים.
                  </div>
                ) : (
                  <>
                    {orderItems.length === 0 && (
                      <div className="helper-text">לא נבחרו מוצרים עדיין</div>
                    )}
                    {orderItems.map((product, index) => (
                      <div key={`${product.product_id}-${index}`} className="order-table-row">
                        <div>{index + 1}</div>
                        <div>{product.product_sku || '-'}</div>
                        <div>{product.product_name}</div>
                        <div>
                          <textarea
                            className="order-note-input"
                            value={product.note || ''}
                            onChange={(event) =>
                              handleNoteChange(product.product_id, event.target.value)
                            }
                            placeholder="הערה"
                          />
                        </div>
                        <div>
                          <input
                            className="order-qty-input"
                            type="number"
                            min="1"
                            value={product.quantity || 1}
                            onChange={(event) =>
                              handleQuantityChange(product.product_id, event.target.value)
                            }
                          />
                        </div>
                        <div>{product.metric_type || '-'}</div>
                        <div>
                          <button
                            type="button"
                            className="order-remove-button"
                            onClick={() => handleRemoveItem(product.product_id)}
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="order-actions">
              <button
                type="button"
                className="order-create-button"
                onClick={handleCreateOrder}
                disabled={!customerName.trim() || orderItems.length === 0 || createLoading}
              >
                {createLoading ? 'יוצר הזמנה...' : '✓ צור הזמנה / Создать'}
              </button>
              <button type="button" className="order-cancel-button">
                ✕ בטל / Отменить
              </button>
              <input
                className="order-customer-input"
                placeholder="שם פרטי ושם משפחה"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            {createError && <div className="helper-text error-text">{createError}</div>}
          </section>
          <aside className="cashier-side">
            <div className="cashier-logo">
              <img src="/logo.png" alt="Keshet Taamim" />
            </div>
            <div className="cashier-search">
              <input
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="פרג"
              />
              <button type="button" aria-label="Search">
                🔍
              </button>
            </div>
            <div className="search-results">
              {productResults.map((product) => (
                <div key={product.product_id} className="search-result-card">
                  <button
                    type="button"
                    className="search-add-button"
                    onClick={() => handleAddProduct(product)}
                  >
                    +
                  </button>
                  <div className="search-result-info">
                    <div className="search-result-sku">#{product.product_sku}</div>
                    <div className="search-result-name">{product.product_name}</div>
                  </div>
                </div>
              ))}
              {!productLoading && !productError && productResults.length === 0 && (
                <div className="helper-text">אין מוצרים להצגה</div>
              )}
            </div>
            <button type="button" className="cashier-secondary" onClick={() => navigate('/cashier')}>
              🕘 היסטוריה / История
            </button>
          </aside>
        </div>
        {showReceipt && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowReceipt(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
                <button type="button" className="modal-print" onClick={() => window.print()}>
                  הדפס / Печать
                </button>
              </div>
              <div className="modal-body">
                <div className="receipt-logo">
                  <img src="/logo.png" alt="Keshet Taamim" />
                </div>
                <div className="receipt-number">№{receiptNumber}</div>
                <div className="receipt-subtitle">
                  {orderItems[0]?.department_name || 'מחלקה'}
                </div>
                <div className="receipt-items">
                  {orderItems.map((item) => (
                    <div key={item.product_id} className="receipt-row">
                      <div className="receipt-row-main">
                        <div className="receipt-sku">#{item.product_sku || '-'}</div>
                        <div className="receipt-name">{item.product_name}</div>
                      </div>
                      <div className="receipt-row-meta">
                        <div>כמות {item.quantity || 1}</div>
                        <div>{item.note || 'אין תגובה'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="receipt-footer">
                  <div>{customerName}</div>
                  <div>{new Date().toLocaleString('he-IL')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isCashierRoute(route)) {
    const hasOrders = cashierOrders.length > 0;
    return (
      <div className="cashier-page">
        <header className="cashier-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(homePathRef.current || '/')}
            aria-label="Back"
          >
            ↩
          </button>
          <h1 className="cashier-title">היסטוריה / История</h1>
        </header>
        <div className="cashier-shell">
          <section className="cashier-main">
            <div className="cashier-main-content">
              {cashierLoading && <div className="helper-text">טוען הזמנות...</div>}
              {cashierError && <div className="helper-text error-text">{cashierError}</div>}
              {!cashierLoading && !cashierError && !selectedOrder && hasOrders && (
                <div className="order-list">
                  {cashierOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className="order-card"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="order-cancel">✕</div>
                      <div className="order-number">
                        #{order.order_number ?? order.id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!cashierLoading && !cashierError && selectedOrder && (
                <div className="order-detail">
                  <div className="order-detail-header">
                    <div className="order-detail-title">
                      הזמנה #{selectedOrder.order_number ?? selectedOrder.id}
                    </div>
                    <button
                      type="button"
                      className="order-detail-close"
                      onClick={() => setSelectedOrder(null)}
                    >
                      סגירה / Закрыть
                    </button>
                  </div>
                  <div className="order-detail-list">
                    {mockOrderItems.map((item) => (
                      <div key={item.id} className="order-detail-row">
                        <div className="order-qty">{item.id}</div>
                        <div className="order-item">
                          <div className="order-item-title">
                            {item.name} {item.code}
                          </div>
                          <div className="order-item-note">{item.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!cashierLoading && !cashierError && !hasOrders && (
                <div className="helper-text">אין הזמנות להצגה</div>
              )}
            </div>
            <button type="button" className="cashier-primary" onClick={() => navigate('/cashier-new')}>
              צור הזמנה חדשה / Создать заказ
            </button>
          </section>
          <aside className="cashier-side">
            <div className="cashier-logo">
              <img src="/logo.png" alt="Keshet Taamim" />
            </div>
            <div className="cashier-search">
              <input placeholder="נא להכניס מספר הזמנה לחיפוש" />
              <button type="button" aria-label="Search">
                🔍
              </button>
            </div>
            <div className="cashier-hint">נא לרשום שם מוצר לחיפוש</div>
          </aside>
        </div>
      </div>
    );
  }

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
