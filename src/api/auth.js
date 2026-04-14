import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) =>
    api.post('/auth/reset-password', { token, new_password }),
  changePassword: (current_password, new_password) =>
    api.post('/auth/change-password', { current_password, new_password }),
};
