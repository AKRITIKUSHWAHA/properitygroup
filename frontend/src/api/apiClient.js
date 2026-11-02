/**
 * Centralized API Client for NJS Property Group Frontend
 * Communicates with backend on http://localhost:5000/api/v1 (or via /api/v1 proxy)
 * Automatically attaches Authorization Bearer token from localStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, token } = {}) {
  const authToken = token || localStorage.getItem('property_group_auth_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = data?.message || data || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.errors || []);
    }

    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or offline fallback
    throw new ApiError(error.message || 'Network connection to backend failed', 0);
  }
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
