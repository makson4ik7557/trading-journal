import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const computePnl = (t) => {
  if (t.exit_price == null) return null;
  const direction = t.side === 'buy' ? 1 : -1;
  return (t.exit_price - t.entry_price) * direction * t.quantity;
};

const round = (n) => Number(n.toFixed(2));

router.get('/', (req, res) => {
  const trades = db.prepare(`
    SELECT t.*, a.symbol AS asset_symbol
    FROM trades t JOIN assets a ON a.id = t.asset_id
    WHERE t.user_id = ?
  `).all(req.user.id);

  const closed = trades.filter(t => t.exit_price != null);
  const open = trades.filter(t => t.exit_price == null);
  const enriched = closed.map(t => ({ ...t, pnl: computePnl(t) }));

  const winning = enriched.filter(t => t.pnl > 0);
  const losing = enriched.filter(t => t.pnl < 0);

  const totalPnl = enriched.reduce((s, t) => s + t.pnl, 0);
  const winRate = closed.length ? (winning.length / closed.length) * 100 : 0;

  const best = enriched.reduce((b, t) => !b || t.pnl > b.pnl ? t : b, null);
  const worst = enriched.reduce((w, t) => !w || t.pnl < w.pnl ? t : w, null);

  // Breakdown by asset
  const byAssetMap = {};
  for (const t of enriched) {
    if (!byAssetMap[t.asset_symbol]) {
      byAssetMap[t.asset_symbol] = { symbol: t.asset_symbol, trades: 0, pnl: 0, wins: 0 };
    }
    byAssetMap[t.asset_symbol].trades++;
    byAssetMap[t.asset_symbol].pnl += t.pnl;
    if (t.pnl > 0) byAssetMap[t.asset_symbol].wins++;
  }

  // Profit factor: gross profit / gross loss
  const grossProfit = winning.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losing.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

  res.json({
    total_trades: trades.length,
    open_trades: open.length,
    closed_trades: closed.length,
    winning_trades: winning.length,
    losing_trades: losing.length,
    win_rate: round(winRate),
    total_pnl: round(totalPnl),
    avg_win: winning.length ? round(grossProfit / winning.length) : 0,
    avg_loss: losing.length ? round(-grossLoss / losing.length) : 0,
    profit_factor: profitFactor === Infinity ? null : round(profitFactor),
    best_trade: best ? {
      id: best.id,
      symbol: best.asset_symbol,
      pnl: round(best.pnl),
      side: best.side,
      entry_date: best.entry_date,
    } : null,
    worst_trade: worst ? {
      id: worst.id,
      symbol: worst.asset_symbol,
      pnl: round(worst.pnl),
      side: worst.side,
      entry_date: worst.entry_date,
    } : null,
    by_asset: Object.values(byAssetMap).map(a => ({
      symbol: a.symbol,
      trades: a.trades,
      pnl: round(a.pnl),
      win_rate: round((a.wins / a.trades) * 100),
    })),
  });
});

export default router;
