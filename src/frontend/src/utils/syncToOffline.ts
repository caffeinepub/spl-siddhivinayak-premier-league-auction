/**
 * syncToOffline — Auto-syncs live online auction data into the offline
 * localStorage store. Called after every successful online data fetch.
 *
 * This means whenever the online version is reachable, the offline backup
 * is kept up-to-date. If internet drops during the event, switching to
 * /offline will have the latest state.
 *
 * Settings (league name, layout, colours, logos) are now ALSO synced here
 * via applySettingsToLocalStorage, ensuring cross-device persistence.
 */

import type { AuctionState, Dashboard, Player, Team } from "../backend.d";
import type {
  OfflineAuctionState,
  OfflinePlayer,
  OfflineTeam,
} from "../offlineStore";
import { type AllSettings, applySettingsToLocalStorage } from "./settingsStore";

// ─── Keys (must match offlineStore.ts exactly) ────────────────────────────────
const KEY_TEAMS = "spl_offline_teams";
const KEY_PLAYERS = "spl_offline_players";
const KEY_AUCTION = "spl_offline_auction";
const KEY_SYNC_TIME = "spl_offline_last_sync";

// ─── Converters ───────────────────────────────────────────────────────────────

function teamToOffline(t: Team): OfflineTeam {
  return {
    id: Number(t.id),
    name: t.name,
    purseAmountTotal: Number(t.purseAmountTotal),
    purseAmountLeft: Number(t.purseAmountLeft),
    numberOfPlayers: Number(t.numberOfPlayers),
    ownerName: t.ownerName,
    teamIconPlayer: t.teamIconPlayer,
    isTeamLocked: t.isTeamLocked,
  };
}

function playerToOffline(p: Player): OfflinePlayer {
  return {
    id: Number(p.id),
    name: p.name,
    category: p.category as OfflinePlayer["category"],
    basePrice: Number(p.basePrice),
    imageUrl: p.imageUrl,
    soldPrice: p.soldPrice != null ? Number(p.soldPrice) : undefined,
    soldTo: p.soldTo != null ? Number(p.soldTo) : undefined,
    status: p.status as OfflinePlayer["status"],
    rating: Number(p.rating),
  };
}

function auctionStateToOffline(s: AuctionState): OfflineAuctionState {
  return {
    currentPlayerId:
      s.currentPlayerId != null ? Number(s.currentPlayerId) : undefined,
    currentBid: Number(s.currentBid),
    leadingTeamId:
      s.leadingTeamId != null ? Number(s.leadingTeamId) : undefined,
    isActive: s.isActive,
  };
}

// ─── Settings sync ────────────────────────────────────────────────────────────

/**
 * syncSettingsToOffline — Writes all settings into localStorage so the
 * offline version sees up-to-date league name, logos, colours and layout
 * even on a device that has never opened the settings page.
 */
export function syncSettingsToOffline(settings: AllSettings): void {
  try {
    applySettingsToLocalStorage(settings);
  } catch {
    // Best-effort — never throw
  }
}

// ─── Main sync function ───────────────────────────────────────────────────────

export function syncToOffline(
  teams: Team[],
  players: Player[],
  auctionState: AuctionState,
  _dashboard?: Dashboard | null,
  settings?: AllSettings | null,
): void {
  try {
    const offlineTeams: OfflineTeam[] = teams.map(teamToOffline);
    const offlinePlayers: OfflinePlayer[] = players.map(playerToOffline);
    const offlineAuction: OfflineAuctionState =
      auctionStateToOffline(auctionState);

    localStorage.setItem(KEY_TEAMS, JSON.stringify(offlineTeams));
    localStorage.setItem(KEY_PLAYERS, JSON.stringify(offlinePlayers));
    localStorage.setItem(KEY_AUCTION, JSON.stringify(offlineAuction));
    localStorage.setItem(KEY_SYNC_TIME, new Date().toISOString());

    // Also sync settings if provided
    if (settings) {
      syncSettingsToOffline(settings);
    }
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded)
    // The sync is best-effort — it should never break the online version
  }
}

// ─── Helper to read last sync time (for display in UI) ───────────────────────

export function getLastSyncTime(): string | null {
  return localStorage.getItem(KEY_SYNC_TIME);
}
