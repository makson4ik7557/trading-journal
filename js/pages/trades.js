import { api } from '../api.js';
import { requireAuth, renderUserChrome } from '../router.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

renderUserChrome();

const state = {
  assets: [],
  trades: [],
};

function formatMoney(value) {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value).toFixed(2);
  return `${sign}$${abs}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildFilters() {
  const filters = {};
  const assetId = document.querySelector('#filter-asset').value;
  const side = document.querySelector('#filter-side').value;
  const status = document.querySelector('#filter-status').value;
  const from = document.querySelector('#filter-from').value;
  const to = document.querySelector('#filter-to').value;

  if (assetId) filters.asset_id = assetId;
  if (side) filters.side = side;
  if (status) filters.status = status;
  if (from) filters.from = from;
  if (to) filters.to = to;
  return filters;
}

function buildQuery(filters) {
  const params = new URLSearchParams(filters);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function loadAssets() {
  state.assets = await api.get('/assets');
  const select = document.querySelector('#filter-asset');
  select.innerHTML = '<option value="">All assets</option>' +
        state.assets.map((a) => `<option value="${a.id}">${a.symbol}</option>`).join('');
}

async function loadTrades() {
  const tbody = document.querySelector('[data-trades-tbody]');
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px;">Loading…</td></tr>';

  try {
    const trades = await api.get(`/trades${buildQuery(buildFilters())}`);
    state.trades = trades;
    renderTrades();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--loss);">Error: ${err.message}</td></tr>`;
  }
}

function renderTrades() {
  const tbody = document.querySelector('[data-trades-tbody]');

  if (!state.trades.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:48px; color:var(--text-muted);">No trades match the filters</td></tr>';
    return;
  }

  tbody.innerHTML = state.trades.map((t) => `
    <tr>
      <td><strong>${t.asset_symbol}</strong></td>
      <td><span class="badge badge--${t.side}">${t.side}</span></td>
      <td class="table__num">${t.entry_price.toFixed(2)}</td>
      <td class="table__num">${t.exit_price !== null ? t.exit_price.toFixed(2) : '—'}</td>
      <td class="table__num">${t.quantity}</td>
      <td class="${t.pnl !== null && t.pnl >= 0 ? 'table__profit' : 'table__loss'}">${t.pnl !== null ? formatMoney(t.pnl) : '—'}</td>
      <td><span class="badge badge--${t.status}">${t.status}</span></td>
      <td>${formatDate(t.entry_date)}</td>
      <td>
        <div class="table__actions">
          <button class="btn btn--danger btn--sm" data-delete="${t.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteTrade(btn.dataset.delete));
  });
}

async function deleteTrade(id) {
  if (!confirm('Delete this trade?')) return;
  try {
    await api.delete(`/trades/${id}`);
    await loadTrades();
  } catch (err) {
    alert('Failed to delete: ' + err.message);
  }
}

document.querySelector('#filter-apply').addEventListener('click', loadTrades);
document.querySelector('#filter-reset').addEventListener('click', () => {
  document.querySelector('#filter-asset').value = '';
  document.querySelector('#filter-side').value = '';
  document.querySelector('#filter-status').value = '';
  document.querySelector('#filter-from').value = '';
  document.querySelector('#filter-to').value = '';
  loadTrades();
});

async function init() {
  await loadAssets();
  await loadTrades();
}

init();