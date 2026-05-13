import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import assetsRouter from './routes/assets.js';
import tradesRouter from './routes/trades.js';
import statsRouter from './routes/stats.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/stats', statsRouter);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = createServer(app);

// === WebSocket layer (Lab 6) ===
const io = new SocketServer(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('[ws] connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('[ws] disconnected:', socket.id);
  });

  // Client can request to subscribe to specific symbols if needed
  socket.on('subscribe', (symbols) => {
    if (Array.isArray(symbols)) socket.data.symbols = symbols;
  });
});

// Mock price ticker — emits random updates every 3s
const MOCK_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA', 'NVDA'];
const lastPrice = {
  BTC: 45000, ETH: 2700, SOL: 160,
  AAPL: 192, TSLA: 215, NVDA: 920,
};

setInterval(() => {
  const symbol = MOCK_SYMBOLS[Math.floor(Math.random() * MOCK_SYMBOLS.length)];
  // ±0.5% drift
  const delta = (Math.random() - 0.5) * 0.01;
  lastPrice[symbol] = Number((lastPrice[symbol] * (1 + delta)).toFixed(2));

  io.emit('price:update', {
    symbol,
    price: lastPrice[symbol],
    change_percent: Number((delta * 100).toFixed(3)),
    at: new Date().toISOString(),
  });
}, 3000);

export { app, io };

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log(`[ws]     ws://localhost:${PORT}`);
});
