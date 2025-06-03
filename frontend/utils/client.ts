// /utils/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

export const apiClient = axios.create({
  baseURL: process.env.PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});