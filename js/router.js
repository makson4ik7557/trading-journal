import { isLoggedIn, getCurrentUser, isAdmin, logout } from './auth.js';

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

export function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

export function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}

export function renderUserChrome() {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll('[data-user-name]').forEach((el) => {
    el.textContent = user.name;
  });

  document.querySelectorAll('[data-user-avatar]').forEach((el) => {
    el.textContent = user.name.slice(0, 2).toUpperCase();
  });

  if (user.role !== 'admin') {
    document.querySelectorAll('[data-admin-only]').forEach((el) => {
      el.style.display = 'none';
    });
  }
//labuba
  document.querySelectorAll('[data-logout]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}