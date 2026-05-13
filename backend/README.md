# Trading Journal — Backend

REST API + WebSocket бекенд для проєкту "Trading Journal" в рамках курсу "Веб-технології та веб-дизайн" (Lab 0–6).

## Стек
- **Node.js 20+**
- **Express** — HTTP-сервер
- **better-sqlite3** — синхронна SQLite, БД лежить у файлі `data.db`
- **JWT + bcryptjs** — авторизація
- **Socket.IO** — WebSocket для Lab 6

## Запуск

```bash
npm install
cp .env.example .env
npm run seed      # створює БД з демо-даними
npm run dev       # запускає сервер на :4000 з autoreload
# або: npm start
```

Перевірка: `curl http://localhost:4000/api/health` → `{"status":"ok",...}`

## Облікові дані з seed
- **Admin**: `admin@journal.dev` / `admin123`
- **User**: `user@journal.dev` / `user123` (з 8 демо-угодами)

---

## API

Усі захищені ендпоінти потребують заголовок:
```
Authorization: Bearer <token>
```

### Auth (без авторизації для register/login)
| Метод | URL | Тіло / Опис |
|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name }` → `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/api/auth/me` | повертає поточного юзера |

### Assets
| Метод | URL | Доступ | Опис |
|---|---|---|---|
| GET | `/api/assets?market=crypto` | auth | список (з фільтром по market) |
| GET | `/api/assets/:id` | auth | один |
| POST | `/api/assets` | **admin** | `{ symbol, name, market }` |
| PATCH | `/api/assets/:id` | **admin** | часткове оновлення |
| DELETE | `/api/assets/:id` | **admin** | заборонено, якщо актив у трейдах |

`market` ∈ `crypto | stock | forex | commodity`

### Trades (тільки свої)
| Метод | URL | Опис |
|---|---|---|
| GET | `/api/trades?asset_id=&side=&status=open\|closed&from=&to=` | список з фільтрами |
| GET | `/api/trades/:id` | один |
| POST | `/api/trades` | створення |
| PATCH | `/api/trades/:id` | редагування |
| DELETE | `/api/trades/:id` | видалення |

**Тіло POST/PATCH:**
```json
{
  "asset_id": 1,
  "side": "buy",
  "entry_price": 42000,
  "exit_price": 45500,
  "quantity": 0.1,
  "entry_date": "2026-04-15",
  "exit_date": "2026-04-22",
  "notes": "Breakout setup"
}
```

`side` ∈ `buy | sell`. Якщо `exit_price === null` — угода відкрита.

**У відповіді бекенд автоматично додає обчислені поля:**
- `pnl` — прибуток/збиток в абсолютній валюті активу
- `pnl_percent` — у відсотках
- `status` — `open` / `closed`
- `result` — `win` / `loss` / `breakeven` / `null`

### Stats — `/api/stats`
Дашборд поточного юзера:
```json
{
  "total_trades": 8,
  "open_trades": 2,
  "closed_trades": 6,
  "winning_trades": 4,
  "losing_trades": 2,
  "win_rate": 66.67,
  "total_pnl": 815.50,
  "avg_win": 247.50,
  "avg_loss": -82.50,
  "profit_factor": 3.0,
  "best_trade": { "id": 1, "symbol": "BTC", "pnl": 350.00, "side": "buy", "entry_date": "2026-04-15" },
  "worst_trade": { "id": 2, "symbol": "ETH", "pnl": -225.00, "side": "buy", "entry_date": "2026-04-20" },
  "by_asset": [
    { "symbol": "BTC", "trades": 1, "pnl": 350.00, "win_rate": 100 },
    ...
  ]
}
```

### Users — admin only
| Метод | URL |
|---|---|
| GET | `/api/users` |
| GET | `/api/users/:id` |
| PATCH | `/api/users/:id` `{ name?, role? }` |
| DELETE | `/api/users/:id` (не можна видалити себе) |

### WebSocket — Lab 6
- Підключення: `io('http://localhost:4000')`
- Подія `price:update`: `{ symbol, price, change_percent, at }` — мокові тікери для BTC/ETH/SOL/AAPL/TSLA/NVDA кожні 3 секунди

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000');
socket.on('price:update', (data) => console.log(data));
```

---

## Що під які лаби

| Lab | Що використовуєш з бекенду |
|---|---|
| **0** | Сам цей бекенд = артефакт лаби |
| **1** | Нічого. Статичні HTML/SCSS, GitHub Pages |
| **2** | `fetch` до `/api/auth/login`, `/api/trades` (pure JS, без jQuery) |
| **3** | Auth ендпоінти + `/api/users` для адмін-панелі (React/Vue/Angular) |
| **4** | Повний CRUD `/api/trades`, `/api/assets`, `/api/stats` для дашборду |
| **5** | Юніт-тести фронтенду; бекенд не змінюється |
| **6** | Socket.IO `price:update` для real-time тікера |

---

## Структура

```
trading-journal-backend/
├── src/
│   ├── index.js          # Express + Socket.IO entry point
│   ├── db.js             # SQLite init + schema
│   ├── auth.js           # JWT + bcrypt helpers
│   ├── seed.js           # demo data
│   ├── middleware/
│   │   └── auth.js       # requireAuth, requireAdmin
│   └── routes/
│       ├── auth.js       # /api/auth
│       ├── users.js      # /api/users (admin)
│       ├── assets.js     # /api/assets
│       ├── trades.js     # /api/trades
│       └── stats.js      # /api/stats
├── package.json
├── .env.example
└── README.md
```
