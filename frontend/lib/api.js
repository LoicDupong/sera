import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Converts a relative upload path like /uploads/covers/abc.jpg to an absolute URL
// using the same origin as the API (strips the /api suffix).
export const getMediaUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
  return `${base}${filePath}`;
};
