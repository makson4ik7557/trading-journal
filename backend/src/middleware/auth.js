import { verifyToken } from '../auth.js';
import { db } from '../db.js';

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

  const user = db
    .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
    .get(payload.id);
  if (!user) return res.status(401).json({ error: 'User not found' });

  req.user = user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};
