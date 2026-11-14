/**
 * Centralized API Client for NJS Property Group Frontend
 * Dynamically resolves to Railway live backend in production or localhost:5000 in dev
 * Automatically attaches Authorization Bearer token from localStorage
 */

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    // If running in production / live domain (njspropertygroup.com, netlify, etc.)
    if (!isLocalhost) {
      if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('localhost')) {
        return envUrl;
      }
      return 'https://njs-proprty-group-production.up.railway.app/api/v1';
    }
  }
  return envUrl || 'http://localhost:5000/api/v1';
}

export class ApiError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, token } = {}) {
  const authToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('property_group_auth_token') : null);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const config = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Guard against static SPA hosts returning index.html for unmounted /api routes
    if (!isJson && (contentType.includes('text/html') || (typeof data === 'string' && /^\s*<!doctype|^\s*<html/i.test(data)))) {
      throw new ApiError('API endpoint unavailable on static host', 404);
    }

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

