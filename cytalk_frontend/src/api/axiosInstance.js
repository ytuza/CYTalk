import axios from 'axios';
import { store } from '../store';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.1.20:8000/api/',
});

axiosInstance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
