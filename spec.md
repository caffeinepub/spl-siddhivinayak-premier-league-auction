# SPL – Siddhivinayak Premier League Auction

## Current State

The app has two parallel systems:
- **Online** (`/`, `/admin`, `/live`, `/settings`, `/squads`, `/team/:id`) — uses ICP backend canister for all data. Unreliable on slow connections.
- **Offline** (`/offline/*`) — uses browser `localStorage` (~5-10MB limit). Admin and live screen work on the SAME device only because `localStorage` is not shared across devices.

**Core problems:**
1. The online version is unreliable because every action depends on ICP network round-trips.
2. The offline version cannot show the live screen on a projector/separate device because `localStorage` is local-only.
3. `localStorage` is limited to 5-10MB — player photos can exceed this quickly.

## Requested Changes (Diff)

### Add

- **IndexedDB storage layer** (`src/frontend/src/idbStore.ts`) — replaces `localStorage` for all auction data (teams, players, auction state, photos). IndexedDB supports up to 2GB. All photos stored as base64 strings.
- **Backend "sync bridge"** — the ICP backend stores ONLY the lightweight auction state (current player, current bid, leading team, sold/unsold flags) and team/player text data. This is pure text (~a few KB), requires minimal bandwidth. The admin device pushes data to the backend after each action. The live screen and team pages read from the backend.
- **New unified routes** — remove the separate `/offline/*` routes. All pages become the same routes:
  - `/` — Landing page (always offline, reads from IndexedDB)
  - `/admin` — Admin panel (offline-first: reads/writes IndexedDB, syncs to backend in background)
  - `/live` — Live screen (reads from backend at 2s interval — minimal data, works on projector on separate device)
  - `/settings` — Settings (reads/writes IndexedDB for photos; syncs text settings to backend)
  - `/squads` — Squads page (reads backend for text data; photos from URL params or backend)
  - `/team/:id` — Team page (reads backend)

### Modify

- **Admin page**: Switch all data reads/writes from `localStorage` + backend actor calls to the new `idbStore`. After each mutation, fire a background sync to the backend (non-blocking — if it fails, user still sees the action). No loading spinners, no "connection error" blocks.
- **Live page**: Reads ONLY from backend (tiny polling, ~2s). Photos referenced by URL stored in IndexedDB on admin side; live screen shows photo if it has a URL. For base64 images that cannot cross devices, show the player's initial letter as fallback gracefully.
- **Settings page**: Photos uploaded via FileReader to IndexedDB. Text fields (team names, league name, colors, layout) synced to backend after save.
- **`offlineStore.ts`**: Replaced by `idbStore.ts` using IndexedDB with the same API shape.
- **`useOfflineAuctionData` hook**: Updated to use `idbStore`.
- **`App.tsx`**: Remove all `/offline/*` routes. Online routes become the only routes.
- **Landing page**: Remove offline backup section. Single entry point.

### Remove

- All `/offline/*` route components (`OfflineAdminPage`, `OfflineLandingPage`, `OfflineLivePage`, `OfflineSettingsPage`, `OfflineSquadsPage`, `OfflineTeamPage`)
- Separate offline route declarations in `App.tsx`
- `useOfflineAuctionData.ts` hook (replaced inline in each page or by new hook)

## Implementation Plan

1. Create `src/frontend/src/idbStore.ts` — IndexedDB-backed store with same API as `offlineStore.ts`. Stores: `teams`, `players`, `auctionState`, `settings`, `photos` (keyed by type+id). Uses async reads/writes.
2. Update backend `main.mo` — add `saveSettings(text)` / `getSettings()` for JSON blob of league + colors + layout. Ensure all team/player data is already persisted (it is — stable canister state).
3. Update `App.tsx` — remove `/offline/*` routes, keep only the 6 main routes.
4. Rewrite `AdminPage.tsx` — reads from `idbStore` (instant, no network), syncs mutations to backend in background (fire-and-forget). No spinner, no error gate.
5. Rewrite `LivePage.tsx` — polls backend every 2s for auction state, teams, players (text only). Shows team logos/player photos only if a URL is available (graceful fallback).
6. Update `SettingsPage.tsx` — use `idbStore` for photos, sync text settings to backend.
7. Update `LandingPage.tsx` — remove offline backup link.
8. Delete all `src/frontend/src/pages/offline/` files.
