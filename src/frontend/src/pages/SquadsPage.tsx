import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Copy,
  Crown,
  Loader2,
  Lock,
  RotateCcw,
  Star,
  Trophy,
  UserSquare2,
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

// ─── Small Player Slot (for vertical layout) ───────────────────────────────────

function SmallOwnerSlot({ team, photoUrl }: { team: Team; photoUrl: string }) {
  return (
    <div
      className="flex flex-col items-center justify-between"
      style={{
        width: "60px",
        height: "82px",
        flexShrink: 0,
        background:
          "linear-gradient(135deg, oklch(0.16 0.07 85 / 0.3) 0%, oklch(0.12 0.04 255 / 0.9) 100%)",
        border: "1px solid oklch(0.78 0.165 85 / 0.45)",
        padding: "3px",
      }}
      title={`Owner: ${team.ownerName} · 200 pts`}
    >
      <div
        className="w-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          height: "48px",
          background: "oklch(0.14 0.05 255)",
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={team.ownerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Crown size={14} style={{ color: "oklch(0.78 0.165 85)" }} />
        )}
      </div>
      <div className="w-full text-center" style={{ marginTop: "2px" }}>
        <div
          className="font-broadcast truncate w-full"
          style={{
            color: "oklch(0.9 0.02 90)",
            fontSize: "7px",
            lineHeight: 1.2,
          }}
          title={team.ownerName}
        >
          {team.ownerName.split(" ")[0]}
        </div>
        <div
          className="font-digital"
          style={{ color: "oklch(0.78 0.165 85)", fontSize: "7px" }}
        >
          200
        </div>
      </div>
    </div>
  );
}

function SmallIconSlot({ team, photoUrl }: { team: Team; photoUrl: string }) {
  return (
    <div
      className="flex flex-col items-center justify-between"
      style={{
        width: "60px",
        height: "82px",
        flexShrink: 0,
        background:
          "linear-gradient(135deg, oklch(0.16 0.06 75 / 0.25) 0%, oklch(0.12 0.04 255 / 0.9) 100%)",
        border: "1px solid oklch(0.78 0.165 85 / 0.3)",
        padding: "3px",
      }}
      title={`Icon: ${team.teamIconPlayer} · 300 pts`}
    >
      <div
        className="w-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          height: "48px",
          background: "oklch(0.14 0.05 255)",
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={team.teamIconPlayer}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Star size={14} style={{ color: "oklch(0.65 0.14 75)" }} />
        )}
      </div>
      <div className="w-full text-center" style={{ marginTop: "2px" }}>
        <div
          className="font-broadcast truncate w-full"
          style={{
            color: "oklch(0.9 0.02 90)",
            fontSize: "7px",
            lineHeight: 1.2,
          }}
          title={team.teamIconPlayer}
        >
          {team.teamIconPlayer.split(" ")[0]}
        </div>
        <div
          className="font-digital"
          style={{ color: "oklch(0.65 0.14 75)", fontSize: "7px" }}
        >
          300
        </div>
      </div>
    </div>
  );
}

