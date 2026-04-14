import api from './axios';

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  getOwner: () => api.get('/profile/owner'),
  updateOwner: (data) => api.patch('/profile/owner', data),
};
