// src/api.js
import axios from "axios";

const API_BASE_URL = 'https://task-manager-2ner.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// IMPORTANT: This interceptor attaches the token to EVERY request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const registerUser = async (userData) => {
  return await api.post('/auth/register', userData);
};

export default api;