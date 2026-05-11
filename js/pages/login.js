import { login } from '../auth.js';
import { redirectIfLoggedIn } from '../router.js';

redirectIfLoggedIn();

const form = document.querySelector('#login-form');
const errorEl = document.querySelector('#login-error');
const submitBtn = document.querySelector('#login-submit');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  if (!email || !password) {
    errorEl.textContent = 'Email and password are required';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
    return;
  }

  try {
    await login(email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
  }
});