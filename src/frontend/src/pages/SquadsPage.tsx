import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Crown,
  Loader2,
  Lock,
  RotateCcw,
  Star,
  Trophy,
  UserSquare2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Player, Team } from "../backend.d";
import { useAuctionData } from "../hooks/useAuctionData";
import {
  getIconPhotos,
  getLeagueSettings,
  getOwnerPhotos,
  getTeamLogos,
} from "./LandingPage";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Batsman: "oklch(0.7 0.15 140)",
  Bowler: "oklch(0.65 0.18 25)",
  Allrounder: "oklch(0.78 0.165 85)",
};

function getInitials(name: string, count = 2) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, count)
    .toUpperCase();
}

// ─── Team Logo Circle ──────────────────────────────────────────────────────────
function TeamLogoCircle({
  team,
  logoUrl,
  size = 48,
  active = false,
}: {
  team: Team;
  logoUrl: string;
  size?: number;
  active?: boolean;
}) {
  const initials = getInitials(team.name);
  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: logoUrl ? "transparent" : "oklch(0.16 0.04 255)",
        border: active
          ? "2px solid oklch(0.78 0.165 85)"
          : "2px solid oklch(0.25 0.03 255)",
        boxShadow: active ? "0 0 14px oklch(0.78 0.165 85 / 0.35)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
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
          style={{
            color: active ? "oklch(0.78 0.165 85)" : "oklch(0.52 0.04 255)",
            fontSize: `${Math.round(size * 0.33)}px`,
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

// ─── Hammer Animation Overlay ─────────────────────────────────────────────────
function HammerAnimation({
  teamLogoUrl,
  teamName,
  playerName,
  isSold,
  onDone,
}: {
  teamLogoUrl: string;
  teamName: string;
  playerName: string;
  isSold: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.82)", backdropFilter: "blur(6px)" }}
    >
      {/* Hammer SVG animation */}
      <motion.div
        initial={{ rotate: -60, y: -60, opacity: 0 }}
        animate={{
          rotate: [-60, 20, -5, 10, 0],
          y: [-60, 10, -4, 6, 0],
          opacity: 1,
        }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mb-4"
        style={{ fontSize: "80px", lineHeight: 1 }}
      >
        🔨
      </motion.div>

      {/* Impact flash */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
        transition={{ delay: 0.45, duration: 0.3 }}
        className="w-48 h-1 mb-6"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.165 85), transparent)",
        }}
      />

      {isSold ? (
        <>
          {/* SOLD text */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="font-broadcast tracking-widest mb-3"
            style={{
              fontSize: "clamp(48px, 10vw, 80px)",
              color: "oklch(0.78 0.165 85)",
              textShadow:
                "0 0 40px oklch(0.78 0.165 85 / 0.7), 0 0 80px oklch(0.78 0.165 85 / 0.3)",
              lineHeight: 1,
            }}
          >
            SOLD!
          </motion.div>

          {/* Player name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-broadcast text-lg tracking-wide mb-4"
            style={{ color: "oklch(0.88 0.02 90)" }}
          >
            {playerName}
          </motion.div>

          {/* Team logo + name */}
          {(teamLogoUrl || teamName) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex items-center gap-3 px-6 py-3"
              style={{
                background: "oklch(0.15 0.05 85 / 0.3)",
                border: "1px solid oklch(0.78 0.165 85 / 0.4)",
              }}
            >
              {teamLogoUrl ? (
                <img
                  src={teamLogoUrl}
                  alt={teamName}
                  className="rounded-full object-cover flex-shrink-0"
                  style={{ width: "44px", height: "44px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0 font-broadcast text-sm"
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "oklch(0.16 0.04 255)",
                    border: "2px solid oklch(0.78 0.165 85 / 0.5)",
                    color: "oklch(0.78 0.165 85)",
                  }}
                >
                  {getInitials(teamName)}
                </div>
              )}
              <span
                className="font-broadcast text-base tracking-wide"
                style={{ color: "oklch(0.92 0.02 90)" }}
              >
                {teamName}
              </span>
            </motion.div>
          )}
        </>
      ) : (
        <>
          {/* UNSOLD text */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="font-broadcast tracking-widest mb-3"
            style={{
              fontSize: "clamp(48px, 10vw, 80px)",
              color: "oklch(0.65 0.18 25)",
              textShadow:
                "0 0 40px oklch(0.65 0.18 25 / 0.6), 0 0 80px oklch(0.65 0.18 25 / 0.2)",
              lineHeight: 1,
            }}
          >
            UNSOLD
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="font-broadcast text-lg tracking-wide"
            style={{ color: "oklch(0.62 0.02 90)" }}
          >
            {playerName}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

// ─── Owner Slot ────────────────────────────────────────────────────────────────
function OwnerSlot({ team, photoUrl }: { team: Team; photoUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center p-3 gap-2"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.07 85 / 0.25) 0%, oklch(0.12 0.04 255 / 0.8) 100%)",
        border: "1px solid oklch(0.78 0.165 85 / 0.4)",
        boxShadow: "inset 0 0 20px oklch(0.78 0.165 85 / 0.05)",
      }}
    >
      {/* Badge */}
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-broadcast tracking-widest flex items-center gap-1"
        style={{
          background: "oklch(0.78 0.165 85 / 0.18)",
          border: "1px solid oklch(0.78 0.165 85 / 0.5)",
          color: "oklch(0.88 0.18 88)",
          fontSize: "9px",
        }}
      >
        <Crown size={8} />
        OWNER
      </div>

      {/* Photo or icon */}
      <div
        className="w-16 h-20 overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.14 0.05 255)",
          border: "1px solid oklch(0.78 0.165 85 / 0.2)",
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={team.ownerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = parent.querySelector(
                  ".owner-fallback",
                ) as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="owner-fallback w-full h-full items-center justify-center"
          style={{ display: photoUrl ? "none" : "flex" }}
        >
          <Crown size={28} style={{ color: "oklch(0.78 0.165 85)" }} />
        </div>
      </div>

      {/* Name */}
      <div className="text-center w-full">
        <div
          className="font-broadcast text-xs tracking-wide truncate"
          style={{ color: "oklch(0.92 0.02 90)" }}
          title={team.ownerName}
        >
          {team.ownerName}
        </div>
        <div
          className="font-digital text-xs mt-0.5"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          200 pts
        </div>
      </div>
    </motion.div>
  );
}

// ─── Icon Slot ─────────────────────────────────────────────────────────────────
function IconSlot({ team, photoUrl }: { team: Team; photoUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      className="relative flex flex-col items-center p-3 gap-2"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.06 75 / 0.22) 0%, oklch(0.12 0.04 255 / 0.8) 100%)",
        border: "1px solid oklch(0.78 0.165 85 / 0.3)",
        boxShadow: "inset 0 0 20px oklch(0.78 0.165 85 / 0.04)",
      }}
    >
      {/* Badge */}
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-broadcast tracking-widest flex items-center gap-1"
        style={{
          background: "oklch(0.65 0.14 75 / 0.18)",
          border: "1px solid oklch(0.65 0.14 75 / 0.45)",
          color: "oklch(0.82 0.15 82)",
          fontSize: "9px",
        }}
      >
        <Star size={8} />
        ICON
      </div>

      {/* Photo or icon */}
      <div
        className="w-16 h-20 overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.14 0.05 255)",
          border: "1px solid oklch(0.65 0.14 75 / 0.2)",
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={team.teamIconPlayer}
            className="w-full h-full object-cover"
            onError={(e) => {
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = parent.querySelector(
                  ".icon-fallback",
                ) as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="icon-fallback w-full h-full items-center justify-center"
          style={{ display: photoUrl ? "none" : "flex" }}
        >
          <Star size={28} style={{ color: "oklch(0.65 0.14 75)" }} />
        </div>
      </div>

      {/* Name */}
      <div className="text-center w-full">
        <div
          className="font-broadcast text-xs tracking-wide truncate"
          style={{ color: "oklch(0.92 0.02 90)" }}
          title={team.teamIconPlayer}
        >
          {team.teamIconPlayer}
        </div>
        <div
          className="font-digital text-xs mt-0.5"
          style={{ color: "oklch(0.65 0.14 75)" }}
        >
          300 pts
        </div>
      </div>
    </motion.div>
  );
}

// ─── Auction Slot (filled) ─────────────────────────────────────────────────────
function FilledAuctionSlot({
  player,
  index,
}: {
  player: Player;
  index: number;
}) {
  const categoryColor =
    CATEGORY_COLORS[player.category] ?? "oklch(0.55 0.02 90)";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.06 * index }}
      className="relative flex flex-col items-center p-3 gap-2 group"
      style={{
        background: "oklch(0.12 0.025 255)",
        border: "1px solid oklch(0.25 0.03 255)",
      }}
    >
      {/* Category badge */}
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 text-xs font-broadcast tracking-widest"
        style={{
          background: `${categoryColor}18`,
          border: `1px solid ${categoryColor}40`,
          color: categoryColor,
          fontSize: "8px",
        }}
      >
        {player.category.toUpperCase()}
      </div>

      {/* Photo */}
      <div
        className="w-16 h-20 overflow-hidden flex-shrink-0"
        style={{
          border: "1px solid oklch(0.25 0.03 255)",
          background: "oklch(0.14 0.04 255)",
        }}
      >
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = parent.querySelector(
                  ".img-fallback",
                ) as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="img-fallback w-full h-full items-center justify-center font-broadcast text-lg"
          style={{
            display: player.imageUrl ? "none" : "flex",
            color: "oklch(0.78 0.165 85)",
            background: "oklch(0.14 0.04 255)",
          }}
        >
          {player.name.charAt(0)}
        </div>
      </div>

      {/* Info */}
      <div className="text-center w-full">
        <div
          className="font-broadcast text-xs tracking-wide truncate"
          style={{ color: "oklch(0.92 0.02 90)" }}
          title={player.name}
        >
          {player.name}
        </div>
        <div
          className="font-digital text-xs mt-0.5"
          style={{ color: "oklch(0.7 0.15 140)" }}
        >
          {Number(player.soldPrice ?? 0).toLocaleString()} pts
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty Auction Slot ────────────────────────────────────────────────────────
function EmptyAuctionSlot({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-3 gap-2"
      style={{
        background: "oklch(0.09 0.02 255)",
        border: "1px dashed oklch(0.22 0.025 255)",
        minHeight: "148px",
      }}
    >
      <UserSquare2
        size={22}
        style={{ color: "oklch(0.28 0.02 255)", opacity: 0.7 }}
      />
      <div
        className="font-broadcast text-xs tracking-widest"
        style={{ color: "oklch(0.3 0.02 255)", fontSize: "9px" }}
      >
        SLOT {index + 1}
      </div>
      <div
        className="text-xs font-digital"
        style={{ color: "oklch(0.28 0.02 255)", fontSize: "9px" }}
      >
        OPEN
      </div>
    </div>
  );
}

// ─── Team Squad Card ───────────────────────────────────────────────────────────
function TeamSquadCard({
  team,
  players,
  teamLogos,
  ownerPhotos,
  iconPhotos,
}: {
  team: Team;
  players: Player[];
  teamLogos: Record<string, string>;
  ownerPhotos: Record<string, string>;
  iconPhotos: Record<string, string>;
}) {
  const logoUrl = teamLogos[String(team.id)] ?? "";
  const ownerPhotoUrl = ownerPhotos[String(team.id)] ?? "";
  const iconPhotoUrl = iconPhotos[String(team.id)] ?? "";
  const squadComplete = team.isTeamLocked;

  // Auction players sold to this team
  const soldToTeam = players.filter(
    (p) => p.status === "sold" && String(p.soldTo) === String(team.id),
  );

  // 7 auction slots — stable keys avoid index-as-key lint warning
  const auctionSlots: Array<{ slotKey: string; player: Player | null }> =
    Array.from({ length: 7 }, (_, i) => ({
      slotKey: soldToTeam[i]
        ? `player-${String(soldToTeam[i].id)}`
        : `empty-slot-${i}`,
      player: soldToTeam[i] ?? null,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {/* Team header */}
      <div
        className="p-4 flex items-center justify-between gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.15 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)",
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <TeamLogoCircle team={team} logoUrl={logoUrl} size={56} active />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className="font-broadcast text-lg tracking-wide truncate"
                style={{ color: "oklch(0.96 0.02 90)" }}
              >
                {team.name}
              </h2>
              {squadComplete && (
                <div
                  className="px-2 py-0.5 flex items-center gap-1 text-xs font-broadcast tracking-widest flex-shrink-0"
                  style={{
                    background: "oklch(0.7 0.15 140 / 0.18)",
                    border: "1px solid oklch(0.7 0.15 140 / 0.5)",
                    color: "oklch(0.7 0.15 140)",
                    fontSize: "10px",
                  }}
                >
                  <Lock size={9} />
                  SQUAD COMPLETE
                </div>
              )}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "oklch(0.52 0.02 90)" }}
            >
              Owner:{" "}
              <span style={{ color: "oklch(0.78 0.165 85)" }}>
                {team.ownerName}
              </span>
              <span className="mx-2 opacity-40">·</span>
              Icon:{" "}
              <span style={{ color: "oklch(0.65 0.14 75)" }}>
                {team.teamIconPlayer}
              </span>
            </div>
          </div>
        </div>

        {/* Players bought count (purse removed) */}
        <div className="text-right flex-shrink-0">
          <div
            className="font-digital text-2xl font-bold"
            style={{ color: "oklch(0.7 0.15 140)" }}
          >
            {Number(team.numberOfPlayers)}/7
          </div>
          <div
            className="text-xs font-broadcast tracking-widest mt-0.5"
            style={{ color: "oklch(0.45 0.02 90)" }}
          >
            BOUGHT
          </div>
        </div>
      </div>

      {/* 9-slot grid */}
      <div className="p-4" style={{ background: "oklch(0.1 0.022 255)" }}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {/* Slot 1: Owner */}
          <OwnerSlot team={team} photoUrl={ownerPhotoUrl} />
          {/* Slot 2: Icon */}
          <IconSlot team={team} photoUrl={iconPhotoUrl} />
          {/* Slots 3–9: Auction (7 slots) */}
          {auctionSlots.map(({ slotKey, player }, idx) =>
            player ? (
              <FilledAuctionSlot key={slotKey} player={player} index={idx} />
            ) : (
              <EmptyAuctionSlot key={slotKey} index={idx} />
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Team Tab Button ───────────────────────────────────────────────────────────
function TeamTab({
  team,
  logoUrl,
  active,
  onClick,
}: {
  team: Team;
  logoUrl: string;
  active: boolean;
  onClick: () => void;
}) {
  const soldCount = Number(team.numberOfPlayers);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 transition-all duration-200 flex-shrink-0 relative"
      style={{
        background: active
          ? "oklch(0.16 0.06 85 / 0.3)"
          : "oklch(0.12 0.025 255)",
        border: active
          ? "1px solid oklch(0.78 0.165 85 / 0.6)"
          : "1px solid oklch(0.22 0.025 255)",
        boxShadow: active ? "0 0 12px oklch(0.78 0.165 85 / 0.15)" : "none",
        color: active ? "oklch(0.92 0.02 90)" : "oklch(0.58 0.02 90)",
      }}
    >
      <TeamLogoCircle team={team} logoUrl={logoUrl} size={28} active={active} />
      <div className="text-left">
        <div
          className="font-broadcast text-xs tracking-wide whitespace-nowrap"
          style={{ fontSize: "11px" }}
        >
          {team.name}
        </div>
        <div
          className="font-digital"
          style={{
            fontSize: "9px",
            color: active ? "oklch(0.78 0.165 85)" : "oklch(0.38 0.02 90)",
          }}
        >
          {soldCount}/7 bought
        </div>
      </div>
      {team.isTeamLocked && (
        <Lock
          size={10}
          style={{ color: "oklch(0.7 0.15 140)", flexShrink: 0 }}
        />
      )}
    </button>
  );
}

// ─── Unsold Players Panel ─────────────────────────────────────────────────────
function UnsoldPlayersPanel({ players }: { players: Player[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const unsoldPlayers = players.filter((p) => p.status === "upcoming");

  if (unsoldPlayers.length === 0) return null;

  const byCategory: Record<string, Player[]> = {};
  for (const p of unsoldPlayers) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  return (
    <div
      className="mx-3 sm:mx-4 mb-4"
      style={{
        background: "oklch(0.12 0.025 255)",
        border: "1px solid oklch(0.25 0.03 255)",
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: isExpanded ? "1px solid oklch(0.18 0.025 255)" : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <Users size={14} style={{ color: "oklch(0.65 0.18 25)" }} />
          <span
            className="font-broadcast text-sm tracking-wider"
            style={{ color: "oklch(0.65 0.18 25)" }}
          >
            UNSOLD / REMAINING PLAYERS
          </span>
          <span
            className="font-digital text-sm px-2 py-0.5"
            style={{
              background: "oklch(0.65 0.18 25 / 0.12)",
              border: "1px solid oklch(0.65 0.18 25 / 0.35)",
              color: "oklch(0.75 0.15 25)",
            }}
          >
            {unsoldPlayers.length}
          </span>
        </div>
        <div style={{ color: "oklch(0.42 0.02 90)" }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 space-y-4">
              {Object.entries(byCategory).map(([category, catPlayers]) => {
                const color =
                  CATEGORY_COLORS[category] ?? "oklch(0.55 0.02 90)";
                return (
                  <div key={category}>
                    <div
                      className="text-xs font-broadcast tracking-widest mb-2 pb-1.5"
                      style={{
                        color,
                        borderBottom: `1px solid ${color}30`,
                      }}
                    >
                      {category.toUpperCase()} ({catPlayers.length})
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                      {catPlayers.map((player) => (
                        <div
                          key={String(player.id)}
                          className="flex flex-col items-center p-2 gap-1.5"
                          style={{
                            background: "oklch(0.09 0.02 255)",
                            border: `1px solid ${color}25`,
                          }}
                        >
                          {/* Photo */}
                          <div
                            className="w-12 h-14 overflow-hidden flex items-center justify-center flex-shrink-0"
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
                                onError={(e) => {
                                  const parent = (e.target as HTMLImageElement)
                                    .parentElement;
                                  if (parent) {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                    const fb = parent.querySelector(
                                      ".unsold-fallback",
                                    ) as HTMLElement;
                                    if (fb) fb.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="unsold-fallback w-full h-full items-center justify-center font-broadcast text-base"
                              style={{
                                display: player.imageUrl ? "none" : "flex",
                                color,
                              }}
                            >
                              {player.name.charAt(0)}
                            </div>
                          </div>
                          {/* Name */}
                          <div
                            className="font-broadcast text-center w-full truncate"
                            style={{
                              color: "oklch(0.88 0.02 90)",
                              fontSize: "9px",
                              lineHeight: 1.3,
                            }}
                            title={player.name}
                          >
                            {player.name}
                          </div>
                          {/* Base price */}
                          <div
                            className="font-digital"
                            style={{ color, fontSize: "9px" }}
                          >
                            {Number(player.basePrice).toLocaleString()} pts
                          </div>
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

// ─── Squads Page ───────────────────────────────────────────────────────────────
export default function SquadsPage() {
  const navigate = useNavigate();
  const { teams, players, isLoading, error, refetch } = useAuctionData(5000);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teamLogos = getTeamLogos();
  const ownerPhotos = getOwnerPhotos();
  const iconPhotos = getIconPhotos();
  const leagueSettings = getLeagueSettings();

  // Sort teams by id
  const sortedTeams = [...teams].sort((a, b) => Number(a.id) - Number(b.id));

  // Auto-select first team once loaded
  const effectiveTeamId =
    selectedTeamId ??
    (sortedTeams.length > 0 ? String(sortedTeams[0].id) : null);

  const selectedTeam =
    effectiveTeamId != null
      ? (sortedTeams.find((t) => String(t.id) === effectiveTeamId) ?? null)
      : null;

  // ── Hammer animation trigger ────────────────────────────────────────────────
  type HammerEvent = {
    playerName: string;
    teamName: string;
    teamLogoUrl: string;
    isSold: boolean;
  };
  const [hammerEvent, setHammerEvent] = useState<HammerEvent | null>(null);
  const prevPlayerStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (players.length === 0) return;

    const prev = prevPlayerStatusRef.current;
    for (const player of players) {
      const pid = String(player.id);
      const prevStatus = prev[pid];
      const currStatus = player.status;

      if (prevStatus !== undefined && prevStatus !== currStatus) {
        if (prevStatus === "live" && currStatus === "sold") {
          // Player just sold
          const team = teams.find(
            (t) => String(t.id) === String(player.soldTo),
          );
          setHammerEvent({
            playerName: player.name,
            teamName: team?.name ?? "",
            teamLogoUrl: team ? (teamLogos[String(team.id)] ?? "") : "",
            isSold: true,
          });
        } else if (currStatus === "upcoming" && prevStatus === "sold") {
          // Player unsold (reverted)
          setHammerEvent({
            playerName: player.name,
            teamName: "",
            teamLogoUrl: "",
            isSold: false,
          });
        }
      }
      prev[pid] = currStatus;
    }
    prevPlayerStatusRef.current = prev;
  }, [players, teams, teamLogos]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hammer animation overlay */}
      <AnimatePresence>
        {hammerEvent && (
          <HammerAnimation
            key={`${hammerEvent.playerName}-${hammerEvent.isSold ? "sold" : "unsold"}`}
            playerName={hammerEvent.playerName}
            teamName={hammerEvent.teamName}
            teamLogoUrl={hammerEvent.teamLogoUrl}
            isSold={hammerEvent.isSold}
            onDone={() => setHammerEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 gap-3"
        style={{
          background: "oklch(0.1 0.025 255 / 0.97)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin" })}
            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: "oklch(0.52 0.02 90)" }}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline text-xs font-broadcast tracking-wider">
              ADMIN
            </span>
          </button>

          <div
            className="w-px h-4 flex-shrink-0"
            style={{ background: "oklch(0.25 0.03 255)" }}
          />

          <div className="flex items-center gap-2 min-w-0">
            {leagueSettings.logoUrl ? (
              <img
                src={leagueSettings.logoUrl}
                alt={leagueSettings.shortName}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: "24px", height: "24px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Trophy
                size={16}
                style={{ color: "oklch(0.78 0.165 85)", flexShrink: 0 }}
              />
            )}
            <span
              className="font-broadcast text-sm tracking-wider hidden sm:inline"
              style={{ color: "oklch(0.78 0.165 85)" }}
            >
              {leagueSettings.shortName}
            </span>
          </div>

          <div
            className="font-broadcast text-sm tracking-wider"
            style={{ color: "oklch(0.78 0.165 85)" }}
          >
            SQUADS
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading && teams.length === 0 ? (
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: "oklch(0.52 0.02 90)" }}
            />
          ) : (
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
              style={{
                background: "oklch(0.16 0.03 255)",
                border: "1px solid oklch(0.25 0.03 255)",
                color: "oklch(0.52 0.02 90)",
              }}
              title="Refresh"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {error && teams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-3 px-4 py-2 text-xs"
            style={{
              background: "oklch(0.62 0.22 25 / 0.1)",
              borderBottom: "1px solid oklch(0.62 0.22 25 / 0.3)",
              color: "oklch(0.75 0.15 25)",
            }}
          >
            Network hiccup — showing last known data.
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-broadcast tracking-wider px-2 py-0.5 hover:opacity-70"
              style={{
                background: "oklch(0.62 0.22 25 / 0.15)",
                border: "1px solid oklch(0.62 0.22 25 / 0.4)",
              }}
            >
              RETRY
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && teams.length === 0 && (
        <div className="flex items-center justify-center gap-3 py-24">
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: "oklch(0.78 0.165 85 / 0.6)" }}
          />
          <span
            className="font-broadcast text-sm tracking-widest"
            style={{ color: "oklch(0.42 0.02 90)" }}
          >
            LOADING SQUADS…
          </span>
        </div>
      )}

      {/* Main content */}
      {teams.length > 0 && (
        <div className="flex flex-col">
          {/* Team tabs — horizontal scrollable */}
          <div
            className="sticky z-30 overflow-x-auto"
            style={{
              top: "48px",
              background: "oklch(0.09 0.02 255 / 0.98)",
              borderBottom: "1px solid oklch(0.78 0.165 85 / 0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex gap-1.5 px-3 py-2 min-w-max">
              {sortedTeams.map((team) => (
                <TeamTab
                  key={String(team.id)}
                  team={team}
                  logoUrl={teamLogos[String(team.id)] ?? ""}
                  active={String(team.id) === effectiveTeamId}
                  onClick={() => setSelectedTeamId(String(team.id))}
                />
              ))}
            </div>
          </div>

          {/* Selected team squad */}
          <div className="p-3 sm:p-4">
            <AnimatePresence mode="wait">
              {selectedTeam ? (
                <motion.div
                  key={String(selectedTeam.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: "oklch(0.12 0.025 255)",
                    border: "1px solid oklch(0.25 0.03 255)",
                    overflow: "hidden",
                  }}
                >
                  <TeamSquadCard
                    team={selectedTeam}
                    players={players}
                    teamLogos={teamLogos}
                    ownerPhotos={ownerPhotos}
                    iconPhotos={iconPhotos}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                  style={{ color: "oklch(0.38 0.02 90)" }}
                >
                  <Trophy
                    size={36}
                    className="mx-auto mb-3 opacity-30"
                    style={{ color: "oklch(0.78 0.165 85)" }}
                  />
                  <p className="font-broadcast text-sm tracking-widest">
                    SELECT A TEAM
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Unsold players panel */}
          <UnsoldPlayersPanel players={players} />
        </div>
      )}

      {/* Footer */}
      <footer
        className="text-center text-xs py-6 mt-4"
        style={{ color: "oklch(0.28 0.02 90)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          style={{ color: "oklch(0.52 0.1 82)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
