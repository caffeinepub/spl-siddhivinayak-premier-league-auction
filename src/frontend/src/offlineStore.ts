/**
 * Offline Store — all auction data stored in localStorage.
 * No ICP / backend calls. Works with zero internet after first page load.
 * Uses `spl_offline_` prefix for all keys to avoid collision with online version.
 */

// ─── Types (mirrors backend.d.ts but using plain numbers to avoid bigint issues) ─────
export type Category = "batsman" | "bowler" | "allrounder";
export type Status = "upcoming" | "live" | "sold" | "unsold";

export interface OfflineTeam {
  id: number;
  name: string;
  purseAmountTotal: number;
  purseAmountLeft: number;
  numberOfPlayers: number;
  ownerName: string;
  teamIconPlayer: string;
  isTeamLocked: boolean;
}

export interface OfflinePlayer {
  id: number;
  name: string;
  category: Category;
  basePrice: number;
  imageUrl: string;
  soldPrice?: number;
  soldTo?: number;
  status: Status;
  rating: number;
}

export interface OfflineAuctionState {
  currentPlayerId?: number;
  currentBid: number;
  leadingTeamId?: number;
  isActive: boolean;
}

export interface OfflineDashboard {
  totalSpent: number;
  mostExpensivePlayer?: OfflinePlayer;
  remainingPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
}

export type OfflineResult = { ok: true } | { ok: false; err: string };

// ─── localStorage keys ────────────────────────────────────────────────────────
const KEY_TEAMS = "spl_offline_teams";
const KEY_PLAYERS = "spl_offline_players";
const KEY_AUCTION = "spl_offline_auction";
const KEY_NEXT_ID = "spl_offline_next_player_id";

