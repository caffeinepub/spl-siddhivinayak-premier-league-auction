import { useParams } from "@tanstack/react-router";
import { Crown, Loader2, Star, Trophy, UserSquare2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import type { Player, Team } from "../backend.d";
import { useAuctionData } from "../hooks/useAuctionData";
import {
  getIconPhotos,
  getLeagueSettings,
  getOwnerPhotos,
  getTeamLogos,
} from "./LandingPage";

// ─── Category colors ──────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Batsman: "oklch(0.7 0.15 140)",
  Bowler: "oklch(0.65 0.18 25)",
  Allrounder: "oklch(0.78 0.165 85)",
};

// ─── Owner Slot ───────────────────────────────────────────────────────────────
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
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 flex items-center gap-1 font-broadcast tracking-widest"
        style={{
          background: "oklch(0.78 0.165 85 / 0.18)",
          border: "1px solid oklch(0.78 0.165 85 / 0.5)",
          color: "oklch(0.88 0.18 88)",
          fontSize: "8px",
        }}
      >
        <Crown size={7} />
        OWNER
      </div>
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
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Crown size={28} style={{ color: "oklch(0.78 0.165 85)" }} />
        )}
      </div>
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

// ─── Icon Slot ────────────────────────────────────────────────────────────────
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
      }}
    >
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 flex items-center gap-1 font-broadcast tracking-widest"
        style={{
          background: "oklch(0.65 0.14 75 / 0.18)",
          border: "1px solid oklch(0.65 0.14 75 / 0.45)",
          color: "oklch(0.82 0.15 82)",
          fontSize: "8px",
        }}
      >
        <Star size={7} />
        ICON
      </div>
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
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Star size={28} style={{ color: "oklch(0.65 0.14 75)" }} />
        )}
      </div>
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

// ─── Filled Auction Slot ──────────────────────────────────────────────────────
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
      className="relative flex flex-col items-center p-3 gap-2"
      style={{
        background: "oklch(0.12 0.025 255)",
        border: "1px solid oklch(0.25 0.03 255)",
      }}
    >
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 font-broadcast tracking-widest"
        style={{
          background: `${categoryColor}18`,
          border: `1px solid ${categoryColor}40`,
          color: categoryColor,
          fontSize: "7px",
        }}
      >
        {player.category.toUpperCase()}
      </div>
      <div
        className="w-16 h-20 overflow-hidden flex items-center justify-center flex-shrink-0"
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
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span
            className="font-broadcast"
            style={{ color: categoryColor, fontSize: "24px" }}
          >
            {player.name.charAt(0)}
          </span>
        )}
      </div>
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

// ─── Empty Auction Slot ───────────────────────────────────────────────────────
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
        className="font-broadcast tracking-widest"
        style={{ color: "oklch(0.3 0.02 255)", fontSize: "9px" }}
      >
        SLOT {index + 1}
      </div>
      <div
        className="font-digital"
        style={{ color: "oklch(0.28 0.02 255)", fontSize: "9px" }}
      >
        OPEN
      </div>
    </div>
  );
}

