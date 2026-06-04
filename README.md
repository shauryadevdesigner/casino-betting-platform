# FastLuck Casino MVP

Full-stack casino application with Express/MongoDB backend and TanStack Start frontend.

## Quick start

### 1. MongoDB

Run MongoDB locally (default `mongodb://127.0.0.1:27017`), or from `backend/`:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # if .env missing
npm run dev
```

API: `http://localhost:4000/api`

### 3. Frontend

```bash
cd clone-master-casino-main   # project root
cp .env.example .env
bun install   # or npm install
bun run dev   # or npm run dev
```

App: `http://localhost:5173` (proxies `/api` to the backend)

## Features

- JWT auth (register, login, profile)
- Wallet (balance, deposits, transaction history)
- Games: Dice, Mines, Coin Flip
- Leaderboard, user statistics, daily rewards

## Project structure

```
backend/src/
  config/       # DB, env
  models/       # User, Transaction, GameHistory, DailyReward, MinesSession
  middleware/   # auth, errors
  controllers/  # route handlers
  routes/       # Express routers
  services/     # wallet, stats
  utils/        # JWT, game math

src/
  lib/api/      # API client
  lib/          # auth context
  routes/       # pages & games
```
