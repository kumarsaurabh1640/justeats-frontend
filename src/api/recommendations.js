import api from './axios';

export const recommendationsApi = {
  get: () => api.get('/recommendations'),
};
