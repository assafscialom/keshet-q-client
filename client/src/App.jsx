import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from './api/client';
import translations from './i18n';
import thaiProducts from './thaiProducts';
import { getDepartmentThaiName } from './thaiDepartments';
import './index.css';

const findBranchId = (pathname) => {
  const match = pathname.match(/branch\/(\d+)/i);
  return match ? match[1] : null;
};

const isCashierRoute = (pathname) => pathname.startsWith('/cashier');
const isCashierNewRoute = (pathname) => pathname.startsWith('/cashier-new');
const isSorterRoute = (pathname) => pathname.startsWith('/sorter');
const isBoardRoute = (pathname) => pathname.startsWith('/board/branch/');
const isBoardOrdersRoute = (pathname) =>
  pathname.includes('/board/branch/') && pathname.includes('/departments/');

const findBoardBranchId = (pathname) => {
  const match = pathname.match(/board\/branch\/(\d+)/i);
  return match ? match[1] : null;
};

const findBoardDepartmentIds = (pathname) => {
  const match = pathname.match(/departments\/([\d,]+)/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
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
  const [barcodeInput, setBarcodeInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [cashierShiftName, setCashierShiftName] = useState(() => localStorage.getItem('cashierShiftName') || '');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftNameInput, setShiftNameInput] = useState('');
  const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);
  const [sorterShiftName, setSorterShiftName] = useState(() => localStorage.getItem('sorterShiftName') || '');
  const [showSorterShiftModal, setShowSorterShiftModal] = useState(false);
  const [sorterShiftNameInput, setSorterShiftNameInput] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState(1);
  const [receiptDepartmentName, setReceiptDepartmentName] = useState('');
  const [receiptItems, setReceiptItems] = useState([]);
  const [receiptCustomerName, setReceiptCustomerName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [openQuantityForId, setOpenQuantityForId] = useState(null);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [cutTypeOptions, setCutTypeOptions] = useState([]);
  const [cutTypeLoading, setCutTypeLoading] = useState(false);
  const [cutTypeError, setCutTypeError] = useState('');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [searchInputMode, setSearchInputMode] = useState('none');
  const lastTapRef = useRef(0);
  const [pendingNote, setPendingNote] = useState('');
  const [pendingCutTypeId, setPendingCutTypeId] = useState('');
  const [showProductImage, setShowProductImage] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [pendingUnit, setPendingUnit] = useState("גר'");
  const [sorterCheckedItems, setSorterCheckedItems] = useState(new Set());
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
  const [boardDepartmentIds, setBoardDepartmentIds] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');
  const [boardOrders, setBoardOrders] = useState({ progress: [], done: [] });
  const [clockTime, setClockTime] = useState(new Date());
  const [boardProgressPage, setBoardProgressPage] = useState(0);
  const [boardDonePage, setBoardDonePage] = useState(0);
  const [boardPageSize, setBoardPageSize] = useState(() => Number(localStorage.getItem('boardPageSize') || 5));
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [route, setRoute] = useState(window.location.pathname);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'he');
  const homePathRef = useRef(window.location.pathname);

  const t = (key) => translations[language]?.[key] ?? translations['he'][key] ?? key;
  const getProductDisplayName = (product) => {
    if (language === 'th') {
      const sku = String(product?.product_sku ?? product?.sku ?? '').trim();
      return thaiProducts[sku] || product?.product_name || '';
    }
    return product?.product_name || '';
  };
  const getDeptName = (name) => language === 'th' ? getDepartmentThaiName(name) : name;

  const shortcuts = [
    { id: 'cashier', title: t('shortcut_cashier'), icon: '🧾' },
    { id: 'sorter', title: t('shortcut_sorter'), icon: '📦' },
  ];
  const productSearchRef = useRef(null);
  const barcodeRef = useRef(null);
  const barcodeTriggered = useRef(false);
  const isReprintRef = useRef(false);

  const branchId = useMemo(() => findBranchId(route), [route]);
  const boardBranchId = useMemo(() => findBoardBranchId(route), [route]);
  const boardRouteDepartmentIds = useMemo(() => findBoardDepartmentIds(route), [route]);
  const cashierDepartmentId = selectedDepartmentId || getStoredDepartmentId();
  const cashierBranchId = branchId || getStoredBranchId();

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const total = boardOrders.progress.length;
    if (total <= boardPageSize) { setBoardProgressPage(0); return; }
    const pages = Math.ceil(total / boardPageSize);
    const id = setInterval(() => setBoardProgressPage((p) => (p + 1) % pages), 5000);
    return () => clearInterval(id);
  }, [boardOrders.progress.length, boardPageSize]);

  useEffect(() => {
    const total = boardOrders.done.length;
    if (total <= boardPageSize) { setBoardDonePage(0); return; }
    const pages = Math.ceil(total / boardPageSize);
    const id = setInterval(() => setBoardDonePage((p) => (p + 1) % pages), 5000);
    return () => clearInterval(id);
  }, [boardOrders.done.length, boardPageSize]);

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
          ? `/orders/search/${cashierDepartmentId}?search=${encodeURIComponent(searchTerm)}`
          : `/orders/lists/archive/${cashierDepartmentId}`;
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
    if (!boardRouteDepartmentIds.length) return;
    setBoardDepartmentIds(boardRouteDepartmentIds);
    handleBoardShowOrders(boardRouteDepartmentIds, true);
    const intervalId = window.setInterval(() => {
      handleBoardShowOrders(boardRouteDepartmentIds, true);
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, [boardRouteDepartmentIds, route]);

  const fetchSorterOrders = async (cancelSignal, showLoading = false) => {
    if (showLoading) setSorterLoading(true);
    setSorterError('');

    try {
      const response = await apiClient.get(`/orders/lists/progress/${cashierDepartmentId}`);
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
    setSorterShiftName('');
    localStorage.removeItem('sorterShiftName');
    setSorterShiftNameInput('');
    setShowSorterShiftModal(true);
  }, [route]);

  useEffect(() => {
    if (!isSorterRoute(route)) return;
    if (!cashierDepartmentId) {
      setSorterOrders([]);
      setSorterSelectedOrderId(null);
      setSorterItems([]);
      return;
    }

    const cancelSignal = { cancelled: false };
    fetchSorterOrders(cancelSignal, true);
    const intervalId = window.setInterval(() => fetchSorterOrders(cancelSignal, false), 10000);
    return () => {
      cancelSignal.cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [cashierDepartmentId, route]);

  const handleSorterOrderClick = async (orderId) => {
    if (sorterSelectedOrderId === orderId) {
      setSorterSelectedOrderId(null);
      setSorterItems([]);
      return;
    }
    setSorterSelectedOrderId(orderId);
    setSorterCheckedItems(new Set());
    setSorterItems([]);
    setSorterItemsLoading(true);
    setSorterItemsError('');

    try {
      const response = await apiClient.get(`/orders/${orderId}/products`);
      setSorterItems(response?.data?.products ?? []);
    } catch (err) {
      console.error('Failed to load sorter order items', err);
      setSorterItemsError('Failed to load order items. Please try again.');
    } finally {
      setSorterItemsLoading(false);
    }
  };

  const handleSorterCollected = async (orderId) => {
    if (!orderId) return;

    if (sorterSelectedOrderId !== orderId) {
      setSorterUpdateError(t('sorter_must_open'));
      return;
    }

    const totalItems = sorterItems.length;
    const checkedCount = sorterCheckedItems.size;
    if (totalItems === 0 || checkedCount < totalItems) {
      setSorterUpdateError(`${t('sorter_collected_of')} ${checkedCount}/${totalItems} — ${t('sorter_mark_all')}`);
      return;
    }

    setSorterUpdateLoading(true);
    setSorterUpdateError('');

    try {
      await apiClient.patch(`/orders/${orderId}`, { status_id: 2 });
      if (sorterSelectedOrderId === orderId) {
        setSorterSelectedOrderId(null);
        setSorterItems([]);
      }
      await fetchSorterOrders(null, false);
    } catch (err) {
      console.error('Failed to update order status', err);
      setSorterUpdateError('Failed to update order. Please try again.');
    } finally {
      setSorterUpdateLoading(false);
    }
  };

  const handleBoardShowOrders = async (
    departmentIds = boardDepartmentIds,
    skipNav = false,
  ) => {
    const normalizedIds = Array.isArray(departmentIds)
      ? departmentIds
      : [departmentIds];
    const cleanedIds = normalizedIds
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (!cleanedIds.length) return;
    if (!skipNav) {
      navigate(`/board/branch/${getBoardBranchIdSafe()}/departments/${cleanedIds.join(',')}`);
    }
    setBoardLoading(true);
    setBoardError('');

    try {
      const response = await apiClient.get(`/orders/lists/all/${cleanedIds.join(',')}`);
      const data = response?.data ?? {};
      const progress = [];
      const done = [];
      cleanedIds.forEach((deptId) => {
        const entry = data[deptId] ?? data[String(deptId)] ?? {};
        progress.push(...(entry.progress ?? []));
        done.push(...(entry.done ?? []));
      });
      setBoardOrders({ progress, done });
    } catch (err) {
      console.error('Failed to load board orders', err);
      setBoardError('Failed to load board orders. Please try again.');
    } finally {
      setBoardLoading(false);
    }
  };

  const handleBarcodeScan = useCallback(async (barcode) => {
    const trimmed = barcode.trim();
    if (!trimmed || !cashierBranchId || !cashierDepartmentId) return;
    setProductLoading(true);
    setProductError('');
    try {
      const response = await apiClient.get(
        `/products/search/${cashierBranchId}/${cashierDepartmentId}?search=${encodeURIComponent(trimmed)}`,
      );
      const results = response?.data?.data ?? [];
      const exactMatch = results.find(
        (p) => String(p.product_sku).trim() === trimmed || String(p.product_name?.sku).trim() === trimmed
      );
      const match = exactMatch ?? (results.length === 1 ? results[0] : null);
      if (match) {
        setProductResults([]);
        setProductQuery('');
        setTextInput('');
        setPendingProduct(match);
        setPendingNote('');
        setPendingCutTypeId('');
        setPendingQuantity(1);
        setPendingUnit("גר'");
        setShowProductImage(false);
      } else {
        setProductQuery(trimmed);
        setProductResults(results);
      }
    } catch (err) {
      console.error('Failed to search products', err);
      setProductError('Failed to search products. Please try again.');
    } finally {
      setProductLoading(false);
    }
  }, [cashierBranchId, cashierDepartmentId]);

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

    const hasThai = /[฀-๿]/.test(trimmed);

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setProductLoading(true);
      setProductError('');

      try {
        let results;

        if (hasThai) {
          // Thai text: search locally in thaiProducts lookup, then fetch by SKU
          const matchingSKUs = Object.entries(thaiProducts)
            .filter(([, name]) => name.includes(trimmed))
            .map(([sku]) => sku)
            .slice(0, 15);

          if (!matchingSKUs.length) {
            setProductResults([]);
            return;
          }

          const responses = await Promise.all(
            matchingSKUs.map((sku) =>
              apiClient
                .get(`/products/search/${cashierBranchId}/${cashierDepartmentId}?search=${encodeURIComponent(sku)}`)
                .then((r) => r?.data?.data ?? [])
                .catch(() => []),
            ),
          );

          const seen = new Set();
          results = responses.flat().filter((p) => {
            if (seen.has(p.product_id)) return false;
            seen.add(p.product_id);
            return true;
          });
        } else {
          const response = await apiClient.get(
            `/products/search/${cashierBranchId}/${cashierDepartmentId}?search=${encodeURIComponent(trimmed)}`,
          );
          results = response?.data?.data ?? [];
        }

        if (cancelled) return;
        setProductResults(results);
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

  useEffect(() => {
    if (!isCashierNewRoute(route)) return;
    barcodeRef.current?.focus();
  }, [route]);

  useEffect(() => {
    if (!isCashierNewRoute(route)) return;
    let buffer = '';
    let lastKeyTime = 0;
    const BARCODE_SPEED_MS = 80;

    const onKey = (e) => {
      if (pendingProduct) return;
      const now = Date.now();
      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const val = buffer.trim();
          buffer = '';
          if (val) handleBarcodeScan(val);
        } else {
          buffer = '';
        }
        return;
      }
      if (e.key.length === 1) {
        if (now - lastKeyTime > BARCODE_SPEED_MS * 3) buffer = '';
        buffer += e.key;
        lastKeyTime = now;
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [route, pendingProduct, handleBarcodeScan]);

  useEffect(() => {
    if (!isCashierRoute(route) || isCashierNewRoute(route)) return;
    if (!cashierShiftName) {
      setShiftNameInput('');
      setShowShiftModal(true);
    }
  }, [route, cashierShiftName]);

  useEffect(() => {
    if (!isCashierNewRoute(route)) return;
    if (!cashierShiftName) {
      navigate('/cashier');
    }
  }, [route, cashierShiftName]);

  useEffect(() => {
    if (!isCashierNewRoute(route)) return;
    let cancelled = false;
    const fetchCutTypes = async () => {
      setCutTypeLoading(true);
      setCutTypeError('');
      try {
        const response = await apiClient.get('/cut-types');
        if (cancelled) return;
        setCutTypeOptions(Array.isArray(response?.data) ? response.data : response?.data?.data ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load cut types', err);
        setCutTypeError('Failed to load cut types.');
      } finally {
        if (!cancelled) {
          setCutTypeLoading(false);
        }
      }
    };

    fetchCutTypes();
    return () => {
      cancelled = true;
    };
  }, [route]);

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
      const response = await apiClient.get(`/orders/${orderId}/products`);
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
    setLastAddedProduct({
      name: product.product_name,
      sku: product.product_sku,
    });
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
          quantity: product.quantity ?? 1,
          note: product.note ?? '',
          cut_type_id: product.cut_type_id ?? null,
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
    const normalized = value ? Number(value) : null;
    setOrderItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, cut_type_id: normalized } : item,
      ),
    );
  };

  const handlePresetQuantity = (productId, value) => {
    handleQuantityChange(productId, String(value));
    setOpenQuantityForId(null);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0 || !cashierDepartmentId) return;
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
        cut_type_id: item.cut_type_id ? Number(item.cut_type_id) : null,
      })),
    };

    try {
      const response = await apiClient.post('/orders', payload);
      const orderNumber =
        response?.data?.order_number ??
        response?.data?.data?.order_number ??
        response?.data?.id ??
        response?.data?.data?.id;
      if (orderNumber != null) {
        setReceiptNumber(orderNumber);
      }
      setReceiptDepartmentName(orderItems[0]?.department_name || '');
      setReceiptItems(orderItems.map(item => ({
        ...item,
        cut_type_name: item.cut_type_id
          ? (cutTypeOptions.find(c => String(c.id) === String(item.cut_type_id))?.name || '')
          : '',
      })));
      setReceiptCustomerName(customerName.trim());
      setShowReceipt(true);
      setOrderItems([]);
      setCustomerName('');
      setLastAddedProduct(null);
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

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReprintOrder = (order) => {
    const rawItems = orderItemsById[order.id] || [];
    const orderNum  = order.order_number ?? order.id;
    const customer  = order.customer_name || '';
    const dept      = order.department_name || '';
    const dateStr   = new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '');
    const logoSrc   = `${window.location.origin}/keshet.png`;

    const itemsHtml = rawItems.map((item, i) => {
      const name    = item.product_name?.name || item.product_name || '-';
      const sku     = item.product_name?.sku || '-';
      const qty     = item.quantity_in_order ?? 1;
      const metric  = item.metric_type ? ' ' + item.metric_type : '';
      const cut     = item.cut_type?.name || '';
      const note    = item.comment || '';
      const thaiName = thaiProducts[String(sku)] || '';
      return `<div class="receipt-row">
        <div class="receipt-field"><span class="receipt-field-label">מק"ט</span><span>${sku}</span></div>
        <div class="receipt-field"><span class="receipt-field-label">שם</span><span>${name}</span></div>
        ${thaiName ? `<div class="receipt-field"><span class="receipt-field-label">ภาษาไทย</span><span>${thaiName}</span></div>` : ''}
        <div class="receipt-field"><span class="receipt-field-label">כמות</span><strong>${qty}${metric}</strong></div>
        ${cut  ? `<div class="receipt-field"><span class="receipt-field-label">חיתוך </span><span>${cut}</span></div>` : ''}
        ${note ? `<div class="receipt-field"><span class="receipt-field-label">הערה</span><span>${note}</span></div>` : ''}
      </div>`;
    }).join('');

    const buildPage = (label) => `
      <div class="receipt-page">
        <div class="receipt-page-top">
          <div class="receipt-label-tag">${label}</div>
          <div class="receipt-logo"><img src="${logoSrc}" alt="קשת טעמים"/></div>
        </div>
        <div class="receipt-number">№${orderNum}</div>
        ${customer ? `<div class="receipt-customer-row"><span class="receipt-field-label">שם לקוח</span><span>${customer}</span></div>` : ''}
        ${dept ? `<div style="text-align:center;margin:4px 0 8px;font-size:13px;">${dept}</div>` : ''}
        <div class="receipt-items">${itemsHtml}</div>
        <div class="receipt-page-footer">
          <span>${dateStr}</span>
          <span class="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
        </div>
      </div>`;

    const customerPage = `
      <div class="receipt-page receipt-page-customer">
        <div class="receipt-logo-large"><img src="${logoSrc}" alt="קשת טעמים"/></div>
        <div class="receipt-number-xl">${orderNum}</div>
        ${dept ? `<div style="text-align:center;margin:4px 0 8px;font-size:13px;">${dept}</div>` : ''}
        ${customer ? `<div class="receipt-customer-row"><span class="receipt-field-label">שם לקוח</span><span>${customer}</span></div>` : ''}
        <div class="receipt-page-footer">
          <span>${dateStr}</span>
          <span class="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
        </div>
      </div>`;

    const content = buildPage('מקור') + buildPage('העתק ללקוח') + customerPage;

    const css = `
      @page { margin: 5mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; direction: rtl; font-size: 18px; }
      .receipt-page { page-break-after: always; break-after: page; padding-bottom: 40px; border-bottom: 2px dotted grey; }
      .receipt-page:last-child { page-break-after: avoid; break-after: avoid; border-bottom: none; padding-bottom: 4mm; }
      .receipt-page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
      .receipt-logo img { max-width: 90px; height: auto; }
      .receipt-logo-large img { max-width: 140px; display: block; margin: 10px auto; }
      .receipt-label-tag { font-weight: 700; font-size: 22pt; }
      .receipt-number { font-size: 66pt; font-weight: 900; text-align: center; direction: ltr; margin: 4px 0; }
      .receipt-number-xl { font-size: 140pt; font-weight: 900; text-align: center; direction: ltr; margin: 8px 0; }
      .receipt-customer-row { display: flex; justify-content: space-between; border-top: 1px solid #888; padding: 6px 0; font-weight: 700; font-size: 22pt; gap: 16px; }
      .receipt-customer-row span:last-child { text-align: right; flex: 1; }
      .receipt-page-customer .receipt-customer-row { justify-content: center; gap: 20px; }
      .receipt-items { width: 100%; }
      .receipt-row { border-top: 1px solid #888; padding: 6px 0; }
      .receipt-field { display: flex; gap: 8px; align-items: baseline; margin-bottom: 2px; font-size: 22pt; }
      .receipt-field-label { font-weight: 700; white-space: nowrap; }
      .receipt-page-footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; font-size: 14pt; color: #333; border-top: 1px solid #ddd; padding-top: 4px; }
      .receipt-disclaimer { font-weight: 700; text-align: right; }
    `;

    const win = window.open('', '_blank');
    if (!win) { window.print(); return; }
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"/><style>${css}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.onload = () => { win.print(); setTimeout(() => { try { win.close(); } catch {} }, 3000); };
    setTimeout(() => { if (win && !win.closed) win.print(); }, 800);
  };

  const handleReceiptPrint = () => {
    const content = document.getElementById('receipt-print-area')?.innerHTML ?? '';
    const css = `
      @page { margin: 5mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; direction: rtl; font-size: 18px; }
      .receipt-page { page-break-after: always; break-after: page; padding-bottom: 40px; border-bottom: 2px dotted grey; }
      .receipt-page:last-child { page-break-after: avoid; break-after: avoid; border-bottom: none; padding-bottom: 4mm; }
      .receipt-page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
      .receipt-logo img { max-width: 90px; height: auto; }
      .receipt-label-tag { font-weight: 700; font-size: 22pt; }
      .receipt-number { font-size: 66pt; font-weight: 900; text-align: center; direction: ltr; margin: 4px 0; }
      .receipt-number-xl { font-size: 140pt; font-weight: 900; text-align: center; direction: ltr; margin: 8px 0; }
      .receipt-subtitle { text-align: center; font-size: 22pt; margin: 4px 0 8px; }
      .receipt-customer-row { display: flex; justify-content: space-between; border-top: 1px solid #888; padding: 6px 0; font-weight: 700; font-size: 22pt; gap: 16px; }
      .receipt-customer-row span:last-child { text-align: right; flex: 1; }
      .receipt-items { width: 100%; }
      .receipt-row { border-top: 1px solid #888; padding: 6px 0; }
      .receipt-field { display: flex; gap: 8px; align-items: baseline; margin-bottom: 2px; font-size: 22pt; }
      .receipt-field-label { font-weight: 700; white-space: nowrap; }
      .receipt-field span:not(.receipt-field-label), .receipt-field strong { text-align: right; }
      .receipt-page-footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; font-size: 14pt; color: #333; border-top: 1px solid #ddd; padding-top: 4px; }
      .receipt-disclaimer { font-weight: 700; text-align: right; }
      .receipt-logo-large img { max-width: 140px; display: block; margin: 10px auto; }
      .receipt-page-customer .receipt-customer-row { justify-content: center; gap: 20px; }
    `;
    const win = window.open('', '_blank');
    if (!win) { window.print(); return; }
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"/><style>${css}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.onload = () => {
      win.print();
      setTimeout(() => { try { win.close(); } catch {} }, 3000);
    };
    setTimeout(() => { if (win && !win.closed) win.print(); }, 800);
    setTimeout(() => {
      setShowReceipt(false);
      if (!isReprintRef.current) navigate('/cashier-new');
      isReprintRef.current = false;
    }, 3500);
  };

  if (isCashierNewRoute(route)) {
    return (
      <div className="cashier-page">
        <header className="cashier-header cashier-header-new">
          <div className="cashier-header-row1">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/cashier')}
              aria-label="Back"
            >
              ↩
            </button>
            <h1 className="cashier-title">{t('new_order')}</h1>
          </div>
          {cashierShiftName && (
            <div className="cashier-header-row2">
              <span className="shift-name-label">👤 {cashierShiftName}</span>
            </div>
          )}
        </header>
        <div className="cashier-shell">
          <aside className="cashier-side">
            <div className="cashier-logo">
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <input
              className="order-customer-input"
              placeholder={t('customer_name_placeholder')}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
            <div className="cashier-search">
              <input
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target.value || barcodeInput).trim();
                    if (val) {
                      setBarcodeInput('');
                      handleBarcodeScan(val);
                    }
                  }
                }}
                placeholder={t('barcode_scan')}
                ref={barcodeRef}
                autoComplete="off"
              />
            </div>
            <div className="cashier-search cashier-search-text">
              <input
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setProductQuery(e.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && productResults.length === 1) {
                    setPendingProduct(productResults[0]);
                    setPendingNote('');
                    setPendingCutTypeId('');
                    setPendingQuantity(1);
                    setProductQuery('');
                    setTextInput('');
                    setProductResults([]);
                  }
                }}
                placeholder={t('search_by_name')}
                ref={productSearchRef}
                autoComplete="off"
              />
              <button type="button" aria-label="Search">
                🔍
              </button>
            </div>
            {lastAddedProduct && (
              <div className="basket-hint">
                {t('added_to_basket')}: {lastAddedProduct.name} #{lastAddedProduct.sku}
              </div>
            )}
            <div className="search-results">
              {productResults.map((product) => (
                <div key={product.product_id} className="search-result-card">
                  <button
                    type="button"
                    className="search-add-button"
                    onClick={() => {
                      setPendingProduct(product);
                      setPendingNote('');
                      setPendingCutTypeId('');
                      setPendingQuantity(1);
                      setProductQuery('');
                      setTextInput('');
                      setProductResults([]);
                    }}
                  >
                    +
                  </button>
                  <div className="search-result-info">
                    <div className="search-result-sku">#{product.product_sku}</div>
                    <div className="search-result-name">{getProductDisplayName(product)}</div>
                  </div>
                </div>
              ))}
              {!productLoading && !productError && productResults.length === 0 && (
                <div className="helper-text">{t('no_products')}</div>
              )}
            </div>
            <button type="button" className="cashier-secondary" onClick={() => navigate('/cashier')}>
              🕘 {t('history')}
            </button>
          </aside>
          <section className="cashier-main cashier-main-flat">
            <div className="order-table">
              <div className="order-table-header">
                <div>{t('col_num')}</div>
                <div>{t('col_sku')}</div>
                <div>{t('col_name')}</div>
                <div>{t('col_note')}</div>
                <div>{t('col_cut_type')}</div>
                <div>{t('col_quantity')}</div>
                <div>{t('col_metrics')}</div>
                <div />
              </div>
              <div className="order-table-body">
                {!cashierBranchId || !cashierDepartmentId ? (
                  <div className="helper-text error-text">
                    {t('no_branch_dept')}
                  </div>
                ) : (
                  <>
                    {orderItems.length === 0 && (
                      <div className="helper-text">{t('no_items_selected')}</div>
                    )}
                    {orderItems.map((product, index) => (
                      <div key={`${product.product_id}-${index}`} className="order-table-row">
                        <div data-label={t('col_num')}>{index + 1}</div>
                        <div data-label={t('col_sku')}>{product.product_sku || '-'}</div>
                        <div data-label={t('col_name')}>{getProductDisplayName(product)}</div>
                        <div data-label={t('col_note')}>
                          <textarea
                            className="order-note-input"
                            value={product.note || ''}
                            onChange={(event) =>
                              handleNoteChange(product.product_id, event.target.value)
                            }
                            placeholder={t('note')}
                          />
                        </div>
                        <div data-label={t('col_cut_type')}>
                          <select
                            className="order-cut-type-select"
                            value={product.cut_type_id || ''}
                            onChange={(event) =>
                              handleCutTypeChange(product.product_id, event.target.value)
                            }
                          >
                            <option value="">{t('none')}</option>
                            {cutTypeOptions.map((cutType) => (
                              <option key={cutType.id} value={cutType.id}>
                                {cutType.name}
                              </option>
                            ))}
                          </select>
                          {cutTypeError && (
                            <div className="helper-text error-text">
                              {cutTypeError}
                            </div>
                          )}
                        </div>
                        <div data-label={t('col_quantity')}>
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
                                {[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].map((qty) => (
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
                        <div data-label={t('col_metrics')}>{product.metric_type || '-'}</div>
                        <div data-label={t('col_actions')}>
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
                disabled={orderItems.length === 0 || createLoading}
              >
                {createLoading ? t('creating_order') : t('create_order')}
              </button>
              <button type="button" className="order-cancel-button">
                {t('cancel_btn')}
              </button>
            </div>
            {createError && <div className="helper-text error-text">{createError}</div>}
          </section>
        </div>
        <div className="mobile-scroll-controls">
          <button type="button" onClick={scrollToTop} aria-label="Scroll up">
            ↑
          </button>
          <button type="button" onClick={scrollToBottom} aria-label="Scroll down">
            ↓
          </button>
        </div>
        {pendingProduct && (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setPendingProduct(null)}>
            <div className="modal-card product-detail-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button type="button" className="modal-close" onClick={() => setPendingProduct(null)}>✕</button>
                <div className="product-detail-title">
                  <span className="search-result-sku">#{pendingProduct.product_sku}</span>
                  <button
                    type="button"
                    className={`product-name-btn${pendingProduct.product_image ? ' has-image' : ''}`}
                    onClick={() => pendingProduct.product_image && setShowProductImage(v => !v)}
                  >
                    {getProductDisplayName(pendingProduct)}
                    {pendingProduct.product_image && <span className="product-img-icon">{showProductImage ? '▲ סגור' : '📷 תמונה'}</span>}
                  </button>
                </div>
              </div>
              {showProductImage && pendingProduct.product_image && (
                <div className="product-image-preview">
                  <img src={pendingProduct.product_image} alt={pendingProduct.product_name} className="product-image-img" />
                </div>
              )}
              <div className="product-detail-body">
                <label className="product-detail-label">
                  {t('quantity')}
                  <div className="unit-toggle">
                    {["גר'", "יח'"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        className={`unit-toggle-btn${pendingUnit === u ? ' active' : ''}`}
                        onClick={() => { setPendingUnit(u); setPendingQuantity(u === "יח'" ? 1 : 100); }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <div className="order-qty-wrapper">
                    <input
                      className="order-qty-input"
                      type="text"
                      inputMode="numeric"
                      value={pendingQuantity}
                      onChange={(e) => setPendingQuantity(e.target.value)}
                    />
                  </div>
                  <div className="product-detail-presets">
                    {(pendingUnit === "יח'"
                      ? [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]
                      : [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000]
                    ).map((qty) => (
                      <button key={qty} type="button" className="order-qty-option" onClick={() => setPendingQuantity(qty)}>
                        {qty}
                      </button>
                    ))}
                  </div>
                </label>
                <label className="product-detail-label">
                  {t('cut_type')}
                  <select
                    className="order-cut-type-select"
                    value={pendingCutTypeId}
                    onChange={(e) => setPendingCutTypeId(e.target.value)}
                  >
                    <option value="">{t('none')}</option>
                    {cutTypeOptions.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </label>
                <label className="product-detail-label">
                  {t('note')}
                  <textarea
                    className="order-note-input"
                    value={pendingNote}
                    onChange={(e) => setPendingNote(e.target.value)}
                    placeholder={t('note')}
                  />
                </label>
                <button
                  type="button"
                  className="order-create-button"
                  onClick={() => {
                    handleAddProduct({
                      ...pendingProduct,
                      quantity: pendingQuantity || 1,
                      metric_type: pendingUnit,
                      note: pendingNote,
                      cut_type_id: pendingCutTypeId || null,
                    });
                    setPendingProduct(null);
                    setProductQuery('');
                    setTextInput('');
                    setProductResults([]);
                    barcodeRef.current?.focus();
                  }}
                >
                  {t('add_to_order')}
                </button>
              </div>
            </div>
          </div>
        )}
        {showReceipt && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card receipt-modal">
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
                  Печать 🖨️
                </button>
              </div>
              <div className="modal-body receipt-pages" id="receipt-print-area">
                {[{ label: 'מקור' }, { label: 'העתק ללקוח' }].map(({ label }) => (
                  <div key={label} className="receipt-page">
                    <div className="receipt-page-top">
                      <span className="receipt-label-tag">{label}</span>
                      <div className="receipt-logo">
                        <img src="/keshet.png" alt="Keshet Taamim" />
                      </div>
                    </div>
                    <div className="receipt-number">№{receiptNumber}</div>
                    <div className="receipt-customer-row">
                      <span className="receipt-field-label">שם לקוח</span>
                      <span>{receiptCustomerName}</span>
                    </div>
                    <div className="receipt-subtitle">{getDeptName(receiptDepartmentName)}</div>
                    <div className="receipt-items">
                      {receiptItems.map((item) => (
                        <div key={item.product_id} className="receipt-row">
                          <div className="receipt-field"><span className="receipt-field-label">מק"ט</span><span>{item.product_sku || '-'}</span></div>
                          <div className="receipt-field"><span className="receipt-field-label">שם</span><span>{item.product_name}</span></div>
                          {thaiProducts[String(item.product_sku || '')] && <div className="receipt-field"><span className="receipt-field-label">ภาษาไทย</span><span>{thaiProducts[String(item.product_sku || '')]}</span></div>}
                          <div className="receipt-field"><span className="receipt-field-label">כמות</span><strong>{item.quantity || 1}{item.metric_type ? ' ' + item.metric_type : ''}</strong></div>
                          {item.cut_type_name ? <div className="receipt-field"><span className="receipt-field-label">חיתוך </span><span>{item.cut_type_name}</span></div> : null}
                          {item.note ? <div className="receipt-field"><span className="receipt-field-label">הערה</span><span>{item.note}</span></div> : null}
                        </div>
                      ))}
                    </div>
                    <div className="receipt-page-footer">
                      <span>{new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</span>
                      <span className="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
                    </div>
                  </div>
                ))}
                <div className="receipt-page receipt-page-customer">
                  <div className="receipt-logo receipt-logo-large">
                    <img src="/keshet.png" alt="Keshet Taamim" />
                  </div>
                  <div className="receipt-number receipt-number-xl">{receiptNumber}</div>
                  <div className="receipt-subtitle">{receiptDepartmentName}</div>
                  <div className="receipt-customer-row">
                    <span className="receipt-field-label">שם לקוח</span>
                    <span>{receiptCustomerName}</span>
                  </div>
                  <div className="receipt-page-footer">
                    <span>{new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</span>
                    <span className="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showReceipt && createPortal(
          <div id="receipt-print-only" className="receipt-pages">
            {[{ label: 'מקור' }, { label: 'העתק ללקוח' }].map(({ label }) => (
              <div key={label} className="receipt-page">
                <div className="receipt-page-top">
                  <span className="receipt-label-tag">{label}</span>
                  <div className="receipt-logo"><img src="/keshet.png" alt="Keshet Taamim" /></div>
                </div>
                <div className="receipt-number">№{receiptNumber}</div>
                <div className="receipt-customer-row">
                  <span className="receipt-field-label">שם לקוח</span>
                  <span>{receiptCustomerName}</span>
                </div>
                <div className="receipt-subtitle">{receiptDepartmentName}</div>
                <div className="receipt-items">
                  {receiptItems.map((item) => (
                    <div key={item.product_id} className="receipt-row">
                      <div className="receipt-field"><span className="receipt-field-label">מק"ט</span><span>{item.product_sku || '-'}</span></div>
                      <div className="receipt-field"><span className="receipt-field-label">שם</span><span>{item.product_name}</span></div>
                      <div className="receipt-field"><span className="receipt-field-label">כמות</span><strong>{item.quantity || 1}{item.metric_type ? ' ' + item.metric_type : ''}</strong></div>
                      {item.note ? <div className="receipt-field"><span className="receipt-field-label">הערה</span><span>{item.note}</span></div> : null}
                    </div>
                  ))}
                </div>
                <div className="receipt-page-footer">
                  <span>{new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</span>
                  <span className="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
                </div>
                <div style={{pageBreakAfter:'avoid',breakAfter:'avoid',height:0}}>
                  <img src="data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style={{display:'block',height:'5px',width:'100%'}} alt="" />
                </div>
              </div>
            ))}
            <div className="receipt-page receipt-page-customer">
              <div className="receipt-logo receipt-logo-large"><img src="/keshet.png" alt="Keshet Taamim" /></div>
              <div className="receipt-number receipt-number-xl">{receiptNumber}</div>
              <div className="receipt-subtitle">{receiptDepartmentName}</div>
              <div className="receipt-customer-row">
                <span className="receipt-field-label">שם לקוח</span>
                <span>{receiptCustomerName}</span>
              </div>
              <div className="receipt-page-footer">
                <span>{new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</span>
                <span className="receipt-disclaimer">תיתכן סטייה קלה בין הכמות המוזמנת לכמות המסופקת</span>
              </div>
              <div style={{pageBreakAfter:'avoid',breakAfter:'avoid',height:0}}>
                <img src="data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style={{display:'block',height:'5px',width:'100%'}} alt="" />
              </div>
            </div>
          </div>,
          document.body
        )}

        {showEndShiftConfirm && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-box shift-confirm-box">
              <h2 className="shift-confirm-title">{t('end_shift_confirm')}</h2>
              <div className="shift-confirm-actions">
                <button
                  type="button"
                  className="shift-confirm-yes"
                  onClick={() => {
                    localStorage.removeItem('cashierShiftName');
                    setCashierShiftName('');
                    setShowEndShiftConfirm(false);
                    navigate('/cashier');
                  }}
                >
                  {t('yes_exit_shift')}
                </button>
                <button
                  type="button"
                  className="shift-confirm-no"
                  onClick={() => setShowEndShiftConfirm(false)}
                >
                  {t('no_cancel')}
                </button>
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
          <h1 className="cashier-title">{t('sort_items')}</h1>
        </header>
        <div className="sorter-accordion-shell">
          <div className="cashier-logo sorter-logo">
            <img src="/keshet.png" alt="Keshet Taamim" />
          </div>
          {sorterLoading && <div className="helper-text">{t('loading_orders')}</div>}
          {sorterError && <div className="helper-text error-text">{sorterError}</div>}
          {sorterUpdateError && <div className="helper-text error-text">{sorterUpdateError}</div>}
          {!sorterLoading && !sorterError && (
            <div className="sorter-accordion">
              {sorterOrders.map((order) => {
                const isOpen = sorterSelectedOrderId === order.id;
                return (
                  <div key={order.id} className={`sorter-accordion-item${isOpen ? ' open' : ''}`}>
                    <div className="sorter-accordion-header">
                      <button
                        type="button"
                        className="sorter-card-check"
                        onClick={() => handleSorterCollected(order.id)}
                        disabled={sorterUpdateLoading}
                        aria-label={t('collected_aria')}
                      >
                        {sorterUpdateLoading && sorterSelectedOrderId === order.id ? (
                          <span className="sorter-spinner" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        className="sorter-accordion-trigger"
                        onClick={() => handleSorterOrderClick(order.id)}
                      >
                        <span className="sorter-order-number">#{order.order_number ?? order.id}</span>
                        {order.customer_name && (
                          <span className="sorter-order-customer">{order.customer_name}</span>
                        )}
                      </button>
                      <span className={`sorter-accordion-chevron${isOpen ? ' open' : ''}`}>▾</span>
                    </div>
                    {isOpen && (
                      <div className="sorter-accordion-body">
                        {sorterItemsLoading && <div className="helper-text">{t('loading_items')}</div>}
                        {sorterItemsError && <div className="helper-text error-text">{sorterItemsError}</div>}
                        {!sorterItemsLoading && !sorterItemsError && sorterItems.length === 0 && (
                          <div className="helper-text">{t('no_items')}</div>
                        )}
                        {!sorterItemsLoading && !sorterItemsError && sorterItems.map((item, index) => {
                          const itemKey = item.id ?? index;
                          const checked = sorterCheckedItems.has(itemKey);
                          return (
                            <div key={itemKey} className={`sorter-accordion-row${checked ? ' item-checked' : ''}`}>
                              <button
                                type="button"
                                className={`sorter-item-check${checked ? ' checked' : ''}`}
                                onClick={() => setSorterCheckedItems((prev) => {
                                  const next = new Set(prev);
                                  checked ? next.delete(itemKey) : next.add(itemKey);
                                  return next;
                                })}
                                aria-label={t('packed_aria')}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <div className="sorter-row-details">
                                <div className="sorter-row-field">
                                  <span className="sorter-row-label">{t('name_label')}</span>
                                  <span className="sorter-row-value">{item.product_name?.name || '-'}</span>
                                </div>
                                {item.product_name?.sku && (
                                  <div className="sorter-row-field">
                                    <span className="sorter-row-label">{t('barcode_label')}</span>
                                    <span className="sorter-row-value">{item.product_name.sku}</span>
                                  </div>
                                )}
                                <div className="sorter-row-field">
                                  <span className="sorter-row-label">{t('quantity_label')}</span>
                                  <span className="sorter-row-value sorter-row-qty">{item.quantity_in_order ?? '-'}{item.metric_type ? ' ' + item.metric_type : ''}</span>
                                </div>
                                {item.cut_type?.name && (
                                  <div className="sorter-row-field">
                                    <span className="sorter-row-label">{t('cut_type_label')}</span>
                                    <span className="sorter-row-value">{item.cut_type.name}</span>
                                  </div>
                                )}
                                {item.comment && (
                                  <div className="sorter-row-field sorter-row-note-field">
                                    <span className="sorter-row-label">{t('note_label')}</span>
                                    <span className="sorter-row-value sorter-row-note">{item.comment}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showSorterShiftModal && (
          <div className="modal-overlay shift-modal-overlay">
            <div className="modal-box shift-modal-box" role="dialog" aria-modal="true">
              <div className="shift-modal-logo">
                <img src="/keshet.png" alt="Keshet Taamim" />
              </div>
              <h2 className="shift-modal-title">{t('sorter_shift_modal_title')}</h2>
              <p className="shift-modal-subtitle">{t('enter_name_prompt')}</p>
              <input
                className="shift-modal-input"
                placeholder={t('full_name')}
                value={sorterShiftNameInput}
                onChange={(e) => setSorterShiftNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && sorterShiftNameInput.trim()) {
                    const name = sorterShiftNameInput.trim();
                    localStorage.setItem('sorterShiftName', name);
                    setSorterShiftName(name);
                    setShowSorterShiftModal(false);
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="shift-modal-confirm"
                disabled={!sorterShiftNameInput.trim()}
                onClick={() => {
                  const name = sorterShiftNameInput.trim();
                  localStorage.setItem('sorterShiftName', name);
                  setSorterShiftName(name);
                  setShowSorterShiftModal(false);
                }}
              >
                {t('start_shift')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }


  if (isBoardRoute(route)) {
    const showOrdersOnly = isBoardOrdersRoute(route);
    const selectedNames = boardDepartments
      .filter((dept) => boardDepartmentIds.includes(Number(dept.id)))
      .map((dept) => getDeptName(dept.name));
    if (showOrdersOnly) {
      const timeStr = clockTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      const dateStr = clockTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
      return (
        <div className="board-tv">
          <header className="board-tv-header">
            <div className="board-tv-logo">
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <div className="board-tv-brand">
              <div className="board-tv-dept">{selectedNames.join(' / ')}</div>
              <div className="board-tv-tagline">{t('board_tagline')}</div>
            </div>
            <div className="board-tv-clock">
              <div className="board-tv-time">{timeStr}</div>
              <div className="board-tv-date">{dateStr}</div>
            </div>
          </header>
          <div className="board-tv-columns">
            <div className="board-tv-col">
              <div className="board-tv-col-header">
                <span className="board-tv-col-title">{t('in_progress_col')}</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {boardOrders.progress.length > 5 && (
                    <div className="board-tv-dots">
                      {Array.from({length: Math.ceil(boardOrders.progress.length / boardPageSize)}).map((_, p) => (
                        <span key={p} className={`board-tv-dot${p === boardProgressPage ? ' active' : ''}`} />
                      ))}
                    </div>
                  )}
                  <span className="board-tv-badge board-tv-badge-gray">{boardOrders.progress.length} {t('waiting')}</span>
                </div>
              </div>
              <div className="board-tv-cards" key={boardProgressPage}>
                {boardOrders.progress
                  .slice(boardProgressPage * boardPageSize, boardProgressPage * boardPageSize + boardPageSize)
                  .map((order, i) => {
                    const globalIndex = boardProgressPage * boardPageSize + i;
                    return (
                      <div key={order.id} className={`board-tv-card${globalIndex === 0 ? ' board-tv-card-next' : ''}`}>
                        <div className={`board-tv-num-badge${globalIndex === 0 ? ' next' : ''}`}>{globalIndex + 1}</div>
                        <div className="board-tv-card-body">
                          <div className="board-tv-card-name">{order.customer_name || '-'}</div>
                          {globalIndex === 0 && <div className="board-tv-next-label">{t('next_in_progress')}</div>}
                        </div>
                        <div className="board-tv-order-badge">
                          <span className="board-tv-order-label">{t('order_label')}</span>
                          <span className="board-tv-order-num">#{order.order_number ?? order.id}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="board-tv-col">
              <div className="board-tv-col-header">
                <span className="board-tv-col-title">{t('done_col')}</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {boardOrders.done.length > boardPageSize && (
                    <div className="board-tv-dots">
                      {Array.from({length: Math.ceil(boardOrders.done.length / boardPageSize)}).map((_, p) => (
                        <span key={p} className={`board-tv-dot${p === boardDonePage ? ' active' : ''}`} />
                      ))}
                    </div>
                  )}
                  <span className="board-tv-badge board-tv-badge-green">{boardOrders.done.length} {t('ready_count')}</span>
                </div>
              </div>
              <div className="board-tv-cards" key={boardDonePage}>
                {boardOrders.done
                  .slice(boardDonePage * boardPageSize, boardDonePage * boardPageSize + boardPageSize)
                  .map((order) => (
                    <div key={order.id} className="board-tv-card board-tv-card-ready">
                      <div className="board-tv-card-body">
                        <div className="board-tv-card-name">{order.customer_name || '-'}</div>
                      </div>
                      <div className="board-tv-order-badge">
                        <span className="board-tv-order-label">{t('order_label')}</span>
                        <span className="board-tv-order-num">#{order.order_number ?? order.id}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <button className="board-tv-settings-btn" onClick={() => setShowBoardSettings(true)}>⚙️</button>
          {showBoardSettings && (
            <div className="board-tv-settings-overlay" onClick={() => setShowBoardSettings(false)}>
              <div className="board-tv-settings-card" onClick={e => e.stopPropagation()}>
                <div className="board-tv-settings-title">{t('display_settings')}</div>
                <label className="board-tv-settings-label">
                  {t('orders_per_slide')}
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={boardPageSize}
                    className="board-tv-settings-input"
                    onChange={e => {
                      const v = Math.max(1, Number(e.target.value));
                      setBoardPageSize(v);
                      localStorage.setItem('boardPageSize', v);
                    }}
                  />
                </label>
                <button className="board-tv-settings-close" onClick={() => setShowBoardSettings(false)}>{t('save_and_close')}</button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="board-page">
        <header className="board-header">
          <div className="board-logo">
            <img src="/keshet.png" alt="Keshet Taamim" />
          </div>
          <h1 className="board-title">{t('department')}</h1>
        </header>
        <div className="board-shell">
          <section className="board-card">
            <div className="board-search">
              <input placeholder={t('search')} />
            </div>
            <div className="board-list">
              {boardLoading && <div className="helper-text">{t('loading_departments')}</div>}
              {boardError && <div className="helper-text error-text">{boardError}</div>}
              {!boardLoading &&
                !boardError &&
                boardDepartments.map((dept) => {
                  const id = Number(dept.id);
                  const isSelected = boardDepartmentIds.includes(id);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      className={`board-row${isSelected ? ' selected' : ''}`}
                      onClick={() =>
                        setBoardDepartmentIds((prev) => {
                          if (prev.includes(id)) return prev.filter((v) => v !== id);
                          return [...prev, id];
                        })
                      }
                    >
                      {getDeptName(dept.name)}
                    </button>
                  );
                })}
            </div>
          </section>
          <button
            type="button"
            className="board-action"
            onClick={() => handleBoardShowOrders()}
            disabled={!boardDepartmentIds.length || boardLoading}
          >
            {t('show_orders')}
          </button>
        </div>
      </div>
    );
  }

  if (isCashierRoute(route)) {
    const hasOrders = cashierOrders.length > 0;
    return (
      <div className="cashier-page">
        <header className="cashier-header cashier-header-new">
          <div className="cashier-header-row1">
            <button
              type="button"
              className="back-button"
              onClick={navigateHome}
              aria-label="Back"
            >
              ↩
            </button>
            <h1 className="cashier-title">{t('history')}</h1>
          </div>
          {cashierShiftName && (
            <div className="cashier-header-row2">
              <span className="shift-name-label">👤 {cashierShiftName}</span>
              <button
                type="button"
                className="end-shift-button"
                onClick={() => setShowEndShiftConfirm(true)}
              >
                {t('end_shift')}
              </button>
            </div>
          )}
        </header>
        <div className="cashier-shell">
          <section className="cashier-main">
            <div className="cashier-main-content">
              {cashierLoading && <div className="helper-text">{t('loading_orders')}</div>}
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
                        <div className="order-meta">
                          <div className="order-number">
                            #{order.order_number ?? order.id}
                          </div>
                          {order.customer_name && (
                            <div className="order-customer">{order.customer_name}</div>
                          )}
                        </div>
                      </button>
                      {expandedOrderId === order.id && (
                        <div className="order-detail">
                          <div className="order-detail-header">
                            <div className="order-detail-title">
                              {t('order_label')} #{order.order_number ?? order.id}
                              {order.customer_name && (
                                <span className="order-detail-customer">
                                  {' '}
                                  · {order.customer_name}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="order-detail-reprint"
                              onClick={() => handleReprintOrder(order)}
                              disabled={orderItemsLoadingById[order.id] || !(orderItemsById[order.id]?.length)}
                            >
                              {t('reprint')}
                            </button>
                          </div>
                          <div className="order-detail-list">
                            {orderItemsLoadingById[order.id] && (
                              <div className="helper-text">{t('loading_items')}</div>
                            )}
                            {orderItemsErrorById[order.id] && (
                              <div className="helper-text error-text">
                                {orderItemsErrorById[order.id]}
                              </div>
                            )}
                            {!orderItemsLoadingById[order.id] &&
                              !orderItemsErrorById[order.id] &&
                              (orderItemsById[order.id] || []).length === 0 && (
                                <div className="helper-text">{t('no_items')}</div>
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
                                      {item.comment || t('no_comment')}
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
                <div className="helper-text">{t('no_orders')}</div>
              )}
            </div>
          </section>
          <aside className="cashier-side">
            <div className="cashier-logo">
              <img src="/keshet.png" alt="Keshet Taamim" />
            </div>
            <button type="button" className="cashier-primary cashier-primary-sticky" onClick={() => {
              setLastAddedProduct(null);
              setProductQuery('');
              setTextInput('');
              navigate('/cashier-new');
            }}>
              {t('create_new_order')}
            </button>
            <div className="cashier-search">
              <input
                placeholder={t('search_order_placeholder')}
                value={cashierSearch}
                onChange={(event) => setCashierSearch(event.target.value)}
              />
              <button type="button" aria-label="Search">
                🔍
              </button>
            </div>
            <div className="cashier-hint">{t('search_order')}</div>
          </aside>
        </div>

        {showShiftModal && (
          <div className="modal-overlay shift-modal-overlay">
            <div className="modal-box shift-modal-box" role="dialog" aria-modal="true">
              <div className="shift-modal-logo">
                <img src="/keshet.png" alt="Keshet Taamim" />
              </div>
              <h2 className="shift-modal-title">{t('cashier_shift_modal_title')}</h2>
              <p className="shift-modal-subtitle">{t('enter_name_prompt')}</p>
              <input
                className="shift-modal-input"
                placeholder={t('full_name')}
                value={shiftNameInput}
                onChange={(e) => setShiftNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && shiftNameInput.trim()) {
                    const name = shiftNameInput.trim();
                    localStorage.setItem('cashierShiftName', name);
                    setCashierShiftName(name);
                    setShowShiftModal(false);
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="shift-modal-confirm"
                disabled={!shiftNameInput.trim()}
                onClick={() => {
                  const name = shiftNameInput.trim();
                  localStorage.setItem('cashierShiftName', name);
                  setCashierShiftName(name);
                  setShowShiftModal(false);
                }}
              >
                {t('start_shift')}
              </button>
            </div>
          </div>
        )}

        {showEndShiftConfirm && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-box shift-confirm-box">
              <h2 className="shift-confirm-title">{t('end_shift_confirm')}</h2>
              <div className="shift-confirm-actions">
                <button
                  type="button"
                  className="shift-confirm-yes"
                  onClick={() => {
                    localStorage.removeItem('cashierShiftName');
                    setCashierShiftName('');
                    setShowEndShiftConfirm(false);
                    navigateHome();
                  }}
                >
                  {t('yes_exit_shift')}
                </button>
                <button
                  type="button"
                  className="shift-confirm-no"
                  onClick={() => setShowEndShiftConfirm(false)}
                >
                  {t('no_cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="cashier-header cashier-header-new home-top-header">
        <div className="cashier-header-row1">
          {cashierShiftName && (
            <span className="shift-name-label">👤 {cashierShiftName}</span>
          )}
          <div className="home-header-lang">
            {[{code:'he',label:'עב',flag:'🇮🇱'},{code:'en',label:'EN',flag:'🇬🇧'},{code:'th',label:'ไทย',flag:'🇹🇭'}].map(l => (
              <button key={l.code} className={`lang-btn${language===l.code?' active':''}`} onClick={() => { setLanguage(l.code); localStorage.setItem('language',l.code); }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          {cashierShiftName && (
            <button
              type="button"
              className="end-shift-button"
              onClick={() => setShowEndShiftConfirm(true)}
            >
              {t('end_shift')}
            </button>
          )}
        </div>
      </div>
      {showEndShiftConfirm && (
        <div className="shift-modal-overlay">
          <div className="shift-confirm-box">
            <p className="shift-confirm-text">{t('end_shift_confirm')}</p>
            <div className="shift-confirm-actions">
              <button
                type="button"
                className="shift-confirm-yes"
                onClick={() => {
                  setCashierShiftName('');
                  localStorage.removeItem('cashierShiftName');
                  setShowEndShiftConfirm(false);
                }}
              >
                {t('yes_exit_shift')}
              </button>
              <button
                type="button"
                className="shift-confirm-no"
                onClick={() => setShowEndShiftConfirm(false)}
              >
                {t('no_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="hero-card">
        <div className="hero-logo">
          <img src="/keshet.png" alt="Keshet Taamim" className="logo-img" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{t('department')}</h1>
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
              placeholder={t('search')}
              className="search-input"
            />
          </div>
          {loading && <div className="helper-text">{t('loading_departments')}</div>}
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
                    <span>{getDeptName(item.name)}</span>
                  </li>
                ))
              ) : (
                !loading &&
                !error && (
                  <li className="department-row">
                    <span>{t('no_departments')}</span>
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
          {ordersLoading ? t('loading_order_history') : ordersError}
        </div>
      )}
    </div>
  );
}
