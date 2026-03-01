# SPL – Siddhivinayak Premier League Auction

## Current State

A full-stack cricket auction web application with:
- Motoko backend: team/player/auction state management with blob-storage component
- React frontend: 6 pages (Landing, Admin, Live, Settings, Squads, Team)
- Features accumulated through 20+ iterations, now with accumulated bugs and instability

Known issues from conversation history:
- Admin page connection errors and login failures
- Settings page redirecting incorrectly (sessionStorage vs localStorage mismatch)
- Photo uploads not working reliably
- Bid updates slow / UI lag
- Undo bid and unsell player not working reliably
- Polling causing instability on mobile hotspot
- Overall instability from layered incremental patches

## Requested Changes (Diff)

### Add
- Nothing structurally new — full clean rebuild of all existing features

### Modify
- **Backend**: Clean rewrite of main.mo, keeping all existing types and functions but ensuring correctness
  - Team, Player, AuctionState, Dashboard types
  - All CRUD: addPlayer, updatePlayer, deletePlayer, updateTeam, uploadTeamLogo
  - Auction: selectPlayer, placeBid, sellPlayer, resetAuction, editTeamPurse
  - Unsell: implemented by restoring purse + decrementing numberOfPlayers + resetting player status
  - Add `unsellPlayer(playerId: Nat)` backend function to atomically handle unsell
- **Frontend — all pages rewritten from scratch**:
  - Stable, simple data polling (3s interval, parallel calls, 8-error tolerance)
  - Admin login: instant local check, no network dependency
  - Optimistic UI for bids (+100 updates instantly)
  - Undo bid: local undo stack, pauses polling 5s
  - Unsell player: calls new `unsellPlayer` backend function atomically
  - Settings page: correct localStorage auth guard, all tabs working
  - Live page: SOLD ribbon on photo, team display in right panel after SOLD
  - Squads page: vertical compact rows, hammer animation on sold/unsold
  - Team page: individual shareable team view
  - All photos stored as base64 data URLs in localStorage (no external upload)

### Remove
- No feature removals — just legacy cruft and accumulated bug layers

## Implementation Plan

1. **Backend (main.mo)**: Clean rewrite with added `unsellPlayer` atomic function
2. **useAuctionData hook**: Simple, stable, parallel polling with 8-error tolerance
3. **useImageUpload hook**: Simple base64 file reader (no external dependencies)
4. **LandingPage**: League settings helpers + landing UI
5. **AdminPage**: Login gate, bid controls, undo bid, unsell player, remaining players panel
6. **LivePage**: Player display, SOLD ribbon animation, team sold display, purse chart
7. **SettingsPage**: League tab, Teams tab (with owner/icon photos), Players tab, Live Layout tab
8. **SquadsPage**: Vertical compact rows, hammer animation, team share links
9. **TeamPage**: Individual team squad view with all 9 slots
10. **App.tsx**: Router with all 6 routes
