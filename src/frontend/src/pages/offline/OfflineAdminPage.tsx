import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Coins,
  Download,
  Edit3,
  Lock,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  Star,
  Trophy,
  Undo2,
  UndoDot,
  Users,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineAuctionData } from "../../hooks/useOfflineAuctionData";
import type { OfflinePlayer, OfflineTeam } from "../../offlineStore";
import { offlineStore } from "../../offlineStore";
import { getTeamLogos } from "../LandingPage";

// ─── Admin password ────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "SPL@2026";
const AUTH_KEY = "spl_offline_admin_auth";

// ─── Category display helpers ─────────────────────────────────────────────────
function getCategoryColor(category: string): string {
  const cat = category.toLowerCase();
  if (cat === "batsman") return "oklch(0.7 0.15 140)";
  if (cat === "bowler") return "oklch(0.65 0.18 25)";
  if (cat === "allrounder") return "oklch(0.78 0.165 85)";
  return "oklch(0.55 0.02 90)";
}

function displayCategory(category: string): string {
  const cat = category.toLowerCase();
  if (cat === "batsman") return "BATSMAN";
  if (cat === "bowler") return "BOWLER";
  if (cat === "allrounder") return "ALLROUNDER";
  return category.toUpperCase();
}

function CategoryBadge({ category }: { category: string }) {
  const color = getCategoryColor(category);
  return (
    <span
      className="text-xs font-broadcast tracking-widest px-2 py-0.5 flex-shrink-0"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
      }}
    >
      {displayCategory(category)}
    </span>
  );
}

