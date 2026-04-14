import api from './axios';

export const ordersApi = {
  place: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  restaurantOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
  get: (orderId) => api.get(`/orders/${orderId}`),
  updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
};
