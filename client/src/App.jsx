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
const isSorterRoute = (pathname) => pathname.startsWith('/sorter');
const isBoardRoute = (pathname) => pathname.startsWith('/board/branch/');
const isBoardOrdersRoute = (pathname) => pathname.includes('/board/branch/') && pathname.includes('/department/');

const findBoardBranchId = (pathname) => {
  const match = pathname.match(/board\/branch\/(\d+)/i);
  return match ? match[1] : null;
};

const findBoardDepartmentId = (pathname) => {
  const match = pathname.match(/department\/(\d+)/i);
  return match ? match[1] : null;
};

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
  const [cashierSearch, setCashierSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItemsById, setOrderItemsById] = useState({});
  const [orderItemsLoadingById, setOrderItemsLoadingById] = useState({});
  const [orderItemsErrorById, setOrderItemsErrorById] = useState({});
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
  const [openQuantityForId, setOpenQuantityForId] = useState(null);
  const [cutTypeOptionsByProductId, setCutTypeOptionsByProductId] = useState({});
  const [cutTypeLoadingByProductId, setCutTypeLoadingByProductId] = useState({});
  const [cutTypeErrorByProductId, setCutTypeErrorByProductId] = useState({});
  const [sorterOrders, setSorterOrders] = useState([]);
  const [sorterLoading, setSorterLoading] = useState(false);
  const [sorterError, setSorterError] = useState('');
  const [sorterSelectedOrderId, setSorterSelectedOrderId] = useState(null);
  const [sorterItems, setSorterItems] = useState([]);
  const [sorterItemsLoading, setSorterItemsLoading] = useState(false);
  const [sorterItemsError, setSorterItemsError] = useState('');
  const [sorterUpdateLoading, setSorterUpdateLoading] = useState(false);
  const [sorterUpdateError, setSorterUpdateError] = useState('');
  const [boardDepartments, setBoardDepartments] = useState([]);
  const [boardDepartmentId, setBoardDepartmentId] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');
  const [boardOrders, setBoardOrders] = useState({ progress: [], done: [] });
  const [route, setRoute] = useState(window.location.pathname);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const homePathRef = useRef(window.location.pathname);
  const productSearchRef = useRef(null);

  const branchId = useMemo(() => findBranchId(route), [route]);
  const boardBranchId = useMemo(() => findBoardBranchId(route), [route]);
  const boardRouteDepartmentId = useMemo(() => findBoardDepartmentId(route), [route]);
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
    if (isCashierRoute(route) || isCashierNewRoute(route) || isSorterRoute(route) || isBoardRoute(route))
      return;
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
      setExpandedOrderId(null);
      return;
    }

    let cancelled = false;
    const fetchCashierOrders = async (searchTerm) => {
      setCashierLoading(true);
      setCashierError('');

      try {
        const endpoint = searchTerm
          ? `https://qserver.keshet-teamim.co.il/api/orders/search/${cashierDepartmentId}?search=${encodeURIComponent(
              searchTerm,
            )}`
          : `https://qserver.keshet-teamim.co.il/api/orders/lists/archive/${cashierDepartmentId}`;
        const response = await apiClient.get(endpoint);
        if (cancelled) return;
        const data = response?.data?.data ?? response?.data ?? [];
        setCashierOrders(data);
        if (data.length === 0) {
          setExpandedOrderId(null);
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

    const trimmed = cashierSearch.trim();
    const timeout = window.setTimeout(() => {
      fetchCashierOrders(trimmed);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [cashierDepartmentId, route, cashierSearch]);

  useEffect(() => {
    if (!isBoardRoute(route)) return;
    if (!boardBranchId) {
      setBoardDepartments([]);
      return;
    }

    let cancelled = false;
    const fetchBoardDepartments = async () => {
      setBoardLoading(true);
      setBoardError('');

      try {
        const response = await apiClient.get(`/departments/${boardBranchId}`);
        if (cancelled) return;
        const items = response?.data?.data ?? [];
        const normalized = items.map((item) => ({
          id: item.department_id ?? item.id,
          name: item.department_name ?? item.name ?? 'Department',
        }));
        setBoardDepartments(normalized);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load board departments', err);
        setBoardError('Failed to load departments. Please try again.');
      } finally {
        if (!cancelled) {
          setBoardLoading(false);
        }
      }
    };

    fetchBoardDepartments();
    return () => {
      cancelled = true;
    };
  }, [boardBranchId, route]);

  useEffect(() => {
    if (!isBoardOrdersRoute(route)) return;
    if (!boardRouteDepartmentId) return;
    setBoardDepartmentId(Number(boardRouteDepartmentId));
    handleBoardShowOrders(Number(boardRouteDepartmentId), true);
  }, [boardRouteDepartmentId, route]);

  const fetchSorterOrders = async (cancelSignal) => {
    setSorterLoading(true);
    setSorterError('');

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/orders/lists/progress/${cashierDepartmentId}`,
      );
      if (cancelSignal?.cancelled) return;
      setSorterOrders(response?.data ?? []);
    } catch (err) {
      if (cancelSignal?.cancelled) return;
      console.error('Failed to load sorter orders', err);
      setSorterError('Failed to load orders. Please try again.');
    } finally {
      if (!cancelSignal?.cancelled) {
        setSorterLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isSorterRoute(route)) return;
    if (!cashierDepartmentId) {
      setSorterOrders([]);
      setSorterSelectedOrderId(null);
      setSorterItems([]);
      return;
    }

    const cancelSignal = { cancelled: false };
    fetchSorterOrders(cancelSignal);
    const intervalId = window.setInterval(() => fetchSorterOrders(cancelSignal), 10000);
    return () => {
      cancelSignal.cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [cashierDepartmentId, route]);

  const handleSorterOrderClick = async (orderId) => {
    setSorterSelectedOrderId(orderId);
    setSorterItems([]);
    setSorterItemsLoading(true);
    setSorterItemsError('');

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/orders/${orderId}/products`,
      );
      setSorterItems(response?.data?.products ?? []);
    } catch (err) {
      console.error('Failed to load sorter order items', err);
      setSorterItemsError('Failed to load order items. Please try again.');
    } finally {
      setSorterItemsLoading(false);
    }
  };

  const handleSorterCollected = async () => {
    if (!sorterSelectedOrderId) return;
    setSorterUpdateLoading(true);
    setSorterUpdateError('');

    try {
      await apiClient.patch(
        `https://qserver.keshet-teamim.co.il/api/orders/${sorterSelectedOrderId}`,
        { status_id: 2 },
      );
      await fetchSorterOrders();
    } catch (err) {
      console.error('Failed to update order status', err);
      setSorterUpdateError('Failed to update order. Please try again.');
    } finally {
      setSorterUpdateLoading(false);
    }
  };

  const handleBoardShowOrders = async (departmentId = boardDepartmentId, skipNav = false) => {
    const normalizedId =
      typeof departmentId === 'object' && departmentId !== null
        ? departmentId.id
        : departmentId;
    if (!normalizedId) return;
    if (!skipNav) {
      navigate(`/board/branch/${getBoardBranchIdSafe()}/department/${normalizedId}`);
    }
    setBoardLoading(true);
    setBoardError('');

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/orders/lists/all/${normalizedId}`,
      );
      const data = response?.data ?? {};
      const entry = data[normalizedId] ?? data[String(normalizedId)] ?? {};
      setBoardOrders({
        progress: entry.progress ?? [],
        done: entry.done ?? [],
      });
    } catch (err) {
      console.error('Failed to load board orders', err);
      setBoardError('Failed to load board orders. Please try again.');
    } finally {
      setBoardLoading(false);
    }
  };

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

  const toggleOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    if (orderItemsById[orderId]) return;

    setOrderItemsLoadingById((prev) => ({ ...prev, [orderId]: true }));
    setOrderItemsErrorById((prev) => ({ ...prev, [orderId]: '' }));

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/orders/${orderId}/products`,
      );
      const products = response?.data?.products ?? [];
      setOrderItemsById((prev) => ({ ...prev, [orderId]: products }));
    } catch (err) {
      console.error('Failed to load order items', err);
      setOrderItemsErrorById((prev) => ({
        ...prev,
        [orderId]: 'Failed to load order items. Please try again.',
      }));
    } finally {
      setOrderItemsLoadingById((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const navigate = (nextPath) => {
    if (nextPath === route) return;
    window.history.pushState({}, '', nextPath);
    setRoute(nextPath);
  };

  const navigateHome = () => {
    const storedBranchId = getStoredBranchId();
    const homePath = storedBranchId ? `/branch/${storedBranchId}` : '/';
    navigate(homePath);
  };

  const getBoardBranchIdSafe = () =>
    boardBranchId || findBoardBranchId(window.location.pathname) || getStoredBranchId();

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
    if (shortcutId === 'sorter') {
      navigate('/sorter');
      return;
    }

    return;
  };

  const filtered = useMemo(() => {
    if (!query) return departments;
    return departments.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [departments, query]);

  const handleAddProduct = (product) => {
    fetchCutTypes(product.product_id);
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
          cut_type_id: null,
        },
      ];
    });
  };

  const handleQuantityChange = (productId, value) => {
    if (value === '') {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity: '' } : item,
        ),
      );
      return;
    }

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

  const handleCutTypeChange = (productId, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, cut_type_id: value || null } : item,
      ),
    );
  };

  const fetchCutTypes = async (productId) => {
    if (cutTypeOptionsByProductId[productId] || cutTypeLoadingByProductId[productId]) return;
    setCutTypeLoadingByProductId((prev) => ({ ...prev, [productId]: true }));
    setCutTypeErrorByProductId((prev) => ({ ...prev, [productId]: '' }));

    try {
      const response = await apiClient.get(
        `https://qserver.keshet-teamim.co.il/api/products/${productId}/cut-types`,
      );
      setCutTypeOptionsByProductId((prev) => ({ ...prev, [productId]: response?.data ?? [] }));
    } catch (err) {
      console.error('Failed to load cut types', err);
      setCutTypeErrorByProductId((prev) => ({
        ...prev,
        [productId]: 'Failed to load cut types.',
      }));
    } finally {
      setCutTypeLoadingByProductId((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handlePresetQuantity = (productId, value) => {
    handleQuantityChange(productId, String(value));
    setOpenQuantityForId(null);
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
        cut_type_id: item.cut_type_id || null,
      })),
    };

    try {
      const response = await apiClient.post('https://qserver.keshet-teamim.co.il/api/orders', payload);
      const orderNumber =
        response?.data?.order_number ??
        response?.data?.data?.order_number ??
        response?.data?.id ??
        response?.data?.data?.id;
      if (orderNumber != null) {
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

  const handleReceiptClose = () => {
    setShowReceipt(false);
    navigateHome();
  };

  const handleReceiptPrint = () => {
    window.print();
    handleReceiptClose();
  };

  if (isCashierNewRoute(route)) {
    return (
      <div className="cashier-page">
        <header className="cashier-header">
          <button
            type="button"
            className="back-button"
            onClick={navigateHome}
            aria-label="Back"
          >
            ↩
          </button>
          <h1 className="cashier-title">הזמנה חדשה / Новый заказ</h1>
        </header>
        <div className="cashier-shell">
          <aside className="cashier-side">
            <div className="cashier-logo">
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <div className="cashier-search">
              <button
                type="button"
                className="barcode-button"
                onClick={() => productSearchRef.current?.focus()}
                aria-label="Barcode scan"
              />
              <input
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="פרג"
                ref={productSearchRef}
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
          <section className="cashier-main cashier-main-flat">
            <div className="order-table">
              <div className="order-table-header">
                <div>№</div>
                <div>מקליט</div>
                <div>שם</div>
                <div>הערה</div>
                <div>אופן חיתוך</div>
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
                          <select
                            className="order-cut-type-select"
                            value={product.cut_type_id || ''}
                            onChange={(event) =>
                              handleCutTypeChange(product.product_id, event.target.value)
                            }
                          >
                            <option value="">ללא</option>
                            {(cutTypeOptionsByProductId[product.product_id] || []).map((cutType) => (
                              <option key={cutType.id} value={cutType.id}>
                                {cutType.name}
                              </option>
                            ))}
                          </select>
                          {cutTypeErrorByProductId[product.product_id] && (
                            <div className="helper-text error-text">
                              {cutTypeErrorByProductId[product.product_id]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="order-qty-wrapper">
                            <input
                              className="order-qty-input"
                              type="text"
                              inputMode="numeric"
                              value={product.quantity || 1}
                              onChange={(event) =>
                                handleQuantityChange(product.product_id, event.target.value)
                              }
                              onFocus={() => setOpenQuantityForId(product.product_id)}
                              onClick={() => setOpenQuantityForId(product.product_id)}
                            />
                            {openQuantityForId === product.product_id && (
                              <div className="order-qty-popover">
                                <button
                                  type="button"
                                  className="order-qty-close"
                                  onClick={() => setOpenQuantityForId(null)}
                                  aria-label="Close quantity options"
                                >
                                  ✕
                                </button>
                                {[100, 150, 200, 250, 300, 350, 400].map((qty) => (
                                  <button
                                    key={qty}
                                    type="button"
                                    className="order-qty-option"
                                    onClick={() => handlePresetQuantity(product.product_id, qty)}
                                  >
                                    {qty}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
        </div>
        {showReceipt && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <button
                  type="button"
                  className="modal-close"
                  onClick={handleReceiptClose}
                  aria-label="Close"
                >
                  ✕
                </button>
                <button type="button" className="modal-print" onClick={handleReceiptPrint}>
                  הדפס / Печать
                </button>
              </div>
              <div className="modal-body">
                <div className="receipt-logo">
                  <img src="/keshet.png" alt="Keshet Taamim" />
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
                        {item.note ? <div>{item.note}</div> : null}
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

  if (isSorterRoute(route)) {
    return (
      <div className="sorter-page">
        <header className="cashier-header">
          <button type="button" className="back-button" onClick={navigateHome} aria-label="Back">
            ↩
          </button>
          <h1 className="cashier-title">סדר פריטים</h1>
        </header>
        <div className="cashier-shell">
          <section className="cashier-main sorter-main">
            <div className="order-table sorter-table">
              <div className="order-table-header">
                <div>№</div>
                <div>מקליט</div>
                <div>שם</div>
                <div>הערה</div>
                <div>כמות</div>
              </div>
              <div className="order-table-body">
                {sorterItemsLoading && <div className="helper-text">טוען פריטים...</div>}
                {sorterItemsError && <div className="helper-text error-text">{sorterItemsError}</div>}
                {!sorterItemsLoading && !sorterItemsError && sorterItems.length === 0 && (
                  <div className="helper-text">אין פריטים להצגה</div>
                )}
                {!sorterItemsLoading &&
                  !sorterItemsError &&
                  sorterItems.map((item, index) => (
                    <div key={item.id || index} className="order-table-row">
                      <div>{index + 1}</div>
                      <div>{item.product_name?.sku || '-'}</div>
                      <div>{item.product_name?.name || '-'}</div>
                      <div>{item.comment || '-'}</div>
                      <div>{item.quantity_in_order ?? '-'}</div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="sorter-actions">
              <button
                type="button"
                className="sorter-collected-button"
                onClick={handleSorterCollected}
                disabled={!sorterSelectedOrderId || sorterUpdateLoading}
              >
                {sorterUpdateLoading ? 'מעדכן...' : 'נאסף'}
              </button>
              {sorterUpdateError && <div className="helper-text error-text">{sorterUpdateError}</div>}
            </div>
          </section>
          <aside className="cashier-side sorter-side">
            <div className="cashier-logo">
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <div className="sorter-pill">סדר פריטים</div>
            {sorterLoading && <div className="helper-text">טוען הזמנות...</div>}
            {sorterError && <div className="helper-text error-text">{sorterError}</div>}
            {!sorterLoading && !sorterError && (
              <div className="sorter-list">
                {sorterOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className="sorter-card"
                    onClick={() => handleSorterOrderClick(order.id)}
                  >
                    #{order.order_number ?? order.id}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isBoardRoute(route)) {
    const showOrdersOnly = isBoardOrdersRoute(route);
    const activeDepartmentId = showOrdersOnly ? boardRouteDepartmentId : boardDepartmentId;
    return (
      <div className="board-page">
        <header className="board-header">
          {showOrdersOnly && (
            <button type="button" className="back-button" onClick={() => navigate(`/board/branch/${boardBranchId}`)}>
              ↩
            </button>
          )}
          <div className="board-logo">
            <img src="/keshet.png" alt="Keshet Taamim" />
          </div>
          <h1 className="board-title">מחלקה</h1>
        </header>
        <div className="board-shell">
          {!showOrdersOnly && (
            <>
              <section className="board-card">
                <div className="board-search">
                  <input placeholder="חיפוש" />
                </div>
                <div className="board-list">
                  {boardLoading && <div className="helper-text">טוען מחלקות...</div>}
                  {boardError && <div className="helper-text error-text">{boardError}</div>}
                  {!boardLoading &&
                    !boardError &&
                    boardDepartments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        className={`board-row${boardDepartmentId === dept.id ? ' selected' : ''}`}
                        onClick={() => setBoardDepartmentId(Number(dept.id))}
                      >
                        {dept.name}
                      </button>
                    ))}
                </div>
              </section>
          <button
            type="button"
            className="board-action"
            onClick={() => handleBoardShowOrders()}
            disabled={!boardDepartmentId || boardLoading}
          >
            צג הזמנות
          </button>
            </>
          )}
          <section className="board-orders">
            <div className="board-column wide">
              <div className="board-column-title">בתהליך</div>
              <div className="board-order-list">
                {boardOrders.progress.map((order) => (
                  <div key={order.id} className="board-order-card">
                    #{order.order_number ?? order.id}
                  </div>
                ))}
              </div>
            </div>
            <div className="board-column narrow">
              <div className="board-column-title">מוכן</div>
              <div className="board-order-list">
                {boardOrders.done.map((order) => (
                  <div key={order.id} className="board-order-card done">
                    #{order.order_number ?? order.id}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
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
            onClick={navigateHome}
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
              {!cashierLoading && !cashierError && hasOrders && (
                <div className="order-list">
                  {cashierOrders.map((order) => (
                    <div key={order.id} className="order-item">
                      <button
                        type="button"
                        className="order-card"
                        onClick={() => toggleOrder(order.id)}
                      >
                        <div className="order-cancel">✕</div>
                        <div className="order-number">
                          #{order.order_number ?? order.id}
                        </div>
                      </button>
                      {expandedOrderId === order.id && (
                        <div className="order-detail">
                          <div className="order-detail-header">
                            <div className="order-detail-title">
                              הזמנה #{order.order_number ?? order.id}
                            </div>
                            <button
                              type="button"
                              className="order-detail-close"
                              onClick={() => setExpandedOrderId(null)}
                            >
                              סגירה / Закрыть
                            </button>
                          </div>
                          <div className="order-detail-list">
                            {orderItemsLoadingById[order.id] && (
                              <div className="helper-text">טוען פריטים...</div>
                            )}
                            {orderItemsErrorById[order.id] && (
                              <div className="helper-text error-text">
                                {orderItemsErrorById[order.id]}
                              </div>
                            )}
                            {!orderItemsLoadingById[order.id] &&
                              !orderItemsErrorById[order.id] &&
                              (orderItemsById[order.id] || []).length === 0 && (
                                <div className="helper-text">אין פריטים להצגה</div>
                              )}
                            {!orderItemsLoadingById[order.id] &&
                              !orderItemsErrorById[order.id] &&
                              (orderItemsById[order.id] || []).map((item, index) => (
                                <div key={item.id || index} className="order-detail-row">
                                  <div className="order-qty">{index + 1}</div>
                                  <div className="order-item">
                                    <div className="order-item-title">
                                      {item.product_name?.name || item.product_name} #
                                      {item.product_name?.sku}
                                    </div>
                                    <div className="order-item-note">
                                      {item.comment || 'אין תגובה'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <div className="cashier-search">
              <input
                placeholder="נא להכניס מספר הזמנה לחיפוש"
                value={cashierSearch}
                onChange={(event) => setCashierSearch(event.target.value)}
              />
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
          <img src="/keshet.png" alt="Keshet Taamim" className="logo-img" />
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