// ─── Seed data ────────────────────────────────────────────────────────────────
function seedTeams(): OfflineTeam[] {
  return [
    {
      id: 1,
      name: "Mumbai Warriors",
      ownerName: "Team Owner 1",
      teamIconPlayer: "Icon Player 1",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 2,
      name: "Chennai Kings",
      ownerName: "Team Owner 2",
      teamIconPlayer: "Icon Player 2",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 3,
      name: "Delhi Capitals",
      ownerName: "Team Owner 3",
      teamIconPlayer: "Icon Player 3",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 4,
      name: "Bangalore Challengers",
      ownerName: "Team Owner 4",
      teamIconPlayer: "Icon Player 4",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 5,
      name: "Kolkata Knight Riders",
      ownerName: "Team Owner 5",
      teamIconPlayer: "Icon Player 5",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 6,
      name: "Punjab Kings",
      ownerName: "Team Owner 6",
      teamIconPlayer: "Icon Player 6",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 7,
      name: "Hyderabad Sunrisers",
      ownerName: "Team Owner 7",
      teamIconPlayer: "Icon Player 7",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 8,
      name: "Jaipur Royals",
      ownerName: "Team Owner 8",
      teamIconPlayer: "Icon Player 8",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 9,
      name: "Lucknow Super Giants",
      ownerName: "Team Owner 9",
      teamIconPlayer: "Icon Player 9",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
    {
      id: 10,
      name: "Gujarat Titans",
      ownerName: "Team Owner 10",
      teamIconPlayer: "Icon Player 10",
      purseAmountTotal: 20500,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    },
  ];
}

function seedPlayers(): OfflinePlayer[] {
  const names = [
    "Rohit Sharma",
    "Virat Kohli",
    "MS Dhoni",
    "Ravindra Jadeja",
    "Jasprit Bumrah",
    "KL Rahul",
    "Hardik Pandya",
    "Suryakumar Yadav",
    "Shubman Gill",
    "Rishabh Pant",
    "Sanju Samson",
    "Jos Buttler",
    "Yashasvi Jaiswal",
    "Rinku Singh",
    "Shikhar Dhawan",
    "Yuzvendra Chahal",
    "Mohammed Shami",
    "Axar Patel",
    "Washington Sundar",
    "Kuldeep Yadav",
    "Bhuvneshwar Kumar",
    "Deepak Chahar",
    "Dinesh Karthik",
    "Venkatesh Iyer",
    "Krunal Pandya",
    "Ruturaj Gaikwad",
    "Arshdeep Singh",
    "Harshal Patel",
    "Shardul Thakur",
    "Trent Boult",
    "Shimron Hetmyer",
    "Ravichandran Ashwin",
    "Varun Chakravarthy",
    "Quinton de Kock",
    "Marcus Stoinis",
    "Jason Holder",
    "Devdutt Padikkal",
    "Prasidh Krishna",
    "Avesh Khan",
    "T Natarajan",
    "Shahbaz Ahmed",
    "Tushar Deshpande",
    "Riyan Parag",
    "Tilak Varma",
    "Rahul Tewatia",
    "Shivam Mavi",
    "Harpreet Brar",
    "Mohit Sharma",
    "Karun Nair",
    "Dhruv Jurel",
    "Mayank Agarwal",
    "Ravi Bishnoi",
    "Nicholas Pooran",
    "Alzarri Joseph",
    "Amit Mishra",
    "Sandeep Sharma",
    "Luvnith Sisodia",
    "Raj Bawa",
    "Rajat Patidar",
    "Naman Dhir",
    "Umesh Yadav",
    "Manish Pandey",
    "Kedar Jadhav",
    "Ambati Rayudu",
    "Robin Uthappa",
    "Nitish Rana",
    "Srikar Bharat",
    "Prithvi Shaw",
    "Shreyas Iyer",
    "Ishan Kishan",
  ];

  const data: [Category, number, number][] = [
    ["batsman", 500, 5],
    ["batsman", 500, 5],
    ["batsman", 400, 5],
    ["allrounder", 400, 5],
    ["bowler", 400, 5],
    ["batsman", 400, 4],
    ["allrounder", 400, 5],
    ["batsman", 400, 5],
    ["batsman", 400, 5],
    ["batsman", 400, 5],
    ["batsman", 400, 4],
    ["batsman", 400, 5],
    ["batsman", 400, 4],
    ["batsman", 300, 4],
    ["batsman", 300, 4],
    ["bowler", 300, 4],
    ["bowler", 300, 4],
    ["allrounder", 300, 4],
    ["allrounder", 300, 4],
    ["bowler", 300, 4],
    ["bowler", 300, 4],
    ["bowler", 300, 4],
    ["batsman", 300, 4],
    ["allrounder", 300, 4],
    ["allrounder", 300, 3],
    ["batsman", 300, 4],
    ["bowler", 300, 4],
    ["bowler", 300, 4],
    ["allrounder", 300, 4],
    ["bowler", 400, 4],
    ["batsman", 300, 4],
    ["bowler", 300, 4],
    ["bowler", 300, 4],
    ["batsman", 300, 4],
    ["allrounder", 300, 4],
    ["allrounder", 300, 4],
    ["batsman", 200, 3],
    ["bowler", 200, 3],
    ["bowler", 200, 3],
    ["bowler", 200, 3],
    ["allrounder", 200, 3],
    ["bowler", 200, 3],
    ["allrounder", 200, 3],
    ["batsman", 200, 3],
    ["allrounder", 200, 3],
    ["bowler", 200, 3],
    ["allrounder", 200, 3],
    ["bowler", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 200, 3],
    ["bowler", 200, 3],
    ["batsman", 200, 3],
    ["bowler", 200, 3],
    ["bowler", 200, 3],
    ["bowler", 200, 3],
    ["batsman", 200, 3],
    ["allrounder", 200, 3],
    ["batsman", 300, 4],
    ["allrounder", 200, 3],
    ["bowler", 200, 3],
    ["batsman", 200, 3],
    ["allrounder", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 200, 3],
    ["batsman", 300, 3],
    ["batsman", 300, 4],
    ["batsman", 300, 4],
  ];

  return names.map((name, i) => {
    const [category, basePrice, rating] = data[i] ?? ["batsman", 200, 3];
    return {
      id: i + 1,
      name,
      category,
      basePrice,
      imageUrl: "",
      soldPrice: undefined,
      soldTo: undefined,
      status: "upcoming" as Status,
      rating,
    };
  });
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
function loadTeams(): OfflineTeam[] {
  try {
    const raw = localStorage.getItem(KEY_TEAMS);
    if (raw) return JSON.parse(raw) as OfflineTeam[];
  } catch {
    /* ignore */
  }
  const fresh = seedTeams();
  saveTeams(fresh);
  return fresh;
}

function saveTeams(teams: OfflineTeam[]) {
  try {
    localStorage.setItem(KEY_TEAMS, JSON.stringify(teams));
    notifyChange();
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error(
        "Storage full — try removing some player photos (use smaller images under 200KB)",
      );
    }
    throw e;
  }
}

function loadPlayers(): OfflinePlayer[] {
  try {
    const raw = localStorage.getItem(KEY_PLAYERS);
    if (raw) return JSON.parse(raw) as OfflinePlayer[];
  } catch {
    /* ignore */
  }
  const fresh = seedPlayers();
  savePlayers(fresh);
  return fresh;
}

function savePlayers(players: OfflinePlayer[]) {
  try {
    localStorage.setItem(KEY_PLAYERS, JSON.stringify(players));
    notifyChange();
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error(
        "Storage full — try removing some player photos (use smaller images under 200KB)",
      );
    }
    throw e;
  }
}

