import { register } from '../auth.js';
import { redirectIfLoggedIn } from '../router.js';

redirectIfLoggedIn();

const form = document.querySelector('#register-form');
const errorEl = document.querySelector('#register-error');
const submitBtn = document.querySelector('#register-submit');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  const name = document.querySelector('#name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  if (!name || !email || !password) {
    errorEl.textContent = 'All fields are required';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
    return;
  }

  try {
    await register(name, email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Registration failed';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create account';
  }
});