// auth.js - token helpers and common functions
const auth = {
  saveToken(token) { localStorage.setItem('hmdc_token', token); },
  getToken() { return localStorage.getItem('hmdc_token'); },
  clearToken() { localStorage.removeItem('hmdc_token'); },
  isAuthenticated() { return !!this.getToken(); }
};

// helper to handle JSON responses
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  let body;
  try { body = await res.json(); } catch(e) { body = null; }
  return { ok: res.ok, status: res.status, body, res };
}

// Redirect helper
function go(path) { window.location.href = path; }
