import { Router } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, signToken } from '../auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, name are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, ?, 'user')
  `).run(email, hashPassword(password), name);

  const user = db
    .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
    .get(result.lastInsertRowid);
  const token = signToken(user);
  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row || !comparePassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = signToken(user);
  res.json({ user, token });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
