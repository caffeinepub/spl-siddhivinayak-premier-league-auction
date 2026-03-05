# SPL – Siddhivinayak Premier League Auction

## Current State
A full-stack cricket auction app with IndexedDB-first offline architecture. Admin page manages bidding; live screen shows real-time state via BroadcastChannel and a backend poll. Several critical bugs were reported after loading real player/team data.

## Requested Changes (Diff)

### Add
- `idbStore.undoBid(prevBid, prevTeamId)` — new method that actually writes the reverted bid state to IDB (previously undo only updated local React state, never IDB)
- `auctionHadBidRef` tracking in LivePage to distinguish "auction ended with bids" vs "auction ended with zero bids"
- `navigator.storage.persist()` call on IDB init to request 5GB persistent storage quota

### Modify
- `idbStore.seedFromBackend` — no longer overwrites IDB when a local auction is active; only syncs teams and non-live players; only calls `notifyChange()` when auction is inactive (was causing SOLD animation on every backend poll)
- `idbStore.init()` — bumped DB_VERSION to 2 to ensure clean schema
- `LivePage` SOLD/UNSOLD animation detection — rewritten to: (a) reset all tracking refs when a new player is selected, (b) require `auctionHadBidRef` to be true before firing SOLD overlay, (c) properly reset `prevLeadingTeamIdRef` on inactive state
- `AdminPage.handleUndoBid` — now calls `idbStore.undoBid()` to actually write the reversal to IDB so the live screen sees it
- `AdminPage.handleSelectPlayer` — clears `localBid` to 0 (not null) on optimistic select so stale bid counter doesn't persist
- LivePage backend poll interval — increased from 2s to 2.5s to reduce flicker during active bidding

### Remove
- Broken `idbStore.getAuctionState()` double-call in undo that resolved a `Promise.resolve()` instead of writing anything

## Implementation Plan
1. Add `undoBid` method to idbStore ✓
2. Fix `seedFromBackend` to guard against overwriting active auction ✓
3. Fix LivePage animation tracking with `auctionHadBidRef` ✓
4. Fix `handleUndoBid` to call `idbStore.undoBid()` ✓
5. Add storage persist request ✓
6. TypeScript check — passes clean ✓
