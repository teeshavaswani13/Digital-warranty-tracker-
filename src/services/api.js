const TOKEN_KEY = 'dwt_auth_token';
const USER_KEY = 'dwt_auth_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearStoredAuth();
    window.dispatchEvent(new Event('dwt-auth-expired'));
    throw new Error('Your session has expired. Please log in again.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected server error occurred.');
  }

  return data;
}

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate.');
    }

    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async register(name, email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async getMe() {
    return fetchWithAuth('/api/auth/me');
  },

  // Dashboard Metrics
  async getDashboardStats() {
    return fetchWithAuth('/api/dashboard/stats');
  },

  // Products
  async getProducts(params) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString();
    const url = queryString ? `/api/products?${queryString}` : '/api/products';
    return fetchWithAuth(url);
  },

  async getProductById(id) {
    return fetchWithAuth(`/api/products/${id}`);
  },

  async createProduct(payload) {
    return fetchWithAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id, payload) {
    return fetchWithAuth(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(id) {
    return fetchWithAuth(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Date & Warranty Calculation Helpers (for instant client-side live feedback)
export function calculateExpiryDate(purchaseDateStr, durationMonths) {
  if (!purchaseDateStr || !durationMonths || durationMonths <= 0) return '';
  const [yearStr, monthStr, dayStr] = purchaseDateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + durationMonths);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function calculateWarrantyStatus(expiryDateStr) {
  if (!expiryDateStr) return { status: 'active', daysRemaining: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [yearStr, monthStr, dayStr] = expiryDateStr.split('-');
  const expiry = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  } else if (daysRemaining <= 30) {
    return { status: 'expiring_soon', daysRemaining };
  } else {
    return { status: 'active', daysRemaining };
  }
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '';
  return `₹${num.toLocaleString('en-IN')}`;
}

