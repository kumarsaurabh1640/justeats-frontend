import api from './axios';

export const menuItemsApi = {
  list: (restaurantId, params) =>
    api.get(`/restaurants/${restaurantId}/menu-items`, { params }),
  mostlyOrdered: (restaurantId) =>
    api.get(`/restaurants/${restaurantId}/menu-items/mostly-ordered`),
  get: (restaurantId, itemId) =>
    api.get(`/restaurants/${restaurantId}/menu-items/${itemId}`),
  create: (restaurantId, data) =>
    api.post(`/restaurants/${restaurantId}/menu-items`, data),
  update: (restaurantId, itemId, data) =>
    api.patch(`/restaurants/${restaurantId}/menu-items/${itemId}`, data),
  delete: (restaurantId, itemId) =>
    api.delete(`/restaurants/${restaurantId}/menu-items/${itemId}`),
  toggleSpecial: (restaurantId, itemId) =>
    api.post(`/restaurants/${restaurantId}/menu-items/${itemId}/toggle-special`),
  toggleAvailable: (restaurantId, itemId) =>
    api.post(`/restaurants/${restaurantId}/menu-items/${itemId}/toggle-available`),
};
