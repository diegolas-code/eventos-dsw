import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    if (config.headers) {
      (config.headers as any).set
        ? (config.headers as any).set('Authorization', `Bearer ${token}`)
        : (config.headers['Authorization'] = `Bearer ${token}`);
    }
  }

  return config;
});

export default api;
