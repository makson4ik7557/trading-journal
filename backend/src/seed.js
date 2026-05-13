import 'dotenv/config';
import { db } from './db.js';
import { hashPassword } from './auth.js';

console.log('Seeding database...');

// Wipe everything for a clean state
db.exec('DELETE FROM trades; DELETE FROM assets; DELETE FROM users;');
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','assets','trades');");

// === Users ===
const seedUsers = [
  { email: 'admin@journal.dev', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'user@journal.dev', password: 'user123', name: 'Demo Trader', role: 'user' },
];

const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)
`);
const userIds = {};
for (const u of seedUsers) {
  const r = insertUser.run(u.email, hashPassword(u.password), u.name, u.role);
  userIds[u.email] = r.lastInsertRowid;
  console.log(`  user: ${u.email} / ${u.password} (${u.role})`);
}

// === Assets ===
const seedAssets = [
  ['BTC', 'Bitcoin', 'crypto'],
  ['ETH', 'Ethereum', 'crypto'],
  ['SOL', 'Solana', 'crypto'],
  ['ADA', 'Cardano', 'crypto'],
  ['AAPL', 'Apple Inc.', 'stock'],
  ['TSLA', 'Tesla Inc.', 'stock'],
  ['NVDA', 'Nvidia Corp.', 'stock'],
  ['MSFT', 'Microsoft Corp.', 'stock'],
  ['EURUSD', 'Euro / US Dollar', 'forex'],
  ['GBPUSD', 'British Pound / US Dollar', 'forex'],
  ['GOLD', 'Gold Spot', 'commodity'],
  ['OIL', 'Crude Oil', 'commodity'],
];
const insertAsset = db.prepare('INSERT INTO assets (symbol, name, market) VALUES (?, ?, ?)');
const assetIds = {};
for (const [sym, name, market] of seedAssets) {
  const r = insertAsset.run(sym, name, market);
  assetIds[sym] = r.lastInsertRowid;
}
console.log(`  ${seedAssets.length} assets`);

// === Sample trades for demo user ===
const demoUserId = userIds['user@journal.dev'];
const insertTrade = db.prepare(`
  INSERT INTO trades
    (user_id, asset_id, side, entry_price, exit_price, quantity, entry_date, exit_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const demoTrades = [
  [assetIds.BTC,  'buy',  42000, 45500, 0.1,  '2026-04-15', '2026-04-22', 'Breakout setup, hit target'],
  [assetIds.ETH,  'buy',  2800,  2650, 1.5,  '2026-04-20', '2026-04-23', 'Stopped out, market reversed'],
  [assetIds.SOL,  'buy',  145,   168,  10,   '2026-04-25', '2026-05-01', 'Strong volume, held to TP'],
  [assetIds.AAPL, 'sell', 195,   188,  20,   '2026-04-28', '2026-05-03', 'Earnings short, played out'],
  [assetIds.TSLA, 'buy',  220,   215,  10,   '2026-04-30', '2026-05-02', 'Bad timing, took small loss'],
  [assetIds.ETH,  'buy',  2600,  2750, 2,    '2026-05-01', '2026-05-04', 'Bounce trade'],
  [assetIds.NVDA, 'buy',  920,   null, 5,    '2026-05-04', null,         'Open: AI thesis'],
  [assetIds.SOL,  'sell', 175,   null, 8,    '2026-05-05', null,         'Open: short on rejection'],
];

for (const t of demoTrades) insertTrade.run(demoUserId, ...t);
console.log(`  ${demoTrades.length} sample trades`);

console.log('Done.');
