import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const VALID_MARKETS = ['crypto', 'stock', 'forex', 'commodity'];

// Read: any authenticated user
router.get('/', requireAuth, (req, res) => {
  const { market } = req.query;
  let query = 'SELECT * FROM assets';
  const params = [];
  if (market) { query += ' WHERE market = ?'; params.push(market); }
  query += ' ORDER BY symbol';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', requireAuth, (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

// Write: admin only
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { symbol, name, market } = req.body || {};
  if (!symbol || !name || !market) {
    return res.status(400).json({ error: 'symbol, name, market are required' });
  }
  if (!VALID_MARKETS.includes(market)) {
    return res.status(400).json({ error: `market must be one of: ${VALID_MARKETS.join(', ')}` });
  }

  try {
    const result = db.prepare(`
      INSERT INTO assets (symbol, name, market) VALUES (?, ?, ?)
    `).run(symbol.toUpperCase(), name, market);
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(asset);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Symbol already exists' });
    }
    throw err;
  }
});

router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const { symbol, name, market } = req.body || {};
  const asset = db.prepare('SELECT id FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (market && !VALID_MARKETS.includes(market)) {
    return res.status(400).json({ error: `market must be one of: ${VALID_MARKETS.join(', ')}` });
  }

  const fields = [];
  const values = [];
  if (symbol !== undefined) { fields.push('symbol = ?'); values.push(symbol.toUpperCase()); }
  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (market !== undefined) { fields.push('market = ?'); values.push(market); }
  if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.id);
  try {
    db.prepare(`UPDATE assets SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Symbol already exists' });
    }
    throw err;
  }

  res.json(db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Asset not found' });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(409).json({ error: 'Asset is used in trades and cannot be deleted' });
    }
    throw err;
  }
});

export default router;
