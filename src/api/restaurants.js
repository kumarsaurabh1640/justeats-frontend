import api from './axios';

export const restaurantsApi = {
  list: (params) => api.get('/restaurants', { params }),
  mine: () => api.get('/restaurants/mine'),
  get: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.patch(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};
