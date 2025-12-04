import axios from 'axios';
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api',
  timeout: 10000,
});
export default api;
