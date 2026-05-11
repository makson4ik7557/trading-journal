const API_BASE = 'http://localhost:4000/api';

const TOKEN_KEY = 'tj_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body !== undefined) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    throw new Error(`Network error: cannot reach server at ${API_BASE}. Is backend running?`);
  }

  // 401 = invalid/expired token
  if (response.status === 401 && auth) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('tj_user');
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
    throw new Error('Session expired');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};