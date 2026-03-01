# SPL – Siddhivinayak Premier League 2026

## Current State
A cricket auction app exists but has accumulated bugs over many iterations: admin login failures, settings redirecting incorrectly, data polling conflicts, undo/unsell not working, and features breaking when others are added. A complete rewrite is needed for stability and reliability.

## Requested Changes (Diff)

### Add
- Clean, stable backend with all auction logic in one actor
- Three routes: `/` (landing), `/admin` (control panel), `/live` (broadcast screen)
- Admin login stored in localStorage (password: SPL@2026)
- Settings page accessible from admin panel (teams, players, league branding)
- Instant optimistic UI for all admin actions (+100, SOLD, SELECT)
- Working UNDO BID -- reverses last bid, updates backend immediately
- Working UNSELL PLAYER -- restores player to upcoming, restores team purse/slot
- Backend-persisted league settings (name, logo, team logos)
- Live layout customization with sliders + preview
- Team logos displayed in admin bid area and live screen
- CSV export of auction results
- Manual purse edit per team
- Dashboard: total spent, most expensive player, remaining players count
- Recharts bar chart on live screen
- SOLD animation overlay on live screen
- No countdown timer (removed by user request)
- Polling every 3 seconds with parallel calls and high error tolerance

### Modify
- Full rewrite of all backend types and functions for correctness
- Full rewrite of all frontend pages for reliability
- Authentication: local password check (no network dependency)
- Settings page: correct auth guard using localStorage
- Data hook: parallel polling, optimistic updates, 8-failure error threshold

### Remove
- All legacy/broken code from previous iterations
- 10-second auction timer
- sessionStorage usage (replaced with localStorage)
- Sequential polling (replaced with parallel)

## Implementation Plan

### Backend (main.mo)
1. Types: Team, Player, AuctionState, LeagueSettings, LiveLayoutSettings
2. Stable vars for all state (survives upgrades)
3. Seed data: 10 placeholder teams, 20 placeholder players
4. Functions:
   - `adminLogin(password)` → Bool
   - `getTeams()` → [Team]
   - `getPlayers()` → [Player]
   - `getAuctionState()` → AuctionState
   - `getLeagueSettings()` → LeagueSettings
   - `getLiveLayoutSettings()` → LiveLayoutSettings
   - `selectPlayer(id)` → Result
   - `placeBid(teamId)` → Result (validates purse + min slot rule)
   - `undoBid()` → Result (reverts last bid)
   - `sellPlayer()` → Result (deducts purse, marks sold, locks team if 7 bought)
   - `unsellPlayer()` → Result (reverts last sold)
   - `resetAuction()` → Result
   - `updateTeam(id, name, owner, icon, logoUrl)` → Result
   - `editTeamPurse(id, amount)` → Result
   - `addPlayer(name, category, basePrice, imageUrl, rating)` → Result
   - `updatePlayer(id, ...)` → Result
   - `deletePlayer(id)` → Result
   - `updateLeagueSettings(shortName, fullName, logoUrl, logoSize, nameSize)` → Result
   - `updateLiveLayoutSettings(...)` → Result
   - `getResults()` → [SoldPlayer]
   - `getDashboard()` → DashboardStats

### Frontend Pages
1. **LandingPage** (`/`) -- SPL branding, navigation to /admin and /live
2. **AdminPage** (`/admin`) -- Password gate → control panel with:
   - Header: league name, Export CSV, Settings, Live Screen buttons
   - Left panel: dashboard stats + upcoming player list with SELECT buttons
   - Center: active auction card (player photo, bid counter, leading team logo, SOLD, UNDO BID, UNSELL buttons)
   - Right: team grid with +100 buttons, purse remaining, slots, lock state
3. **LivePage** (`/live`) -- Broadcast screen with:
   - Header with league logo and name
   - Player spotlight (image, name, category, base price)
   - Large bid counter with leading team name and logo
   - Team purse table
   - Recharts horizontal bar chart
   - SOLD overlay animation
4. **SettingsPage** (`/settings`) -- Tabs: LEAGUE, TEAMS, PLAYERS, LIVE LAYOUT
   - League: name editor, logo upload, size sliders
   - Teams: 10 rows, name/owner/icon/logo upload
   - Players: add/edit/delete, image upload (base64), filter by category
   - Live Layout: sliders for all screen elements + scaled real-time preview

### Data & Hooks
- `useAuctionData` hook: polls every 3s, parallel calls, 8-failure threshold, optimistic update functions
- `useImageUpload` hook: converts file to base64 data URL, returns URL string
- No Web Audio (removed for stability)
- Recharts for bar chart
