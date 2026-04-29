import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  init: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) set({ token, user: JSON.parse(user) });
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
