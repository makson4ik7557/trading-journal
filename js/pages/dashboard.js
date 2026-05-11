import { api } from '../api.js';
import { requireAuth, renderUserChrome } from '../router.js';
import { getCurrentUser } from '../auth.js';

if (!requireAuth()) {
  throw new Error('Not authenticated');
}

renderUserChrome();

function formatMoney(value) {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value).toFixed(2);
  return `${sign}$${abs}`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setClass(selector, cls, on) {
  const el = document.querySelector(selector);
  if (el) el.classList.toggle(cls, on);
}

async function load() {
  try {
    const user = getCurrentUser();
    setText('[data-welcome]', `Welcome back, ${user.name}`);

    const stats = await api.get('/stats');

    setText('[data-stat-pnl]', formatMoney(stats.total_pnl));
    setClass('[data-kpi-pnl]', 'kpi-card--profit', stats.total_pnl > 0);
    setClass('[data-kpi-pnl]', 'kpi-card--loss', stats.total_pnl < 0);

    setText('[data-stat-winrate]', formatPercent(stats.win_rate));
    setText('[data-stat-winrate-detail]', `${stats.winning_trades} of ${stats.closed_trades} closed`);

    setText('[data-stat-total]', String(stats.total_trades));
    setText('[data-stat-total-detail]', `${stats.open_trades} open · ${stats.closed_trades} closed`);

    setText('[data-stat-pf]', stats.profit_factor !== null ? stats.profit_factor.toFixed(2) : '—');

    if (stats.best_trade) {
      setText('[data-best]', `${stats.best_trade.symbol} ${formatMoney(stats.best_trade.pnl)}`);
    }
    if (stats.worst_trade) {
      setText('[data-worst]', `${stats.worst_trade.symbol} ${formatMoney(stats.worst_trade.pnl)}`);
    }

    renderByAsset(stats.by_asset || []);
    await renderRecentTrades();
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard: ' + err.message);
  }
}

function renderByAsset(items) {
  const container = document.querySelector('[data-by-asset]');
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<div class="empty-state__text">No closed trades yet</div>';
    return;
  }

  container.innerHTML = items.map((a) => `
    <div class="asset-row">
      <div class="asset-row__symbol">
        <div class="asset-row__icon">${a.symbol[0]}</div>
        <div>${a.symbol}</div>
      </div>
      <div class="asset-row__stats">
        <div class="asset-row__stat">
          <div class="asset-row__stat-label">Trades</div>
          <div class="asset-row__stat-value">${a.trades}</div>
        </div>
        <div class="asset-row__stat">
          <div class="asset-row__stat-label">P&amp;L</div>
          <div class="asset-row__stat-value ${a.pnl >= 0 ? 'table__profit' : 'table__loss'}">${formatMoney(a.pnl)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

async function renderRecentTrades() {
  const tbody = document.querySelector('[data-recent-trades]');
  if (!tbody) return;

  const trades = await api.get('/trades');
  const recent = trades.slice(0, 5);

  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">No trades yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map((t) => `
    <tr>
      <td><strong>${t.asset_symbol}</strong></td>
      <td><span class="badge badge--${t.side}">${t.side}</span></td>
      <td class="${t.pnl >= 0 ? 'table__profit' : 'table__loss'}">${t.pnl !== null ? formatMoney(t.pnl) : '—'}</td>
      <td>${formatDate(t.entry_date)}</td>
    </tr>
  `).join('');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

load();