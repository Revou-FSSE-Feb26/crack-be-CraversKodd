// src/services/api.js
import axios from 'axios';

// Buat instance Axios dengan base URL backend kita
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor: Otomatis menyisipkan token JWT ke setiap request yang membutuhkan login
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('spacesync_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;