function loadAuctionState(): OfflineAuctionState {
  try {
    const raw = localStorage.getItem(KEY_AUCTION);
    if (raw) return JSON.parse(raw) as OfflineAuctionState;
  } catch {
    /* ignore */
  }
  return { currentBid: 0, isActive: false };
}

function saveAuctionState(state: OfflineAuctionState) {
  try {
    localStorage.setItem(KEY_AUCTION, JSON.stringify(state));
    notifyChange();
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error(
        "Storage full — try removing some player photos (use smaller images under 200KB)",
      );
    }
    throw e;
  }
}

function loadNextPlayerId(): number {
  try {
    const raw = localStorage.getItem(KEY_NEXT_ID);
    if (raw) return Number.parseInt(raw, 10);
  } catch {
    /* ignore */
  }
  return 71;
}

function saveNextPlayerId(id: number) {
  localStorage.setItem(KEY_NEXT_ID, String(id));
}

// ─── Change notification ──────────────────────────────────────────────────────
// Custom event so all open tabs/windows on the same device can update in real-time
export const OFFLINE_CHANGE_EVENT = "spl_offline_change";

function notifyChange() {
  // For same-tab updates
  window.dispatchEvent(new Event(OFFLINE_CHANGE_EVENT));
  // For cross-tab updates (only works in same origin)
  try {
    localStorage.setItem("spl_offline_ts", String(Date.now()));
  } catch {
    /* ignore */
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const offlineStore = {
  // ── Reads ──────────────────────────────────────────────────────────────────
  getTeams(): OfflineTeam[] {
    return loadTeams();
  },

  getPlayers(): OfflinePlayer[] {
    return loadPlayers();
  },

  getAuctionState(): OfflineAuctionState {
    return loadAuctionState();
  },

  getDashboard(): OfflineDashboard {
    const players = loadPlayers();
    const sold = players.filter((p) => p.status === "sold");
    const totalSpent = sold.reduce((s, p) => s + (p.soldPrice ?? 0), 0);
    const mostExpensivePlayer = sold.reduce<OfflinePlayer | undefined>(
      (best, p) => {
        if (!best || (p.soldPrice ?? 0) > (best.soldPrice ?? 0)) return p;
        return best;
      },
      undefined,
    );
    return {
      totalSpent,
      mostExpensivePlayer,
      remainingPlayers: players.filter((p) => p.status === "upcoming").length,
      soldPlayers: sold.length,
      unsoldPlayers: players.filter((p) => p.status === "unsold").length,
    };
  },

  getTeamById(id: number): OfflineTeam | null {
    return loadTeams().find((t) => t.id === id) ?? null;
  },

  getResults(): Array<{ player: OfflinePlayer; team?: OfflineTeam }> {
    const players = loadPlayers().filter((p) => p.status === "sold");
    const teams = loadTeams();
    return players.map((player) => ({
      player,
      team:
        player.soldTo != null
          ? teams.find((t) => t.id === player.soldTo)
          : undefined,
    }));
  },

  // ── Mutations ──────────────────────────────────────────────────────────────
  selectPlayer(playerId: number): OfflineResult {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return { ok: false, err: "Player not found" };
    if (players[idx].status !== "upcoming")
      return { ok: false, err: "Player is not available for auction" };

    players[idx] = { ...players[idx], status: "live" };
    savePlayers(players);

    const state = loadAuctionState();
    saveAuctionState({
      ...state,
      currentPlayerId: playerId,
      currentBid: players[idx].basePrice,
      leadingTeamId: undefined,
      isActive: true,
    });
    return { ok: true };
  },

  placeBid(teamId: number): OfflineResult {
    const teams = loadTeams();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, err: "Team not found" };
    if (team.isTeamLocked)
      return { ok: false, err: "Team is already locked (squad full)" };

    const state = loadAuctionState();
    if (!state.isActive) return { ok: false, err: "No active auction" };

    const newBid = state.currentBid + 100;
    const remainingSlots = 7 - team.numberOfPlayers;
    const minRequired = remainingSlots > 1 ? (remainingSlots - 1) * 100 : 0;

    if (team.purseAmountLeft < newBid) {
      return { ok: false, err: "Insufficient purse for this bid" };
    }
    if (team.purseAmountLeft - newBid < minRequired) {
      return { ok: false, err: "Bid would violate minimum slot balance rule" };
    }

    saveAuctionState({ ...state, currentBid: newBid, leadingTeamId: teamId });
    return { ok: true };
  },

  sellPlayer(): OfflineResult {
    const state = loadAuctionState();
    if (!state.isActive) return { ok: false, err: "No active auction" };
    if (!state.currentPlayerId || !state.leadingTeamId)
      return { ok: false, err: "No leading team" };

    const teams = loadTeams();
    const players = loadPlayers();
    const tIdx = teams.findIndex((t) => t.id === state.leadingTeamId);
    const pIdx = players.findIndex((p) => p.id === state.currentPlayerId);
    if (tIdx === -1) return { ok: false, err: "Team not found" };
    if (pIdx === -1) return { ok: false, err: "Player not found" };

    const newCount = teams[tIdx].numberOfPlayers + 1;
    teams[tIdx] = {
      ...teams[tIdx],
      purseAmountLeft: teams[tIdx].purseAmountLeft - state.currentBid,
      numberOfPlayers: newCount,
      isTeamLocked: newCount >= 7,
    };
    players[pIdx] = {
      ...players[pIdx],
      soldPrice: state.currentBid,
      soldTo: state.leadingTeamId,
      status: "sold",
    };

    saveTeams(teams);
    savePlayers(players);
    saveAuctionState({ currentBid: 0, isActive: false });
    return { ok: true };
  },

  markPlayerUnsold(): OfflineResult {
    const state = loadAuctionState();
    if (!state.isActive || !state.currentPlayerId)
      return { ok: false, err: "No active auction" };

    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === state.currentPlayerId);
    if (idx === -1) return { ok: false, err: "Player not found" };

    players[idx] = { ...players[idx], status: "unsold" };
    savePlayers(players);
    saveAuctionState({ currentBid: 0, isActive: false });
    return { ok: true };
  },

  putPlayerBackToAuction(playerId: number): OfflineResult {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return { ok: false, err: "Player not found" };
    if (players[idx].status !== "unsold")
      return { ok: false, err: "Player must be unsold" };

    players[idx] = { ...players[idx], status: "upcoming" };
    savePlayers(players);
    return { ok: true };
  },

  unsellPlayer(playerId: number): OfflineResult {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return { ok: false, err: "Player not found" };

    const player = players[idx];
    if (player.status !== "sold")
      return { ok: false, err: "Player is not sold" };
    if (player.soldTo == null || player.soldPrice == null)
      return { ok: false, err: "Invalid sold data" };

    const teams = loadTeams();
    const tIdx = teams.findIndex((t) => t.id === player.soldTo);
    if (tIdx === -1) return { ok: false, err: "Team not found" };

    teams[tIdx] = {
      ...teams[tIdx],
      purseAmountLeft: teams[tIdx].purseAmountLeft + player.soldPrice,
      numberOfPlayers: Math.max(0, teams[tIdx].numberOfPlayers - 1),
      isTeamLocked: false,
    };
    players[idx] = {
      ...player,
      soldPrice: undefined,
      soldTo: undefined,
      status: "upcoming",
    };

    saveTeams(teams);
    savePlayers(players);
    return { ok: true };
  },

  resetAuction(): void {
    const teams = loadTeams().map((t) => ({
      ...t,
      purseAmountLeft: 20000,
      numberOfPlayers: 0,
      isTeamLocked: false,
    }));
    const players = loadPlayers().map((p) => ({
      ...p,
      status: "upcoming" as Status,
      soldPrice: undefined,
      soldTo: undefined,
    }));
    saveTeams(teams);
    savePlayers(players);
    saveAuctionState({ currentBid: 0, isActive: false });
  },

  editTeamPurse(teamId: number, newPurse: number): OfflineResult {
    const teams = loadTeams();
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx === -1) return { ok: false, err: "Team not found" };
    teams[idx] = { ...teams[idx], purseAmountLeft: newPurse };
    saveTeams(teams);
    return { ok: true };
  },

  updateTeam(
    teamId: number,
    name: string,
    ownerName: string,
    iconPlayerName: string,
  ): OfflineResult {
    const teams = loadTeams();
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx === -1) return { ok: false, err: "Team not found" };
    teams[idx] = {
      ...teams[idx],
      name,
      ownerName,
      teamIconPlayer: iconPlayerName,
    };
    saveTeams(teams);
    return { ok: true };
  },

  addPlayer(
    name: string,
    category: Category,
    basePrice: number,
    imageUrl: string,
    rating: number,
  ): OfflineResult {
    const players = loadPlayers();
    const nextId = loadNextPlayerId();
    players.push({
      id: nextId,
      name,
      category,
      basePrice,
      imageUrl,
      soldPrice: undefined,
      soldTo: undefined,
      status: "upcoming",
      rating,
    });
    savePlayers(players);
    saveNextPlayerId(nextId + 1);
    return { ok: true };
  },

  updatePlayer(
    playerId: number,
    name: string,
    category: Category,
    basePrice: number,
    imageUrl: string,
    rating: number,
  ): OfflineResult {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return { ok: false, err: "Player not found" };
    if (players[idx].status === "live")
      return { ok: false, err: "Cannot update player during live auction" };
    players[idx] = {
      ...players[idx],
      name,
      category,
      basePrice,
      imageUrl,
      rating,
    };
    savePlayers(players);
    return { ok: true };
  },

  deletePlayer(playerId: number): OfflineResult {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return { ok: false, err: "Player not found" };
    if (players[idx].status === "live")
      return { ok: false, err: "Cannot delete player during live auction" };
    players.splice(idx, 1);
    savePlayers(players);
    return { ok: true };
  },
};
