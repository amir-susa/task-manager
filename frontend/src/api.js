// src/api.js
import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = 'https://task-manager-2ner.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User registration API call
export const registerUser = async (userData) => {
  // Send POST request to /api/auth/register with the user data
  return await api.post('/auth/register', userData);
};

export default api;