// ─── Password Gate ─────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      onAuth();
    } else {
      setError("Invalid password. Access denied.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center broadcast-overlay">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.15 0.06 255 / 0.6) 0%, transparent 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div
          className="p-8"
          style={{
            background: "oklch(0.12 0.03 255 / 0.95)",
            border: "1px solid oklch(0.82 0.18 65 / 0.4)",
            boxShadow: "0 0 60px oklch(0.82 0.18 65 / 0.1)",
          }}
        >
          {/* Offline badge */}
          <div className="flex justify-center mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-broadcast tracking-widest"
              style={{
                background: "oklch(0.82 0.18 65 / 0.12)",
                border: "1px solid oklch(0.82 0.18 65 / 0.4)",
                color: "oklch(0.88 0.18 68)",
              }}
            >
              <WifiOff size={10} />
              OFFLINE MODE
            </span>
          </div>

          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "oklch(0.78 0.165 85 / 0.1)",
                border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              }}
            >
              <Shield size={28} style={{ color: "oklch(0.78 0.165 85)" }} />
            </div>
            <h1
              className="font-broadcast text-2xl tracking-wider"
              style={{ color: "oklch(0.78 0.165 85)" }}
            >
              ADMIN ACCESS
            </h1>
            <p
              className="text-sm mt-2"
              style={{ color: "oklch(0.42 0.02 90)" }}
            >
              SPL 2026 Offline Auction Control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="offline-admin-password"
                className="block text-xs font-broadcast tracking-widest mb-2"
                style={{ color: "oklch(0.52 0.02 90)" }}
              >
                PASSWORD
              </label>
              <input
                id="offline-admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 font-digital text-base bg-transparent outline-none"
                style={{
                  background: "oklch(0.09 0.025 255)",
                  border: "1px solid oklch(0.25 0.03 255)",
                  color: "oklch(0.96 0.01 90)",
                }}
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                  style={{
                    background: "oklch(0.62 0.22 25 / 0.1)",
                    border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                    color: "oklch(0.75 0.15 25)",
                  }}
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 font-broadcast tracking-wider transition-all duration-200 hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                color: "oklch(0.08 0.025 265)",
              }}
            >
              <Shield size={16} />
              ACCESS PANEL
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Edit Purse Modal ──────────────────────────────────────────────────────────
function EditPurseModal({
  team,
  onClose,
  onSave,
}: {
  team: OfflineTeam;
  onClose: () => void;
  onSave: (teamId: number, newPurse: number) => void;
}) {
  const [value, setValue] = useState(String(team.purseAmountLeft));

  const handleSave = () => {
    const num = Number.parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    onSave(team.id, num);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.7)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-4 p-6"
        style={{
          background: "oklch(0.12 0.03 255)",
          border: "1px solid oklch(0.78 0.165 85 / 0.3)",
        }}
      >
        <h3
          className="font-broadcast text-sm tracking-wider mb-1"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          EDIT PURSE
        </h3>
        <p className="text-xs mb-4" style={{ color: "oklch(0.52 0.02 90)" }}>
          {team.name}
        </p>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2 font-digital text-lg mb-4 outline-none"
          style={{
            background: "oklch(0.09 0.025 255)",
            border: "1px solid oklch(0.25 0.03 255)",
            color: "oklch(0.96 0.01 90)",
          }}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-sm font-broadcast tracking-wider"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.62 0.02 90)",
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 text-sm font-broadcast tracking-wider"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
              color: "oklch(0.08 0.025 265)",
            }}
          >
            SAVE
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Unsell Modal ──────────────────────────────────────────────────────────────
function UnsellModal({
  player,
  team,
  onClose,
  onConfirm,
}: {
  player: OfflinePlayer;
  team: OfflineTeam | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const restoredPurse = team
    ? team.purseAmountLeft + (player.soldPrice ?? 0)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.75)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4 p-6"
        style={{
          background: "oklch(0.12 0.03 255)",
          border: "1px solid oklch(0.82 0.14 55 / 0.4)",
          boxShadow: "0 0 40px oklch(0.82 0.14 55 / 0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(0.82 0.14 55 / 0.1)",
              border: "1px solid oklch(0.82 0.14 55 / 0.3)",
            }}
          >
            <UndoDot size={18} style={{ color: "oklch(0.82 0.14 55)" }} />
          </div>
          <div>
            <h3
              className="font-broadcast text-sm tracking-wider"
              style={{ color: "oklch(0.82 0.14 55)" }}
            >
              UNSELL PLAYER
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.42 0.02 90)" }}
            >
              Restore purse and return player to auction pool
            </p>
          </div>
        </div>

        <div
          className="p-4 mb-4 text-sm space-y-2"
          style={{
            background: "oklch(0.09 0.025 255)",
            border: "1px solid oklch(0.25 0.03 255)",
          }}
        >
          <p style={{ color: "oklch(0.78 0.02 90)" }}>
            <span
              style={{ color: "oklch(0.78 0.165 85)" }}
              className="font-broadcast"
            >
              Player:{" "}
            </span>
            {player.name}
          </p>
          <p style={{ color: "oklch(0.78 0.02 90)" }}>
            <span
              style={{ color: "oklch(0.78 0.165 85)" }}
              className="font-broadcast"
            >
              Sold to:{" "}
            </span>
            {team?.name ?? "Unknown"}
          </p>
          <p style={{ color: "oklch(0.78 0.02 90)" }}>
            <span
              style={{ color: "oklch(0.78 0.165 85)" }}
              className="font-broadcast"
            >
              Sold price:{" "}
            </span>
            <span className="font-digital">
              {player.soldPrice !== undefined
                ? player.soldPrice.toLocaleString()
                : "—"}
            </span>{" "}
            pts
          </p>
          {restoredPurse !== null && (
            <p style={{ color: "oklch(0.78 0.02 90)" }}>
              <span
                style={{ color: "oklch(0.78 0.165 85)" }}
                className="font-broadcast"
              >
                Purse after restore:{" "}
              </span>
              <span className="font-digital">
                {restoredPurse.toLocaleString()}
              </span>{" "}
              pts
            </p>
          )}
        </div>

        <p className="text-xs mb-4" style={{ color: "oklch(0.52 0.02 90)" }}>
          The team's purse will be restored. The player will be re-added to the
          upcoming pool.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-broadcast tracking-wider"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.62 0.02 90)",
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-broadcast tracking-wider hover:opacity-90"
            style={{
              background: "oklch(0.82 0.14 55 / 0.18)",
              border: "1px solid oklch(0.82 0.14 55 / 0.5)",
              color: "oklch(0.82 0.14 55)",
            }}
          >
            <UndoDot size={13} />
            CONFIRM UNSELL
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Team Card ─────────────────────────────────────────────────────────────────
function TeamCard({
  team,
  isLeading,
  currentBid,
  auctionActive,
  onPlaceBid,
  onEditPurse,
  logoUrl,
}: {
  team: OfflineTeam;
  isLeading: boolean;
  currentBid: number;
  auctionActive: boolean;
  onPlaceBid: (teamId: number) => void;
  onEditPurse: (team: OfflineTeam) => void;
  logoUrl: string;
}) {
  const remainingSlots = 7 - team.numberOfPlayers;
  const purseRemaining = team.purseAmountLeft;
  const newBid = currentBid + 100;
  const minRequired = remainingSlots > 1 ? (remainingSlots - 1) * 100 : 0;
  const canBid =
    !team.isTeamLocked &&
    auctionActive &&
    purseRemaining >= newBid + minRequired;

  const initials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="team-card-hover p-3 relative"
      style={{
        background: isLeading
          ? "oklch(0.16 0.05 85 / 0.35)"
          : "oklch(0.12 0.025 255)",
        border: isLeading
          ? "1px solid oklch(0.78 0.165 85 / 0.55)"
          : "1px solid oklch(0.25 0.03 255)",
        boxShadow: isLeading ? "0 0 24px oklch(0.78 0.165 85 / 0.18)" : "none",
      }}
    >
      {isLeading && (
        <div
          className="absolute top-1 right-1 text-xs font-broadcast px-1.5 py-0.5 tracking-wider"
          style={{
            background: "oklch(0.78 0.165 85)",
            color: "oklch(0.08 0.025 265)",
          }}
        >
          LEADING
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            background: logoUrl ? "transparent" : "oklch(0.16 0.04 255)",
            border: "1px solid oklch(0.25 0.03 255)",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={team.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span
              className="font-broadcast"
              style={{ color: "oklch(0.78 0.165 85)", fontSize: "10px" }}
            >
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="font-broadcast truncate"
            style={{
              color: team.isTeamLocked
                ? "oklch(0.38 0.02 90)"
                : "oklch(0.9 0.02 90)",
              fontSize: "11px",
            }}
          >
            {team.name}
          </div>
          <div
            className="text-xs"
            style={{ color: "oklch(0.42 0.02 90)", fontSize: "10px" }}
          >
            {team.ownerName}
          </div>
        </div>
        {team.isTeamLocked && (
          <Lock
            size={11}
            style={{ color: "oklch(0.42 0.02 90)", flexShrink: 0 }}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 mb-2 text-center">
        <div>
          <div
            className="font-digital font-bold"
            style={{ color: "oklch(0.78 0.165 85)", fontSize: "13px" }}
          >
            {purseRemaining.toLocaleString()}
          </div>
          <div
            className="text-xs"
            style={{ color: "oklch(0.38 0.02 90)", fontSize: "9px" }}
          >
            pts left
          </div>
        </div>
        <div>
          <div
            className="font-digital font-bold"
            style={{ color: "oklch(0.7 0.15 140)", fontSize: "13px" }}
          >
            {team.numberOfPlayers}/7
          </div>
          <div
            className="text-xs"
            style={{ color: "oklch(0.38 0.02 90)", fontSize: "9px" }}
          >
            bought
          </div>
        </div>
        <div>
          <div
            className="font-digital font-bold"
            style={{
              color:
                remainingSlots === 0
                  ? "oklch(0.38 0.02 90)"
                  : "oklch(0.65 0.18 25)",
              fontSize: "13px",
            }}
          >
            {remainingSlots}
          </div>
          <div
            className="text-xs"
            style={{ color: "oklch(0.38 0.02 90)", fontSize: "9px" }}
          >
            slots
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {team.isTeamLocked ? (
          <div
            className="flex-1 py-1.5 text-center text-xs font-broadcast tracking-wider"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.38 0.02 90)",
            }}
          >
            SQUAD FULL
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onPlaceBid(team.id)}
            disabled={!canBid}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-broadcast tracking-wider transition-all duration-100 hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: canBid
                ? "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))"
                : "oklch(0.16 0.03 255)",
              color: canBid ? "oklch(0.08 0.025 265)" : "oklch(0.42 0.02 90)",
              border: canBid ? "none" : "1px solid oklch(0.25 0.03 255)",
            }}
          >
            <Plus size={11} />
            +100
          </button>
        )}
        <button
          type="button"
          onClick={() => onEditPurse(team)}
          className="px-2 py-1.5 transition-all hover:opacity-80"
          style={{
            background: "oklch(0.16 0.03 255)",
            border: "1px solid oklch(0.25 0.03 255)",
            color: "oklch(0.52 0.02 90)",
          }}
          title="Edit purse"
        >
          <Edit3 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Remaining Players Panel ───────────────────────────────────────────────────
