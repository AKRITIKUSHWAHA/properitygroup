import { api } from './apiClient';

export const authApi = {
  login: async (email, password, portalRole = null) => {
    return api.post('/auth/login', { email, password, portalRole });
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  logout: async () => {
    return api.post('/auth/logout');
  },
};