// ─── Team Page ────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const { teamId } = useParams({ from: "/team/$teamId" });
  const { teams, players, isLoading } = useAuctionData(10000);

  const teamLogos = getTeamLogos();
  const ownerPhotos = getOwnerPhotos();
  const iconPhotos = getIconPhotos();
  const leagueSettings = getLeagueSettings();

  const team = teams.find((t) => String(t.id) === teamId) ?? null;
  const logoUrl = team ? (teamLogos[teamId] ?? "") : "";
  const ownerPhotoUrl = team ? (ownerPhotos[teamId] ?? "") : "";
  const iconPhotoUrl = team ? (iconPhotos[teamId] ?? "") : "";

  // Set page title
  useEffect(() => {
    if (team) {
      document.title = `${team.name} — ${leagueSettings.shortName}`;
    } else {
      document.title = leagueSettings.shortName || "SPL";
    }
    return () => {
      document.title = leagueSettings.shortName || "SPL";
    };
  }, [team, leagueSettings.shortName]);

  const soldToTeam = team
    ? players.filter(
        (p) => p.status === "sold" && String(p.soldTo) === String(team.id),
      )
    : [];

  const auctionSlots: Array<{ slotKey: string; player: Player | null }> =
    Array.from({ length: 7 }, (_, i) => ({
      slotKey: soldToTeam[i]
        ? `player-${String(soldToTeam[i].id)}`
        : `empty-${i}`,
      player: soldToTeam[i] ?? null,
    }));

  // Loading state
  if (isLoading && teams.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center broadcast-overlay">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.15 0.06 255 / 0.5) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center">
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-4"
            style={{ color: "oklch(0.78 0.165 85 / 0.6)" }}
          />
          <div
            className="font-broadcast text-sm tracking-widest"
            style={{ color: "oklch(0.42 0.02 90)" }}
          >
            LOADING SQUAD…
          </div>
        </div>
      </div>
    );
  }

  // Team not found
  if (!team && teams.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy
            size={48}
            className="mx-auto mb-4 opacity-20"
            style={{ color: "oklch(0.78 0.165 85)" }}
          />
          <div
            className="font-broadcast text-xl tracking-widest"
            style={{ color: "oklch(0.42 0.02 90)" }}
          >
            TEAM NOT FOUND
          </div>
        </div>
      </div>
    );
  }

  const initials = team
    ? team.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-background broadcast-overlay">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, oklch(0.14 0.06 255 / 0.6) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.78 0.165 85 / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.78 0.165 85 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-5 py-3"
        style={{
          background: "oklch(0.1 0.025 255 / 0.97)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          {leagueSettings.logoUrl ? (
            <img
              src={leagueSettings.logoUrl}
              alt={leagueSettings.shortName}
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Trophy size={20} style={{ color: "oklch(0.78 0.165 85)" }} />
          )}
          <div>
            <div
              className="font-broadcast tracking-widest leading-none"
              style={{ color: "oklch(0.78 0.165 85)", fontSize: "1rem" }}
            >
              {leagueSettings.shortName}
            </div>
            <div
              className="tracking-wider leading-none mt-0.5"
              style={{
                color: "oklch(0.42 0.02 90)",
                fontSize: "0.65rem",
              }}
            >
              {leagueSettings.fullName.toUpperCase()}
            </div>
          </div>
        </div>

        <div
          className="text-xs font-broadcast tracking-widest px-3 py-1"
          style={{
            background: "oklch(0.78 0.165 85 / 0.08)",
            border: "1px solid oklch(0.78 0.165 85 / 0.25)",
            color: "oklch(0.62 0.12 85)",
          }}
        >
          SQUAD VIEW
        </div>
      </header>

      <main className="relative z-10 px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        {team && (
          <>
            {/* Team hero section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-5 mb-6 p-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.04 255) 0%, oklch(0.11 0.025 255) 100%)",
                border: "1px solid oklch(0.78 0.165 85 / 0.2)",
                boxShadow: "0 0 40px oklch(0.78 0.165 85 / 0.06)",
              }}
            >
              {/* Team logo */}
              <div
                className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  width: "80px",
                  height: "80px",
                  background: logoUrl ? "transparent" : "oklch(0.16 0.04 255)",
                  border: "2px solid oklch(0.78 0.165 85 / 0.6)",
                  boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.2)",
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
                      color: "oklch(0.78 0.165 85)",
                      fontSize: "26px",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>

              {/* Team info */}
              <div className="flex-1 min-w-0">
                <h1
                  className="font-broadcast tracking-wide leading-tight"
                  style={{
                    color: "oklch(0.97 0.01 90)",
                    fontSize: "clamp(18px, 3vw, 28px)",
                  }}
                >
                  {team.name}
                </h1>
                <div
                  className="mt-1"
                  style={{ color: "oklch(0.55 0.02 90)", fontSize: "13px" }}
                >
                  <span style={{ color: "oklch(0.78 0.165 85)" }}>
                    {team.ownerName}
                  </span>
                  <span className="mx-2 opacity-30">·</span>
                  Icon:{" "}
                  <span style={{ color: "oklch(0.72 0.14 80)" }}>
                    {team.teamIconPlayer}
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 mt-2"
                  style={{ fontSize: "12px" }}
                >
                  <span
                    className="font-digital"
                    style={{ color: "oklch(0.7 0.15 140)" }}
                  >
                    {Number(team.numberOfPlayers)}/7 players bought
                  </span>
                  {team.isTeamLocked && (
                    <span
                      className="px-2 py-0.5 font-broadcast tracking-widest"
                      style={{
                        background: "oklch(0.7 0.15 140 / 0.15)",
                        border: "1px solid oklch(0.7 0.15 140 / 0.4)",
                        color: "oklch(0.7 0.15 140)",
                        fontSize: "9px",
                      }}
                    >
                      SQUAD COMPLETE
                    </span>
                  )}
                </div>
              </div>

              {/* Purse remaining — prominent */}
              <div
                className="flex-shrink-0 text-right p-4"
                style={{
                  background: "oklch(0.09 0.025 255)",
                  border: "1px solid oklch(0.78 0.165 85 / 0.2)",
                }}
              >
                <div
                  className="font-digital font-bold leading-none"
                  style={{
                    color: "oklch(0.82 0.17 87)",
                    fontSize: "clamp(22px, 3.5vw, 36px)",
                  }}
                >
                  {Number(team.purseAmountLeft).toLocaleString()}
                </div>
                <div
                  className="font-broadcast tracking-widest mt-1"
                  style={{
                    color: "oklch(0.48 0.08 80)",
                    fontSize: "10px",
                  }}
                >
                  PURSE REMAINING
                </div>
                <div
                  className="font-digital mt-0.5"
                  style={{
                    color: "oklch(0.35 0.02 90)",
                    fontSize: "10px",
                  }}
                >
                  of {Number(team.purseAmountTotal).toLocaleString()}
                </div>
              </div>
            </motion.div>

            {/* 9-slot grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-4"
              style={{
                background: "oklch(0.12 0.025 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-4"
                style={{
                  borderBottom: "1px solid oklch(0.18 0.025 255)",
                  paddingBottom: "12px",
                }}
              >
                <div
                  className="w-0.5 h-4"
                  style={{ background: "oklch(0.78 0.165 85)" }}
                />
                <span
                  className="font-broadcast text-xs tracking-widest"
                  style={{ color: "oklch(0.78 0.165 85)" }}
                >
                  FULL SQUAD
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {/* Slot 1: Owner */}
                <OwnerSlot team={team} photoUrl={ownerPhotoUrl} />
                {/* Slot 2: Icon */}
                <IconSlot team={team} photoUrl={iconPhotoUrl} />
                {/* Slots 3–9: 7 auction slots */}
                {auctionSlots.map(({ slotKey, player }, idx) =>
                  player ? (
                    <FilledAuctionSlot
                      key={slotKey}
                      player={player}
                      index={idx}
                    />
                  ) : (
                    <EmptyAuctionSlot key={slotKey} index={idx} />
                  ),
                )}
              </div>
            </motion.div>

            {/* Auto-refresh notice */}
            <div
              className="text-center mt-4 text-xs"
              style={{ color: "oklch(0.32 0.02 90)" }}
            >
              Auto-refreshes every 10 seconds · Last updated{" "}
              {new Date().toLocaleTimeString()}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 text-center text-xs py-6 mt-4"
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
