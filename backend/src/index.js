import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import WebSocket from 'ws';

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
});

// === Binance WebSocket bridge ===
// Підключаємось до публічного потоку Binance, отримуємо real-time ціни,
// ретранслюємо клієнтам через свій socket.io канал.
// Це класичний fan-out pattern: одне external з'єднання → багато internal клієнтів.

const SYMBOL_MAP = {
  btcusdt: 'BTC',
  ethusdt: 'ETH',
  solusdt: 'SOL',
};

const STREAMS = Object.keys(SYMBOL_MAP).map((s) => `${s}@ticker`).join('/');
const BINANCE_WS_URL = `wss://stream.binance.com:9443/stream?streams=${STREAMS}`;

let binanceSocket = null;
let lastEmit = {};

function connectToBinance() {
  console.log('[binance] connecting to', BINANCE_WS_URL);
  binanceSocket = new WebSocket(BINANCE_WS_URL);

  binanceSocket.on('open', () => {
    console.log('[binance] connected, subscribed to:', Object.keys(SYMBOL_MAP).join(', '));
  });

  binanceSocket.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const streamName = msg.stream; // e.g. "btcusdt@ticker"
      const data = msg.data;
      if (!streamName || !data) return;

      const lowerSymbol = streamName.split('@')[0];
      const symbol = SYMBOL_MAP[lowerSymbol];
      if (!symbol) return;

      // Throttle: не частіше ніж раз на 1000ms на символ.
      // Binance шле кілька оновлень на секунду, для UI це занадто часто.
      const now = Date.now();
      if (lastEmit[symbol] && now - lastEmit[symbol] < 1000) return;
      lastEmit[symbol] = now;

      const price = Number(parseFloat(data.c).toFixed(2));
      const changePercent = Number(parseFloat(data.P).toFixed(3));

      io.emit('price:update', {
        symbol,
        price,
        change_percent: changePercent,
        at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[binance] parse error:', err.message);
    }
  });

  binanceSocket.on('error', (err) => {
    console.error('[binance] socket error:', err.message);
  });

  binanceSocket.on('close', () => {
    console.log('[binance] disconnected, reconnecting in 5s...');
    setTimeout(connectToBinance, 5000);
  });
}

connectToBinance();

export { app, io };

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log(`[ws]     ws://localhost:${PORT}`);
});