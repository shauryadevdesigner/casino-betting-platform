# PRD Implementation Status

> **Note:** The codebase uses **MongoDB + Mongoose** (not PostgreSQL). Schemas match the PRD entities.

## Phase 1 — Auth & Security ✅ (foundation)

| Feature | Status | Paths |
|---------|--------|-------|
| Google OAuth | ✅ | `POST /api/auth/google`, login UI |
| Email (SendGrid) | ✅ | `services/email.service.js`, `templates/emails/*` |
| 2FA (TOTP) | ✅ | `POST /api/auth/2fa/setup|verify|disable`, encrypted secrets |

## Phase 2 — Wallet & Real-Time ✅ (foundation)

| Feature | Status | Paths |
|---------|--------|-------|
| WebSocket | ✅ | Socket.io on server, `useWebSocket` hook |
| Balance events | ✅ | `balanceUpdated`, `gameResult`, `leaderboardUpdate` |
| ACID wallet | ✅ | MongoDB transactions in `walletService.js` |
| Multi-currency | ✅ | `currency.service.js`, `preferredCurrency` on User |

## Phase 3 — Affiliate & VIP ✅ (foundation)

| Feature | Status | Paths |
|---------|--------|-------|
| Referral codes | ✅ | `affiliate.service.js`, `/affiliate` page |
| Commissions | ✅ | On loss via `recordLossCommission` |
| VIP tiers | ✅ | Bronze→Platinum, auto-upgrade, daily bonus multiplier |

## Phase 4 — Admin & Fairness ✅ (foundation)

| Feature | Status | Paths |
|---------|--------|-------|
| Admin API | ✅ | `/api/admin/*` (requires `adminRole`) |
| Provably fair | ✅ | Dice uses server/client seed + SHA-256 |

## Phase 5 — Pages 🟡 (partial)

| Page | Status |
|------|--------|
| Games (Dice/Mines/Coin) | ✅ API + provably fair on Dice |
| Tournament | ✅ API + needs UI polish |
| Rewards | ✅ Daily + VIP multiplier |
| Leaderboard | ✅ Real data + VIP badges |
| VIP Club | 🟡 API ready, enhance UI |
| Missions | ✅ API + seed missions |

## Phase 6 — Support & UI 🟡

| Feature | Status |
|---------|--------|
| AI chat widget | ✅ WebSocket + OpenAI optional |
| Luxury theme | ✅ `styles/theme.css` |

## Setup

```bash
# MongoDB
cd backend && docker compose up -d

# Backend deps + seed
npm install
npm run seed
npm run dev

# Frontend
cd .. && npm install && npm run dev
```

### Required `.env` keys

- `GOOGLE_CLIENT_ID` (backend + `VITE_GOOGLE_CLIENT_ID`)
- `SENDGRID_API_KEY`, `SENDER_EMAIL` (optional, logs if missing)
- `OPENAI_API_KEY` (optional for AI chat)
- `ENCRYPTION_KEY` (32+ chars for 2FA secrets)

### Make first admin

```js
// In mongosh
db.users.updateOne({ email: "you@example.com" }, { $set: { adminRole: true } })
```

## Remaining for full PRD

- Admin dashboard UI (`/admin` React pages)
- Provably fair on Mines/Coin Flip
- Mission progress auto-tracking from bets
- Tournament score updates from wagering
- Email verification flow + password reset endpoints
- Full WCAG audit + mobile pass on all pages
