const TOKEN_KEY = 'vancolic_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),

  getPublicMenu: () => request('/menu', { auth: false }),
  getAllMenu: () => request('/menu/all'),
  createMenuItem: (item) => request('/menu', { method: 'POST', body: item }),
  updateMenuItem: (id, item) => request(`/menu/${id}`, { method: 'PATCH', body: item }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE' }),

  getTables: () => request('/tables'),
  openTable: (id, clientName, personsCount) =>
    request(`/tables/${id}/open`, { method: 'POST', body: { clientName, personsCount } }),
  renameTable: (id, label) => request(`/tables/${id}`, { method: 'PATCH', body: { label } }),

  getOrderItems: (orderId) => request(`/orders/${orderId}/items`),
  addOrderItem: (orderId, payload) => request(`/orders/${orderId}/items`, { method: 'POST', body: payload }),
  getOpenOrders: () => request('/orders'),
  closeOrder: (id, status) => request(`/orders/${id}/close`, { method: 'PATCH', body: { status } }),
  getClosedOrders: (startDate, endDate) =>
    request(`/orders/closed?startDate=${startDate}&endDate=${endDate}`),

  getActiveOrderItems: () => request('/order-items'),
  updateOrderItemStatus: (id, status) =>
    request(`/order-items/${id}/status`, { method: 'PATCH', body: { status } }),
  removeOrderItem: (id) => request(`/order-items/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PATCH', body: payload }),
};