function SmallFilledSlot({ player }: { player: Player }) {
  const categoryColor =
    CATEGORY_COLORS[player.category] ?? "oklch(0.55 0.02 90)";
  return (
    <div
      className="flex flex-col items-center justify-between"
      style={{
        width: "60px",
        height: "82px",
        flexShrink: 0,
        background: "oklch(0.12 0.025 255)",
        border: `1px solid ${categoryColor}35`,
        padding: "3px",
      }}
      title={`${player.name} · ${Number(player.soldPrice ?? 0).toLocaleString()} pts`}
    >
      <div
        className="w-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          height: "48px",
          background: "oklch(0.14 0.04 255)",
        }}
      >
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span
            className="font-broadcast"
            style={{ color: categoryColor, fontSize: "14px" }}
          >
            {player.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="w-full text-center" style={{ marginTop: "2px" }}>
        <div
          className="font-broadcast truncate w-full"
          style={{
            color: "oklch(0.9 0.02 90)",
            fontSize: "7px",
            lineHeight: 1.2,
          }}
          title={player.name}
        >
          {player.name.split(" ")[0]}
        </div>
        <div
          className="font-digital"
          style={{ color: "oklch(0.7 0.15 140)", fontSize: "7px" }}
        >
          {Number(player.soldPrice ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SmallEmptySlot({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: "60px",
        height: "82px",
        flexShrink: 0,
        background: "oklch(0.09 0.02 255)",
        border: "1px dashed oklch(0.2 0.02 255)",
      }}
      title={`Slot ${index + 1}: Open`}
    >
      <UserSquare2
        size={14}
        style={{ color: "oklch(0.26 0.02 255)", opacity: 0.7 }}
      />
      <div
        className="font-digital"
        style={{
          color: "oklch(0.26 0.02 255)",
          fontSize: "7px",
          marginTop: "3px",
        }}
      >
        OPEN
      </div>
    </div>
  );
}

// ─── Squads Page ───────────────────────────────────────────────────────────────
export default function SquadsPage() {
  const navigate = useNavigate();
  const { teams, players, isLoading, error, refetch } = useAuctionData(5000);

  const teamLogos = getTeamLogos();
  const ownerPhotos = getOwnerPhotos();
  const iconPhotos = getIconPhotos();
  const leagueSettings = getLeagueSettings();

  // Sort teams by id
  const sortedTeams = [...teams].sort((a, b) => Number(a.id) - Number(b.id));

  // ── Hammer animation trigger ────────────────────────────────────────────────
  type HammerEvent = {
    playerName: string;
    teamName: string;
    teamLogoUrl: string;
    isSold: boolean;
  };
  const [hammerEvent, setHammerEvent] = useState<HammerEvent | null>(null);
  const prevPlayerStatusRef = useRef<Record<string, string>>({});
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (players.length === 0) return;

    const prev = prevPlayerStatusRef.current;
    for (const player of players) {
      const pid = String(player.id);
      const prevStatus = prev[pid];
      const currStatus = player.status;

      if (prevStatus !== undefined && prevStatus !== currStatus) {
        if (prevStatus === "live" && currStatus === "sold") {
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

  const handleCopyTeamLink = (teamId: string) => {
    const link = `${window.location.origin}/team/${teamId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopiedTeamId(teamId);
        setTimeout(() => setCopiedTeamId(null), 2000);
      })
      .catch(() => {});
  };

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

      {/* Copied toast */}
      <AnimatePresence>
        {copiedTeamId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 z-50 px-4 py-2 font-broadcast text-xs tracking-widest"
            style={{
              transform: "translateX(-50%)",
              background: "oklch(0.78 0.165 85)",
              color: "oklch(0.08 0.025 265)",
              boxShadow: "0 4px 20px oklch(0.78 0.165 85 / 0.4)",
            }}
          >
            LINK COPIED!
          </motion.div>
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

          <div
            className="text-xs ml-1"
            style={{ color: "oklch(0.38 0.02 90)" }}
          >
            — {sortedTeams.length} teams
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

      {/* Column headers */}
      {teams.length > 0 && (
        <div
          className="flex items-center gap-2 px-2 py-1 sticky z-30"
          style={{
            top: "48px",
            background: "oklch(0.09 0.022 255 / 0.97)",
            borderBottom: "1px solid oklch(0.78 0.165 85 / 0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="flex-shrink-0 font-broadcast text-xs tracking-widest"
            style={{ width: "190px", color: "oklch(0.42 0.02 90)" }}
          >
            TEAM
          </div>
          <div
            className="flex-1 font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.42 0.02 90)" }}
          >
            OWNER · ICON · AUCTION PLAYERS (7 slots)
            <span
              className="ml-3 text-xs"
              style={{ color: "oklch(0.35 0.02 90)" }}
            >
              · hover for details
            </span>
          </div>
          <div
            className="flex-shrink-0 font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.42 0.02 90)" }}
          >
            LINK
          </div>
        </div>
      )}

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

      {/* All teams — vertical compact rows */}
      {teams.length > 0 && (
        <div>
          {sortedTeams.map((team, idx) => (
            <div
              key={String(team.id)}
              className="flex items-center gap-2 px-2 py-1.5"
              style={{
                background:
                  idx % 2 === 0
                    ? "oklch(0.11 0.025 255)"
                    : "oklch(0.1 0.022 255)",
                borderBottom: "1px solid oklch(0.18 0.025 255)",
              }}
            >
              {/* Team info — left side */}
              <div
                className="flex items-center gap-2 flex-shrink-0"
                style={{ width: "190px" }}
              >
                <TeamLogoCircle
                  team={team}
                  logoUrl={teamLogos[String(team.id)] ?? ""}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-broadcast truncate"
                    style={{
                      color: "oklch(0.9 0.02 90)",
                      fontSize: "11px",
                    }}
                  >
                    {team.name}
                  </div>
                  <div
                    className="truncate"
                    style={{
                      color: "oklch(0.48 0.02 90)",
                      fontSize: "9px",
                    }}
                  >
                    {team.ownerName}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                  <div
                    className="font-digital font-bold"
                    style={{
                      color: "oklch(0.7 0.15 140)",
                      fontSize: "12px",
                    }}
                  >
                    {Number(team.numberOfPlayers)}/7
                  </div>
                  {team.isTeamLocked && (
                    <Lock size={9} style={{ color: "oklch(0.7 0.15 140)" }} />
                  )}
                </div>
              </div>

              {/* Player slots — horizontally scrollable */}
              <div className="flex-1 overflow-x-auto" style={{ minWidth: 0 }}>
                <div
                  className="flex gap-1 py-0.5"
                  style={{ minWidth: "max-content" }}
                >
                  {/* Owner slot */}
                  <SmallOwnerSlot
                    team={team}
                    photoUrl={ownerPhotos[String(team.id)] ?? ""}
                  />
                  {/* Icon slot */}
                  <SmallIconSlot
                    team={team}
                    photoUrl={iconPhotos[String(team.id)] ?? ""}
                  />
                  {/* 7 auction slots */}
                  {(() => {
                    const soldToTeam = players.filter(
                      (p) =>
                        p.status === "sold" &&
                        String(p.soldTo) === String(team.id),
                    );
                    return Array.from({ length: 7 }, (_, i) => {
                      const player = soldToTeam[i] ?? null;
                      const key = player
                        ? `player-${String(player.id)}`
                        : `empty-${String(team.id)}-${i}`;
                      return player ? (
                        <SmallFilledSlot key={key} player={player} />
                      ) : (
                        <SmallEmptySlot key={key} index={i} />
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Copy link button */}
              <button
                type="button"
                onClick={() => handleCopyTeamLink(String(team.id))}
                className="flex-shrink-0 flex items-center justify-center p-1.5 hover:opacity-80 transition-opacity"
                style={{
                  background:
                    copiedTeamId === String(team.id)
                      ? "oklch(0.78 0.165 85 / 0.15)"
                      : "oklch(0.16 0.03 255)",
                  border:
                    copiedTeamId === String(team.id)
                      ? "1px solid oklch(0.78 0.165 85 / 0.4)"
                      : "1px solid oklch(0.25 0.03 255)",
                  color:
                    copiedTeamId === String(team.id)
                      ? "oklch(0.78 0.165 85)"
                      : "oklch(0.52 0.02 90)",
                }}
                title={`Copy shareable link for ${team.name}`}
              >
                <Copy size={11} />
              </button>
            </div>
          ))}
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
