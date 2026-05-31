import axios from 'axios';

const garageClient = axios.create({
 baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

garageClient.interceptors.request.use(config => {
  const token = localStorage.getItem('garage_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

garageClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('garage_token');
      localStorage.removeItem('garage_user');
      window.location.href = '/garage/login';
    }
    return Promise.reject(err);
  }
);

export default garageClient;
