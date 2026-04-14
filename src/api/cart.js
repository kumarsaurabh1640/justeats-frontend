import api from './axios';

export const cartApi = {
  get: () => api.get('/cart'),
  add: (menuItemId, quantity = 1) => api.post('/cart', { menu_item_id: menuItemId, quantity }),
  update: (itemId, quantity) => api.patch(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};