function RemainingPlayersPanel({
  players,
  auctionActive,
  onSelect,
}: {
  players: OfflinePlayer[];
  auctionActive: boolean;
  onSelect: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  if (upcomingPlayers.length === 0) return null;

  const byCategory: Record<string, OfflinePlayer[]> = {};
  for (const p of upcomingPlayers) {
    const key = p.category;
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  }

  return (
    <div
      style={{
        background: "oklch(0.12 0.025 255)",
        border: "1px solid oklch(0.25 0.03 255)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{
          borderBottom: isExpanded ? "1px solid oklch(0.22 0.025 255)" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <Users size={12} style={{ color: "oklch(0.65 0.18 25)" }} />
          <span
            className="font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.65 0.18 25)" }}
          >
            REMAINING PLAYERS
          </span>
          <span
            className="font-digital text-xs px-1.5 py-0.5"
            style={{
              background: "oklch(0.65 0.18 25 / 0.12)",
              border: "1px solid oklch(0.65 0.18 25 / 0.3)",
              color: "oklch(0.75 0.15 25)",
            }}
          >
            {upcomingPlayers.length}
          </span>
        </div>
        <div style={{ color: "oklch(0.42 0.02 90)" }}>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-2.5 space-y-3 max-h-72 overflow-y-auto">
              {Object.entries(byCategory).map(([category, catPlayers]) => {
                const color = getCategoryColor(category);
                return (
                  <div key={category}>
                    <div
                      className="text-xs font-broadcast tracking-widest mb-1.5 pb-1"
                      style={{
                        color,
                        borderBottom: `1px solid ${color}28`,
                      }}
                    >
                      {displayCategory(category)} ({catPlayers.length})
                    </div>
                    <div className="space-y-1">
                      {catPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2 px-2 py-1.5"
                          style={{
                            background: "oklch(0.09 0.02 255)",
                            border: `1px solid ${color}1a`,
                          }}
                        >
                          <div
                            className="w-7 h-9 overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{
                              background: "oklch(0.14 0.04 255)",
                              border: "1px solid oklch(0.22 0.025 255)",
                            }}
                          >
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className="font-broadcast"
                                style={{ color, fontSize: "10px" }}
                              >
                                {player.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-broadcast truncate"
                              style={{
                                color: "oklch(0.88 0.02 90)",
                                fontSize: "10px",
                              }}
                              title={player.name}
                            >
                              {player.name}
                            </div>
                            <div
                              className="font-digital"
                              style={{ color, fontSize: "9px" }}
                            >
                              {player.basePrice.toLocaleString()} pts
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelect(player.id)}
                            disabled={auctionActive}
                            className="px-1.5 py-1 text-xs font-broadcast tracking-wider hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            style={{
                              background: "oklch(0.78 0.165 85 / 0.1)",
                              border: "1px solid oklch(0.78 0.165 85 / 0.25)",
                              color: "oklch(0.78 0.165 85)",
                              fontSize: "9px",
                            }}
                          >
                            SELECT
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Unsold Players Panel ──────────────────────────────────────────────────────
function UnsoldPlayersPanel({
  players,
  auctionActive,
  onPutBack,
}: {
  players: OfflinePlayer[];
  auctionActive: boolean;
  onPutBack: (id: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  if (unsoldPlayers.length === 0) return null;

  const byCategory: Record<string, OfflinePlayer[]> = {};
  for (const p of unsoldPlayers) {
    const key = p.category;
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(p);
  }

  const amberColor = "oklch(0.82 0.18 65)";

  return (
    <div
      style={{
        background: "oklch(0.12 0.025 255)",
        border: "1px solid oklch(0.82 0.18 65 / 0.35)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{
          borderBottom: isExpanded
            ? "1px solid oklch(0.82 0.18 65 / 0.2)"
            : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <Ban size={12} style={{ color: amberColor }} />
          <span
            className="font-broadcast text-xs tracking-widest"
            style={{ color: amberColor }}
          >
            UNSOLD PLAYERS
          </span>
          <span
            className="font-digital text-xs px-1.5 py-0.5"
            style={{
              background: "oklch(0.82 0.18 65 / 0.12)",
              border: "1px solid oklch(0.82 0.18 65 / 0.3)",
              color: amberColor,
            }}
          >
            {unsoldPlayers.length}
          </span>
        </div>
        <div style={{ color: "oklch(0.42 0.02 90)" }}>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-2.5 space-y-3 max-h-72 overflow-y-auto">
              {Object.entries(byCategory).map(([category, catPlayers]) => {
                const color = getCategoryColor(category);
                return (
                  <div key={category}>
                    <div
                      className="text-xs font-broadcast tracking-widest mb-1.5 pb-1"
                      style={{
                        color,
                        borderBottom: `1px solid ${color}28`,
                      }}
                    >
                      {displayCategory(category)} ({catPlayers.length})
                    </div>
                    <div className="space-y-1">
                      {catPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2 px-2 py-1.5"
                          style={{
                            background: "oklch(0.09 0.02 255)",
                            border: "1px solid oklch(0.82 0.18 65 / 0.15)",
                          }}
                        >
                          <div
                            className="w-7 h-9 overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{
                              background: "oklch(0.14 0.04 255)",
                              border: "1px solid oklch(0.82 0.18 65 / 0.2)",
                            }}
                          >
                            {player.imageUrl ? (
                              <img
                                src={player.imageUrl}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className="font-broadcast"
                                style={{ color: amberColor, fontSize: "10px" }}
                              >
                                {player.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-broadcast truncate"
                              style={{
                                color: "oklch(0.88 0.02 90)",
                                fontSize: "10px",
                              }}
                              title={player.name}
                            >
                              {player.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CategoryBadge category={player.category} />
                              <span
                                className="font-digital"
                                style={{ color: amberColor, fontSize: "9px" }}
                              >
                                {player.basePrice.toLocaleString()} pts
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPutBack(player.id)}
                            disabled={auctionActive}
                            className="px-1.5 py-1 text-xs font-broadcast tracking-wider hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            style={{
                              background: "oklch(0.82 0.18 65 / 0.08)",
                              border: "1px solid oklch(0.82 0.18 65 / 0.3)",
                              color: amberColor,
                              fontSize: "9px",
                            }}
                          >
                            PUT BACK
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel() {
  const navigate = useNavigate();
  const { auctionState, teams, players, dashboard, refetch, pausePolling } =
    useOfflineAuctionData();

  const [editPurseTeam, setEditPurseTeam] = useState<OfflineTeam | null>(null);
  const [showUnsellModal, setShowUnsellModal] = useState(false);

  // ── Optimistic bid state ─────────────────────────────────────────────────────
  const [localBid, setLocalBid] = useState<number | null>(null);
  const [localLeadingTeamId, setLocalLeadingTeamId] = useState<number | null>(
    null,
  );
  const [localAuctionActive, setLocalAuctionActive] = useState<boolean | null>(
    null,
  );
  const [localCurrentPlayerId, setLocalCurrentPlayerId] = useState<
    number | null
  >(null);
  const [undoStack, setUndoStack] = useState<
    Array<{ bid: number; teamId: number | null }>
  >([]);
  const isBiddingRef = useRef(false);
  const isUndoModeRef = useRef(false);
  const prevBidRef = useRef(0);
  const [bidBumping, setBidBumping] = useState(false);

  // Effective values
  const serverBid = auctionState?.currentBid ?? 0;
  const currentBid = localBid !== null ? localBid : serverBid;
  const effectiveLeadingTeamId =
    localLeadingTeamId !== null
      ? localLeadingTeamId
      : (auctionState?.leadingTeamId ?? null);
  const effectiveIsActive =
    localAuctionActive !== null
      ? localAuctionActive
      : (auctionState?.isActive ?? false);
  const effectiveCurrentPlayerId =
    localCurrentPlayerId !== null
      ? localCurrentPlayerId
      : (auctionState?.currentPlayerId ?? null);

  const currentPlayer =
    effectiveCurrentPlayerId != null
      ? (players.find((p) => p.id === effectiveCurrentPlayerId) ?? null)
      : null;

  const leadingTeam =
    effectiveLeadingTeamId != null
      ? (teams.find((t) => t.id === effectiveLeadingTeamId) ?? null)
      : null;

  const lastSoldPlayer =
    [...players]
      .filter((p) => p.status === "sold")
      .sort((a, b) => b.id - a.id)[0] ?? null;
  const lastSoldTeam =
    lastSoldPlayer?.soldTo != null
      ? (teams.find((t) => t.id === lastSoldPlayer.soldTo) ?? null)
      : null;

  // Bid bump animation
  useEffect(() => {
    if (currentBid > prevBidRef.current) {
      prevBidRef.current = currentBid;
      setBidBumping(true);
      const t = setTimeout(() => setBidBumping(false), 400);
      return () => clearTimeout(t);
    }
  }, [currentBid]);

  // Sync optimistic bid when store confirms
  useEffect(() => {
    if (isUndoModeRef.current) return;
    if (localBid !== null && serverBid >= localBid) {
      setLocalBid(null);
      setLocalLeadingTeamId(null);
    }
  }, [serverBid, localBid]);

  // Clear local state when auction goes inactive
  useEffect(() => {
    if (!effectiveIsActive) {
      setUndoStack([]);
      if (!isUndoModeRef.current) {
        setLocalBid(null);
        setLocalLeadingTeamId(null);
      }
    }
  }, [effectiveIsActive]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleSelectPlayer = (playerId: number) => {
    if (effectiveIsActive) {
      toast.warning("An auction is already active. Sell or reset first.");
      return;
    }
    setLocalCurrentPlayerId(playerId);
    setLocalAuctionActive(true);
    setLocalBid(null);
    setLocalLeadingTeamId(null);
    setUndoStack([]);

    const result = offlineStore.selectPlayer(playerId);
    if (!result.ok) {
      setLocalCurrentPlayerId(null);
      setLocalAuctionActive(null);
      toast.error(result.err);
    } else {
      toast.success("Player selected");
      refetch();
      setLocalCurrentPlayerId(null);
      setLocalAuctionActive(null);
    }
  };

  const handlePlaceBid = useCallback(
    (teamId: number) => {
      if (isBiddingRef.current) return;

      const prevBid = currentBid;
      const prevTeamId = effectiveLeadingTeamId;
      const newBid = prevBid + 100;

      isBiddingRef.current = true;
      setLocalBid(newBid);
      setLocalLeadingTeamId(teamId);
      setUndoStack((prev) => [...prev, { bid: prevBid, teamId: prevTeamId }]);

      const result = offlineStore.placeBid(teamId);
      if (!result.ok) {
        setLocalBid(null);
        setLocalLeadingTeamId(null);
        setUndoStack((prev) => prev.slice(0, -1));
        toast.error(result.err, {
          description: "Insufficient purse or slot rule violated",
        });
      } else {
        refetch();
      }
      isBiddingRef.current = false;
    },
    [currentBid, effectiveLeadingTeamId, refetch],
  );

  const handleUndoBid = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    isUndoModeRef.current = true;
    setLocalBid(last.bid);
    setLocalLeadingTeamId(last.teamId);
    pausePolling(5000);
    setTimeout(() => {
      isUndoModeRef.current = false;
      setLocalBid(null);
      setLocalLeadingTeamId(null);
    }, 5000);
    toast.info("Bid reversed. Will resync in 5 seconds.", { duration: 5000 });
  };

  const handleSell = () => {
    setLocalAuctionActive(false);
    setLocalBid(null);
    setLocalLeadingTeamId(null);
    setUndoStack([]);

    const result = offlineStore.sellPlayer();
    if (!result.ok) {
      setLocalAuctionActive(null);
      toast.error(result.err);
    } else {
      toast.success("Player SOLD! 🎉");
      refetch();
      setLocalAuctionActive(null);
      setLocalCurrentPlayerId(null);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset entire auction? This cannot be undone.")) return;
    offlineStore.resetAuction();
    setLocalBid(null);
    setLocalLeadingTeamId(null);
    setLocalAuctionActive(null);
    setLocalCurrentPlayerId(null);
    setUndoStack([]);
    toast.success("Auction reset");
    refetch();
  };

  const handleEditPurse = (teamId: number, newPurse: number) => {
    const result = offlineStore.editTeamPurse(teamId, newPurse);
    if (!result.ok) {
      toast.error(result.err);
    } else {
      toast.success("Purse updated");
      refetch();
    }
  };

  const handleUnsellConfirm = () => {
    if (!lastSoldPlayer) return;
    const result = offlineStore.unsellPlayer(lastSoldPlayer.id);
    if (!result.ok) {
      toast.error(`Unsell failed: ${result.err}`);
    } else {
      toast.success(`${lastSoldPlayer.name} returned to auction pool.`, {
        duration: 5000,
      });
      refetch();
    }
  };

  const handleMarkUnsold = () => {
    setLocalAuctionActive(false);
    setLocalBid(null);
    setLocalLeadingTeamId(null);
    setUndoStack([]);

    const result = offlineStore.markPlayerUnsold();
    if (!result.ok) {
      setLocalAuctionActive(null);
      toast.error(result.err);
    } else {
      toast.info("Player marked as UNSOLD");
      refetch();
      setLocalAuctionActive(null);
      setLocalCurrentPlayerId(null);
    }
  };

  const handlePutBack = (playerId: number) => {
    const result = offlineStore.putPlayerBackToAuction(playerId);
    if (!result.ok) {
      toast.error(result.err);
    } else {
      toast.success("Player returned to auction pool");
      refetch();
    }
  };

  const handleExportCSV = () => {
    const results = offlineStore.getResults();
    const rows = [
      ["Player Name", "Category", "Base Price", "Sold Price", "Sold To"],
      ...results.map((pwt) => [
        pwt.player.name,
        pwt.player.category,
        String(pwt.player.basePrice),
        pwt.player.soldPrice !== undefined ? String(pwt.player.soldPrice) : "-",
        pwt.team ? pwt.team.name : "Unsold",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spl-offline-auction-results.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  };

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  const soldPlayers = players.filter((p) => p.status === "sold");
  const playerNumberMap = new Map<number, number>();
  let playerCounter = 1;
  for (const p of upcomingPlayers) {
    playerNumberMap.set(p.id, playerCounter++);
  }
  for (const p of soldPlayers) {
    playerNumberMap.set(p.id, playerCounter++);
  }

  const [teamLogos, setTeamLogos] = useState(() => getTeamLogos());
  useEffect(() => {
    const refresh = () => setTeamLogos(getTeamLogos());
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const leadingTeamLogoUrl = leadingTeam
    ? (teamLogos[String(leadingTeam.id)] ?? "")
    : "";
  const leadingTeamInitials = leadingTeam
    ? leadingTeam.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  const showUndoBid = effectiveIsActive && undoStack.length > 0;
  const showUnsell = !effectiveIsActive && lastSoldPlayer !== null;
  const showUnsoldButton =
    effectiveIsActive && effectiveCurrentPlayerId !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5"
        style={{
          background: "oklch(0.1 0.025 255 / 0.97)",
          borderBottom: "1px solid oklch(0.82 0.18 65 / 0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/offline" })}
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.52 0.02 90)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="font-broadcast text-sm tracking-wider"
            style={{ color: "oklch(0.78 0.165 85)" }}
          >
            SPL 2026
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-broadcast tracking-widest"
            style={{
              background: "oklch(0.82 0.18 65 / 0.12)",
              border: "1px solid oklch(0.82 0.18 65 / 0.35)",
              color: "oklch(0.88 0.18 68)",
            }}
          >
            <WifiOff size={9} />
            OFFLINE
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.62 0.02 90)",
            }}
          >
            <Download size={11} />
            <span className="hidden sm:inline">EXPORT CSV</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/offline/settings" })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.62 0.02 90)",
            }}
          >
            <Settings size={11} />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/offline/squads" })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
            style={{
              background: "oklch(0.78 0.165 85 / 0.12)",
              border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              color: "oklch(0.78 0.165 85)",
            }}
          >
            <Users size={11} />
            <span className="hidden sm:inline">SQUADS</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/offline/live" })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
            style={{
              background: "oklch(0.78 0.165 85 / 0.12)",
              border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              color: "oklch(0.78 0.165 85)",
            }}
          >
            <span className="hidden sm:inline">LIVE SCREEN</span>
            <span className="sm:hidden">LIVE</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
            style={{
              background: "oklch(0.16 0.03 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.52 0.02 90)",
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* ─── LEFT COLUMN ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className="p-3"
              style={{
                background: "oklch(0.12 0.025 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              <Coins
                size={14}
                style={{ color: "oklch(0.78 0.165 85)" }}
                className="mb-1.5"
              />
              <div
                className="font-digital text-lg font-bold"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                {(dashboard?.totalSpent ?? 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "oklch(0.42 0.02 90)" }}>
                Total Spent
              </div>
            </div>
            <div
              className="p-3"
              style={{
                background: "oklch(0.12 0.025 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              <Users
                size={14}
                style={{ color: "oklch(0.7 0.15 140)" }}
                className="mb-1.5"
              />
              <div
                className="font-digital text-lg font-bold"
                style={{ color: "oklch(0.7 0.15 140)" }}
              >
                {dashboard?.remainingPlayers ?? 0}
              </div>
              <div className="text-xs" style={{ color: "oklch(0.42 0.02 90)" }}>
                Remaining
              </div>
            </div>
            <div
              className="p-3 col-span-2"
              style={{
                background: "oklch(0.12 0.025 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              <Trophy
                size={14}
                style={{ color: "oklch(0.78 0.165 85)" }}
                className="mb-1.5"
              />
              {dashboard?.mostExpensivePlayer ? (
                <div>
                  <div
                    className="text-sm font-broadcast truncate"
                    style={{ color: "oklch(0.85 0.02 90)" }}
                  >
                    {dashboard.mostExpensivePlayer.name}
                  </div>
                  <div
                    className="font-digital text-base font-bold"
                    style={{ color: "oklch(0.78 0.165 85)" }}
                  >
                    {(
                      dashboard.mostExpensivePlayer.soldPrice ??
                      dashboard.mostExpensivePlayer.basePrice
                    ).toLocaleString()}{" "}
                    pts
                  </div>
                </div>
              ) : (
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.42 0.02 90)" }}
                >
                  No players sold yet
                </div>
              )}
              <div className="text-xs" style={{ color: "oklch(0.42 0.02 90)" }}>
                Most Expensive Player
              </div>
            </div>
          </div>

          {/* Player List */}
          <div
            style={{
              background: "oklch(0.12 0.025 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          >
            <div
              className="px-3 py-2.5 flex items-center justify-between"
              style={{ borderBottom: "1px solid oklch(0.25 0.03 255)" }}
            >
              <span
                className="font-broadcast text-xs tracking-widest"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                PLAYER LIST
              </span>
              <span
                className="text-xs"
                style={{ color: "oklch(0.42 0.02 90)" }}
              >
                {soldPlayers.length}/{players.length} sold
              </span>
            </div>
            <div className="overflow-y-auto max-h-64 sm:max-h-80">
              {upcomingPlayers.map((player) => {
                const num = playerNumberMap.get(player.id);
                return (
                  <div
                    key={player.id}
                    className="px-3 py-2.5 flex items-center justify-between gap-2"
                    style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
                  >
                    <span
                      className="font-digital font-bold flex-shrink-0"
                      style={{
                        color: "oklch(0.78 0.165 85)",
                        fontSize: "11px",
                        minWidth: "22px",
                      }}
                    >
                      #{num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: "oklch(0.88 0.02 90)" }}
                      >
                        {player.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CategoryBadge category={player.category} />
                        <span
                          className="text-xs font-digital"
                          style={{ color: "oklch(0.52 0.02 90)" }}
                        >
                          {player.basePrice} pts
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPlayer(player.id)}
                      disabled={effectiveIsActive}
                      className="px-2.5 py-1 text-xs font-broadcast tracking-wider hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                      style={{
                        background: "oklch(0.78 0.165 85 / 0.12)",
                        border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                        color: "oklch(0.78 0.165 85)",
                      }}
                    >
                      SELECT
                    </button>
                  </div>
                );
              })}
              {soldPlayers.map((player) => {
                const num = playerNumberMap.get(player.id);
                return (
                  <div
                    key={player.id}
                    className="px-3 py-2 flex items-center gap-2 opacity-40"
                    style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
                  >
                    <span
                      className="font-digital font-bold flex-shrink-0"
                      style={{
                        color: "oklch(0.52 0.02 90)",
                        fontSize: "11px",
                        minWidth: "22px",
                      }}
                    >
                      #{num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs line-through truncate"
                        style={{ color: "oklch(0.52 0.02 90)" }}
                      >
                        {player.name}
                      </div>
                    </div>
                    <span
                      className="text-xs font-broadcast px-1.5 py-0.5 flex-shrink-0"
                      style={{
                        background: "oklch(0.7 0.15 140 / 0.15)",
                        border: "1px solid oklch(0.7 0.15 140 / 0.3)",
                        color: "oklch(0.7 0.15 140)",
                      }}
                    >
                      SOLD
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remaining / Re-queue Panel */}
          <RemainingPlayersPanel
            players={players}
            auctionActive={effectiveIsActive}
            onSelect={handleSelectPlayer}
          />

          {/* Unsold Players Panel */}
          <UnsoldPlayersPanel
            players={players}
            auctionActive={effectiveIsActive}
            onPutBack={handlePutBack}
          />
        </div>

        {/* ─── CENTER COLUMN ────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div
            style={{
              background: "oklch(0.09 0.025 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          >
            {/* Player identity */}
            <div
              className="flex gap-3 p-3"
              style={{ borderBottom: "1px solid oklch(0.18 0.025 255)" }}
            >
              {currentPlayer ? (
                <>
                  <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{
                      width: "56px",
                      height: "72px",
                      border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                      boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.1)",
                    }}
                  >
                    {currentPlayer.imageUrl ? (
                      <img
                        src={currentPlayer.imageUrl}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-broadcast text-lg"
                        style={{
                          background: "oklch(0.16 0.04 255)",
                          color: "oklch(0.78 0.165 85)",
                        }}
                      >
                        {currentPlayer.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h2
                      className="font-broadcast text-base tracking-wide truncate"
                      style={{ color: "oklch(0.94 0.015 90)" }}
                    >
                      {currentPlayer.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <CategoryBadge category={currentPlayer.category} />
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.38 0.02 90)" }}
                      >
                        Base{" "}
                        <span
                          className="font-digital"
                          style={{ color: "oklch(0.62 0.12 82)" }}
                        >
                          {currentPlayer.basePrice.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={11} style={{ color: "oklch(0.78 0.165 85)" }} />
                    <span
                      className="font-digital text-sm"
                      style={{ color: "oklch(0.62 0.12 82)" }}
                    >
                      {currentPlayer.rating}
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="flex-1 text-center py-3"
                  style={{ color: "oklch(0.32 0.02 90)" }}
                >
                  <div className="text-3xl mb-1.5">🏏</div>
                  <div className="font-broadcast text-xs tracking-widest">
                    SELECT A PLAYER TO BEGIN
                  </div>
                </div>
              )}
            </div>

            {/* Bid counter */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-broadcast tracking-widest"
                  style={{ color: "oklch(0.35 0.02 90)" }}
                >
                  CURRENT BID
                  {localBid !== null && (
                    <span
                      className="ml-2"
                      style={{ color: "oklch(0.78 0.165 85 / 0.6)" }}
                    >
                      (live)
                    </span>
                  )}
                </span>
              </div>

              <div
                className="mb-2"
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, oklch(0.78 0.165 85 / 0.5), oklch(0.78 0.165 85 / 0.1) 60%, transparent)",
                }}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-end gap-2 mb-1">
                    <div
                      className={`font-digital leading-none ${bidBumping ? "bid-bump" : ""} pulse-gold`}
                      style={{
                        fontSize: "clamp(44px, 5.5vw, 68px)",
                        fontWeight: 800,
                        color: "oklch(0.82 0.17 87)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {currentBid.toLocaleString()}
                    </div>
                    <span
                      className="font-broadcast pb-1"
                      style={{ fontSize: "14px", color: "oklch(0.48 0.08 80)" }}
                    >
                      PTS
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    {leadingTeam ? (
                      <motion.div
                        key={leadingTeam.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="w-1.5 h-1.5 flex-shrink-0"
                          style={{ background: "oklch(0.78 0.165 85)" }}
                        />
                        <span
                          className="font-broadcast text-sm tracking-wide truncate"
                          style={{ color: "oklch(0.78 0.165 85)" }}
                        >
                          {leadingTeam.name}
                        </span>
                      </motion.div>
                    ) : (
                      <div
                        className="text-xs font-broadcast tracking-wider"
                        style={{ color: "oklch(0.28 0.02 90)" }}
                      >
                        NO BID YET
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Leading team logo */}
                <AnimatePresence mode="wait">
                  {leadingTeam ? (
                    <motion.div
                      key={`logo-${leadingTeam.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0"
                    >
                      {leadingTeamLogoUrl ? (
                        <img
                          src={leadingTeamLogoUrl}
                          alt={leadingTeam.name}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid oklch(0.78 0.165 85 / 0.6)",
                            boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.3)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            border: "2px solid oklch(0.78 0.165 85 / 0.4)",
                            background: "oklch(0.16 0.05 255)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "oklch(0.78 0.165 85)",
                            fontFamily: '"Bricolage Grotesque", sans-serif',
                          }}
                        >
                          {leadingTeamInitials}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-logo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "2px dashed oklch(0.25 0.03 255)",
                        background: "oklch(0.1 0.025 255)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="p-3 flex items-center gap-2 flex-wrap"
              style={{ borderTop: "1px solid oklch(0.18 0.025 255)" }}
            >
              {/* RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-broadcast tracking-wider hover:opacity-80"
                style={{
                  background: "oklch(0.13 0.03 255)",
                  border: "1px solid oklch(0.62 0.22 25 / 0.35)",
                  color: "oklch(0.62 0.22 25)",
                }}
              >
                <RotateCcw size={12} />
                RESET
              </button>

              {/* UNDO BID */}
              <AnimatePresence>
                {showUndoBid && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleUndoBid}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-broadcast tracking-wider hover:opacity-80"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.78 0.165 55 / 0.5)",
                      color: "oklch(0.82 0.17 80)",
                    }}
                  >
                    <Undo2 size={12} />
                    UNDO BID
                  </motion.button>
                )}
              </AnimatePresence>

              {/* UNSOLD */}
              <AnimatePresence>
                {showUnsoldButton && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleMarkUnsold}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-broadcast tracking-wider hover:opacity-80"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.82 0.18 65 / 0.55)",
                      color: "oklch(0.82 0.18 65)",
                    }}
                  >
                    <Ban size={12} />
                    UNSOLD
                  </motion.button>
                )}
              </AnimatePresence>

              {/* UNSELL */}
              <AnimatePresence>
                {showUnsell && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setShowUnsellModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-broadcast tracking-wider hover:opacity-80"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.78 0.16 52 / 0.5)",
                      color: "oklch(0.82 0.15 55)",
                    }}
                  >
                    <UndoDot size={12} />
                    UNSELL
                  </motion.button>
                )}
              </AnimatePresence>

              {/* SOLD */}
              <button
                type="button"
                onClick={handleSell}
                disabled={!effectiveIsActive || !effectiveLeadingTeamId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 font-broadcast tracking-widest hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  fontSize: "15px",
                  background:
                    effectiveIsActive && effectiveLeadingTeamId
                      ? "linear-gradient(135deg, oklch(0.75 0.17 140), oklch(0.58 0.2 140))"
                      : "oklch(0.16 0.03 255)",
                  color:
                    effectiveIsActive && effectiveLeadingTeamId
                      ? "oklch(0.97 0.01 90)"
                      : "oklch(0.32 0.02 90)",
                  border:
                    effectiveIsActive && effectiveLeadingTeamId
                      ? "none"
                      : "1px solid oklch(0.25 0.03 255)",
                  boxShadow:
                    effectiveIsActive && effectiveLeadingTeamId
                      ? "0 0 25px oklch(0.7 0.15 140 / 0.5)"
                      : "none",
                }}
              >
                <CheckCircle size={15} />
                SOLD!
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─────────────────────────────────────────────── */}
        <div>
          <div
            style={{
              background: "oklch(0.12 0.025 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          >
            <div
              className="px-3 py-2.5 flex items-center justify-between"
              style={{ borderBottom: "1px solid oklch(0.25 0.03 255)" }}
            >
              <span
                className="font-broadcast text-xs tracking-widest"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                TEAMS — BID CONTROL
              </span>
              <span
                className="text-xs"
                style={{ color: "oklch(0.42 0.02 90)" }}
              >
                +100 to raise bid
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-2 gap-2">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isLeading={
                    effectiveLeadingTeamId !== null &&
                    team.id === effectiveLeadingTeamId
                  }
                  currentBid={currentBid}
                  auctionActive={effectiveIsActive}
                  onPlaceBid={handlePlaceBid}
                  onEditPurse={setEditPurseTeam}
                  logoUrl={teamLogos[String(team.id)] ?? ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editPurseTeam && (
          <EditPurseModal
            team={editPurseTeam}
            onClose={() => setEditPurseTeam(null)}
            onSave={handleEditPurse}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnsellModal && lastSoldPlayer && (
          <UnsellModal
            player={lastSoldPlayer}
            team={lastSoldTeam}
            onClose={() => setShowUnsellModal(false)}
            onConfirm={handleUnsellConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function OfflineAdminPage() {
  const [isAuthed, setIsAuthed] = useState(
    () => localStorage.getItem(AUTH_KEY) === "1",
  );

  if (!isAuthed) {
    return <PasswordGate onAuth={() => setIsAuthed(true)} />;
  }

  return <AdminPanel />;
}
