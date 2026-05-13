import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Compute derived fields: pnl, pnl_percent, status, result
const computePnl = (trade) => {
  if (trade.exit_price == null) {
    return { pnl: null, pnl_percent: null, status: 'open', result: null };
  }
  const direction = trade.side === 'buy' ? 1 : -1;
  const priceDiff = (trade.exit_price - trade.entry_price) * direction;
  const pnl = priceDiff * trade.quantity;
  const pnl_percent = (priceDiff / trade.entry_price) * 100;
  let result = 'breakeven';
  if (pnl > 0) result = 'win';
  else if (pnl < 0) result = 'loss';
  return {
    pnl: Number(pnl.toFixed(4)),
    pnl_percent: Number(pnl_percent.toFixed(4)),
    status: 'closed',
    result,
  };
};

const enrich = (trade) => trade ? { ...trade, ...computePnl(trade) } : trade;

const TRADE_SELECT = `
  SELECT t.*, a.symbol AS asset_symbol, a.name AS asset_name, a.market AS asset_market
  FROM trades t JOIN assets a ON a.id = t.asset_id
`;

router.get('/', (req, res) => {
  const { asset_id, side, status, from, to } = req.query;
  let query = `${TRADE_SELECT} WHERE t.user_id = ?`;
  const params = [req.user.id];
  if (asset_id) { query += ' AND t.asset_id = ?'; params.push(asset_id); }
  if (side) { query += ' AND t.side = ?'; params.push(side); }
  if (status === 'open') query += ' AND t.exit_price IS NULL';
  if (status === 'closed') query += ' AND t.exit_price IS NOT NULL';
  if (from) { query += ' AND t.entry_date >= ?'; params.push(from); }
  if (to) { query += ' AND t.entry_date <= ?'; params.push(to); }
  query += ' ORDER BY t.entry_date DESC, t.id DESC';

  res.json(db.prepare(query).all(...params).map(enrich));
});

router.get('/:id', (req, res) => {
  const trade = db.prepare(`${TRADE_SELECT} WHERE t.id = ? AND t.user_id = ?`)
    .get(req.params.id, req.user.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  res.json(enrich(trade));
});

router.post('/', (req, res) => {
  const { asset_id, side, entry_price, exit_price, quantity, entry_date, exit_date, notes } = req.body || {};

  if (!asset_id || !side || entry_price == null || quantity == null || !entry_date) {
    return res.status(400).json({
      error: 'asset_id, side, entry_price, quantity, entry_date are required',
    });
  }
  if (!['buy', 'sell'].includes(side)) {
    return res.status(400).json({ error: 'side must be buy or sell' });
  }
  if (entry_price <= 0 || quantity <= 0) {
    return res.status(400).json({ error: 'entry_price and quantity must be positive' });
  }
  if (exit_price != null && exit_price <= 0) {
    return res.status(400).json({ error: 'exit_price must be positive' });
  }

  const asset = db.prepare('SELECT id FROM assets WHERE id = ?').get(asset_id);
  if (!asset) return res.status(400).json({ error: 'Asset not found' });

  const result = db.prepare(`
    INSERT INTO trades
      (user_id, asset_id, side, entry_price, exit_price, quantity, entry_date, exit_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id, asset_id, side, entry_price,
    exit_price ?? null, quantity, entry_date,
    exit_date ?? null, notes ?? null
  );

  const trade = db.prepare(`${TRADE_SELECT} WHERE t.id = ?`).get(result.lastInsertRowid);
  res.status(201).json(enrich(trade));
});

router.patch('/:id', (req, res) => {
  const trade = db.prepare('SELECT * FROM trades WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });

  const allowed = ['asset_id', 'side', 'entry_price', 'exit_price', 'quantity', 'entry_date', 'exit_date', 'notes'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });

  // Re-validate side if changed
  if (req.body.side && !['buy', 'sell'].includes(req.body.side)) {
    return res.status(400).json({ error: 'side must be buy or sell' });
  }

  fields.push("updated_at = datetime('now')");
  values.push(req.params.id, req.user.id);
  db.prepare(`UPDATE trades SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const updated = db.prepare(`${TRADE_SELECT} WHERE t.id = ?`).get(req.params.id);
  res.json(enrich(updated));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM trades WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Trade not found' });
  res.status(204).end();
});

export default router;
