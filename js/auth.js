import { api } from './api.js';

const TOKEN_KEY = 'tj_token';
const USER_KEY = 'tj_user';

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password }, { auth: false });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function register(name, email, password) {
  const data = await api.post('/auth/register', { name, email, password }, { auth: false });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login.html';
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === 'admin';
}