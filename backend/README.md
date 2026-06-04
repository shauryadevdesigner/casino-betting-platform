# FastLuck Casino Backend

Express + MongoDB API for the casino MVP.

## Setup

```bash
cd backend
cp .env.example .env
npm install
```

Ensure MongoDB is running, then:

```bash
npm run dev
```

API base: `http://localhost:4000/api`

## Endpoints

| Area | Method | Path |
|------|--------|------|
| Auth | POST | `/auth/register`, `/auth/login` |
| Auth | GET | `/auth/me` |
| Wallet | GET | `/wallet/balance` |
| Wallet | POST | `/wallet/deposit` |
| Wallet | GET | `/wallet/transactions` |
| Profile | GET/PATCH | `/profile` |
| Dice | POST | `/games/dice/play` |
| Coin Flip | POST | `/games/coinflip/play` |
| Mines | POST | `/games/mines/start` |
| Mines | POST | `/games/mines/:gameId/reveal` |
| Mines | POST | `/games/mines/:gameId/cashout` |
| Leaderboard | GET | `/leaderboard?sort=balance\|biggestWin\|gamesPlayed` |
| Stats | GET | `/stats/me` |
| Daily Reward | GET | `/rewards/daily/status` |
| Daily Reward | POST | `/rewards/daily/claim` |

Protected routes require `Authorization: Bearer <token>`.
