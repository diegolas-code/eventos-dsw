import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

export default api;
