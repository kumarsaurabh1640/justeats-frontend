import api from './axios';

export const favouritesApi = {
  list: () => api.get('/favourites'),
  add: (restaurantId) => api.post(`/favourites/${restaurantId}`),
  remove: (restaurantId) => api.delete(`/favourites/${restaurantId}`),
};
