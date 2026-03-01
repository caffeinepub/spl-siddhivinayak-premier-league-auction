import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Player, Team } from "../backend.d";
import { useAuctionData } from "../hooks/useAuctionData";
import {
  DEFAULT_LIVE_LAYOUT,
  type LiveLayoutConfig,
  getLeagueSettings,
  getLiveLayout,
  getTeamLogos,
} from "./LandingPage";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: bigint | number) {
  return Number(n).toLocaleString();
}

function displayCategory(cat: string) {
  const c = cat.toLowerCase();
  if (c === "batsman") return "BATSMAN";
  if (c === "bowler") return "BOWLER";
  if (c === "allrounder") return "ALLROUNDER";
  return cat.toUpperCase();
}

function getCategoryColor(cat: string) {
  const c = cat.toLowerCase();
  if (c === "batsman") return "oklch(0.7 0.15 140)";
  if (c === "bowler") return "oklch(0.65 0.18 25)";
  if (c === "allrounder") return "oklch(0.78 0.165 85)";
  return "oklch(0.55 0.02 90)";
}

function teamInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 3)
    .join("")
    .toUpperCase();
}

// ─── SOLD Overlay ─────────────────────────────────────────────────────────────
interface SoldOverlayProps {
  visible: boolean;
  player: Player | null;
  team: Team | null;
  teamLogoUrl: string;
}

function SoldOverlay({ visible, player, team, teamLogoUrl }: SoldOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sold-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Dimmed background */}
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0.05 0.02 265 / 0.85)" }}
          />

          {/* Main banner */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative z-10 flex flex-col items-center gap-6 px-16 py-12"
            style={{
              background: "oklch(0.1 0.04 255 / 0.95)",
              border: "3px solid oklch(0.78 0.165 85)",
              boxShadow:
                "0 0 80px oklch(0.78 0.165 85 / 0.6), 0 0 160px oklch(0.78 0.165 85 / 0.25)",
            }}
          >
            {/* SOLD! text */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.8,
              }}
              className="font-broadcast text-8xl font-black tracking-widest"
              style={{
                color: "oklch(0.78 0.165 85)",
                textShadow:
                  "0 0 40px oklch(0.78 0.165 85 / 0.8), 0 0 80px oklch(0.78 0.165 85 / 0.4)",
              }}
            >
              SOLD!
            </motion.div>

            {/* Player name */}
            {player && (
              <div
                className="font-broadcast text-4xl tracking-wider"
                style={{ color: "oklch(0.96 0.015 90)" }}
              >
                {player.name.toUpperCase()}
              </div>
            )}

            {/* Team info */}
            {team && (
              <div className="flex items-center gap-4">
                {teamLogoUrl ? (
                  <img
                    src={teamLogoUrl}
                    alt={team.name}
                    className="rounded-full"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      border: "2px solid oklch(0.78 0.165 85 / 0.6)",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center font-broadcast font-black text-sm"
                    style={{
                      width: 64,
                      height: 64,
                      background: "oklch(0.18 0.06 255)",
                      border: "2px solid oklch(0.78 0.165 85 / 0.6)",
                      color: "oklch(0.78 0.165 85)",
                    }}
                  >
                    {teamInitials(team.name)}
                  </div>
                )}
                <div>
                  <div
                    className="font-broadcast text-2xl tracking-wider"
                    style={{ color: "oklch(0.88 0.12 82)" }}
                  >
                    {team.name.toUpperCase()}
                  </div>
                  {player?.soldPrice != null && (
                    <div
                      className="font-digital text-xl"
                      style={{ color: "oklch(0.78 0.165 85)" }}
                    >
                      {fmt(player.soldPrice)} PTS
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Team table row ───────────────────────────────────────────────────────────
function TeamTableRow({
  team,
  isLeading,
  logoUrl,
}: {
  team: Team;
  isLeading: boolean;
  logoUrl: string;
}) {
  const slots = 7 - Number(team.numberOfPlayers);
  const pct =
    Number(team.purseAmountTotal) > 0
      ? (Number(team.purseAmountLeft) / Number(team.purseAmountTotal)) * 100
      : 0;

  return (
    <motion.div
      layout
      className="flex items-center gap-2 px-2 py-1.5 rounded transition-all"
      style={{
        background: isLeading
          ? "oklch(0.78 0.165 85 / 0.12)"
          : "oklch(0.11 0.025 255 / 0.6)",
        border: isLeading
          ? "1px solid oklch(0.78 0.165 85 / 0.5)"
          : "1px solid oklch(0.22 0.04 255 / 0.4)",
      }}
    >
      {/* Logo */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={team.name}
          className="rounded-full flex-shrink-0"
          style={{ width: 22, height: 22, objectFit: "cover" }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-broadcast text-xs flex-shrink-0"
          style={{
            width: 22,
            height: 22,
            background: "oklch(0.18 0.06 255)",
            color: "oklch(0.78 0.165 85)",
            fontSize: 8,
            fontWeight: 900,
          }}
        >
          {teamInitials(team.name).slice(0, 2)}
        </div>
      )}

      {/* Name */}
      <span
        className="font-broadcast tracking-wide truncate flex-1 text-left"
        style={{
          fontSize: 11,
          color: isLeading ? "oklch(0.88 0.16 82)" : "oklch(0.7 0.02 90)",
        }}
      >
        {team.name}
      </span>

      {/* Purse bar + value */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 40, height: 4, background: "oklch(0.2 0.02 255)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                pct > 40 ? "oklch(0.78 0.165 85)" : "oklch(0.65 0.18 25)",
            }}
          />
        </div>
        <span
          className="font-digital text-xs"
          style={{
            color: isLeading ? "oklch(0.78 0.165 85)" : "oklch(0.55 0.02 90)",
          }}
        >
          {fmt(team.purseAmountLeft)}
        </span>
        <span
          className="font-broadcast text-xs"
          style={{ color: "oklch(0.35 0.02 90)", fontSize: 9 }}
        >
          {slots}SL
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main LivePage ────────────────────────────────────────────────────────────
export default function LivePage() {
  const { auctionState, teams, players, isLoading } = useAuctionData(3000);
  const [layout, setLayout] = useState<LiveLayoutConfig>(() => getLiveLayout());
  const league = getLeagueSettings();
  const teamLogos = getTeamLogos();

  // Track previous sold state to detect new sales
  const prevSoldPlayerIdRef = useRef<bigint | null>(null);
  const [soldOverlayVisible, setSoldOverlayVisible] = useState(false);
  const [lastSoldPlayer, setLastSoldPlayer] = useState<Player | null>(null);
  const [lastSoldTeam, setLastSoldTeam] = useState<Team | null>(null);
  const soldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh layout from localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLayout(getLiveLayout());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlayer = auctionState?.currentPlayerId
    ? (players.find((p) => p.id === auctionState.currentPlayerId) ?? null)
    : null;

  const leadingTeam = auctionState?.leadingTeamId
    ? (teams.find((t) => t.id === auctionState.leadingTeamId) ?? null)
    : null;

  // Detect when player is sold (moves from live → sold status)
  useEffect(() => {
    if (!auctionState || !players.length) return;

    // Find the most recently sold player
    const soldPlayer = players.find(
      (p) => p.status === "sold" && p.id !== prevSoldPlayerIdRef.current,
    );

    if (soldPlayer && soldPlayer.id !== prevSoldPlayerIdRef.current) {
      // Check if this happened because auction just ended
      if (!auctionState.isActive && prevSoldPlayerIdRef.current !== null) {
        const team = soldPlayer.soldTo
          ? (teams.find((t) => t.id === soldPlayer.soldTo) ?? null)
          : null;
        setLastSoldPlayer(soldPlayer);
        setLastSoldTeam(team);
        setSoldOverlayVisible(true);

        if (soldTimerRef.current) clearTimeout(soldTimerRef.current);
        soldTimerRef.current = setTimeout(() => {
          setSoldOverlayVisible(false);
        }, 4000);
      }
      prevSoldPlayerIdRef.current = soldPlayer.id;
    }
  }, [auctionState, players, teams]);

  // Chart data
  const chartData = teams
    .slice()
    .sort((a, b) => Number(b.purseAmountLeft) - Number(a.purseAmountLeft))
    .map((t) => ({
      name: teamInitials(t.name),
      purse: Number(t.purseAmountLeft),
      isLeading: t.id === auctionState?.leadingTeamId,
    }));

  const sortedTeams = [...teams].sort(
    (a, b) => Number(b.purseAmountLeft) - Number(a.purseAmountLeft),
  );

  const catColor = currentPlayer
    ? getCategoryColor(currentPlayer.category)
    : "oklch(0.55 0.02 90)";
  const rp = layout.rightPanelWidth;

  if (isLoading && !auctionState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-10 h-10 rounded-full border-2 border-t-transparent"
            style={{ borderColor: "oklch(0.78 0.165 85)" }}
          />
          <p
            className="font-broadcast tracking-widest text-sm"
            style={{ color: "oklch(0.55 0.02 90)" }}
          >
            CONNECTING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background overflow-hidden relative broadcast-overlay"
      style={{ fontFamily: "inherit" }}
    >
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, oklch(0.15 0.06 255 / 0.7) 0%, transparent 70%)",
        }}
      />
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.78 0.165 85) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.165 85) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* SOLD Overlay */}
      <SoldOverlay
        visible={soldOverlayVisible}
        player={lastSoldPlayer}
        team={lastSoldTeam}
        teamLogoUrl={
          lastSoldTeam ? (teamLogos[String(lastSoldTeam.id)] ?? "") : ""
        }
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)" }}
      >
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          {league.logoUrl ? (
            <img
              src={league.logoUrl}
              alt={league.shortName}
              style={{ height: layout.headerLogoSize, objectFit: "contain" }}
            />
          ) : (
            <div
              className="font-broadcast font-black"
              style={{
                fontSize: layout.headerLogoSize * 0.8,
                color: "oklch(0.78 0.165 85)",
                textShadow: "0 0 20px oklch(0.78 0.165 85 / 0.5)",
              }}
            >
              {league.shortName || "SPL"}
            </div>
          )}
          <div>
            <div
              className="font-broadcast tracking-widest text-xs"
              style={{ color: "oklch(0.78 0.165 85)" }}
            >
              {(league.shortName || "SPL").toUpperCase()}
            </div>
            <div
              className="font-broadcast tracking-wide"
              style={{ fontSize: 10, color: "oklch(0.45 0.02 90)" }}
            >
              {(
                league.fullName || "SIDDHIVINAYAK PREMIER LEAGUE 2026"
              ).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.65 0.22 25)" }}
          />
          <span
            className="font-broadcast tracking-widest text-xs"
            style={{ color: "oklch(0.65 0.22 25)" }}
          >
            LIVE
          </span>
          <span
            className="font-broadcast text-xs"
            style={{ color: "oklch(0.35 0.02 90)" }}
          >
            · PLAYER AUCTION 2026
          </span>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-[calc(100vh-57px)]">
        {/* Left: Player display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <AnimatePresence mode="wait">
            {currentPlayer ? (
              <motion.div
                key={String(currentPlayer.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-5"
              >
                {/* Player photo */}
                <div className="relative">
                  {/* Gold corner brackets */}
                  {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((cls) => (
                    <div
                      key={cls}
                      className={`absolute w-5 h-5 ${cls}`}
                      style={{ borderColor: "oklch(0.78 0.165 85)" }}
                    />
                  ))}
                  <div
                    style={{
                      width: layout.playerImageWidth,
                      height: layout.playerImageHeight,
                      overflow: "hidden",
                      background: "oklch(0.14 0.04 255)",
                      position: "relative",
                    }}
                  >
                    {currentPlayer.imageUrl ? (
                      <img
                        src={currentPlayer.imageUrl}
                        alt={currentPlayer.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-broadcast text-6xl"
                        style={{ color: "oklch(0.25 0.04 255)" }}
                      >
                        {currentPlayer.name[0]?.toUpperCase()}
                      </div>
                    )}

                    {/* SOLD ribbon - bottom-left diagonal */}
                    <AnimatePresence>
                      {soldOverlayVisible &&
                        lastSoldPlayer?.id === currentPlayer.id && (
                          <motion.div
                            key="sold-ribbon"
                            initial={{ opacity: 0, x: -40, y: 40 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-0 left-0"
                            style={{
                              width: "180%",
                              transform:
                                "rotate(-35deg) translateX(-40%) translateY(60%)",
                              transformOrigin: "bottom left",
                              background:
                                "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.2 25))",
                              padding: "6px 0",
                              textAlign: "center",
                            }}
                          >
                            <span
                              className="font-broadcast font-black tracking-widest"
                              style={{
                                fontSize: 22,
                                color: "oklch(0.08 0.02 265)",
                              }}
                            >
                              SOLD!
                            </span>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  {/* Category badge */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 font-broadcast tracking-widest"
                    style={{
                      background: `${catColor}22`,
                      border: `1px solid ${catColor}66`,
                      color: catColor,
                      fontSize: Math.round(
                        11 * (layout.categoryBadgeSize / 100),
                      ),
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayCategory(currentPlayer.category)}
                  </div>
                </div>

                {/* Player name */}
                <div
                  className="font-broadcast tracking-wider text-center mt-4"
                  style={{
                    fontSize: Math.round(36 * (layout.playerNameSize / 100)),
                    color: "oklch(0.96 0.015 90)",
                    textShadow: "0 2px 20px oklch(0.09 0.025 255 / 0.8)",
                  }}
                >
                  {currentPlayer.name.toUpperCase()}
                </div>

                {/* Base price */}
                <div
                  className="flex items-center gap-2 px-4 py-1"
                  style={{
                    background: "oklch(0.13 0.03 255 / 0.7)",
                    border: "1px solid oklch(0.25 0.06 255 / 0.6)",
                  }}
                >
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 11, color: "oklch(0.45 0.02 90)" }}
                  >
                    BASE PRICE
                  </span>
                  <span
                    className="font-digital"
                    style={{ fontSize: 14, color: "oklch(0.78 0.165 85)" }}
                  >
                    {fmt(currentPlayer.basePrice)} PTS
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div
                  className="font-broadcast text-2xl tracking-widest mb-2"
                  style={{ color: "oklch(0.3 0.02 90)" }}
                >
                  AWAITING
                </div>
                <div
                  className="font-broadcast text-xl tracking-widest"
                  style={{ color: "oklch(0.22 0.03 255)" }}
                >
                  NEXT PLAYER
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bid counter area */}
          {auctionState && (
            <div className="flex flex-col items-center gap-3">
              {/* Current bid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={String(auctionState.currentBid)}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="font-digital font-bold"
                  style={{
                    fontSize: Math.round(80 * (layout.bidCounterSize / 100)),
                    color: auctionState.isActive
                      ? "oklch(0.78 0.165 85)"
                      : "oklch(0.35 0.04 90)",
                    textShadow: auctionState.isActive
                      ? "0 0 40px oklch(0.78 0.165 85 / 0.6), 0 0 80px oklch(0.78 0.165 85 / 0.25)"
                      : "none",
                    lineHeight: 1,
                  }}
                >
                  {fmt(auctionState.currentBid)}
                </motion.div>
              </AnimatePresence>
              <div
                className="font-broadcast tracking-widest"
                style={{ fontSize: 11, color: "oklch(0.4 0.02 90)" }}
              >
                CURRENT BID (PTS)
              </div>

              {/* Leading team */}
              <AnimatePresence mode="wait">
                {leadingTeam ? (
                  <motion.div
                    key={String(leadingTeam.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 px-5 py-2"
                    style={{
                      background: "oklch(0.78 0.165 85 / 0.1)",
                      border: "1px solid oklch(0.78 0.165 85 / 0.4)",
                    }}
                  >
                    {teamLogos[String(leadingTeam.id)] ? (
                      <img
                        src={teamLogos[String(leadingTeam.id)]}
                        alt={leadingTeam.name}
                        className="rounded-full"
                        style={{ width: 32, height: 32, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center font-broadcast text-xs font-black"
                        style={{
                          width: 32,
                          height: 32,
                          background: "oklch(0.18 0.06 255)",
                          color: "oklch(0.78 0.165 85)",
                          fontSize: 10,
                        }}
                      >
                        {teamInitials(leadingTeam.name).slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div
                        className="font-broadcast tracking-widest"
                        style={{
                          fontSize: Math.round(
                            13 * (layout.leadingTeamSize / 100),
                          ),
                          color: "oklch(0.88 0.14 82)",
                        }}
                      >
                        {leadingTeam.name.toUpperCase()}
                      </div>
                      <div
                        className="font-broadcast tracking-widest"
                        style={{ fontSize: 9, color: "oklch(0.55 0.1 82)" }}
                      >
                        LEADING BID
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-leader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 11, color: "oklch(0.32 0.02 90)" }}
                  >
                    NO BIDS YET
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right panel: teams + chart */}
        <div
          className="flex flex-col gap-3 py-4 px-3 overflow-hidden"
          style={{
            width: rp,
            minWidth: rp,
            borderLeft: "1px solid oklch(0.78 0.165 85 / 0.12)",
            background: "oklch(0.08 0.025 255 / 0.5)",
          }}
        >
          <div
            className="font-broadcast tracking-widest"
            style={{ fontSize: 10, color: "oklch(0.4 0.02 90)" }}
          >
            TEAM STANDINGS
          </div>

          {/* Team list */}
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {sortedTeams.map((team) => (
              <TeamTableRow
                key={String(team.id)}
                team={team}
                isLeading={team.id === auctionState?.leadingTeamId}
                logoUrl={teamLogos[String(team.id)] ?? ""}
              />
            ))}
          </div>

          {/* Chart */}
          <div>
            <div
              className="font-broadcast tracking-widest mb-1"
              style={{ fontSize: 9, color: "oklch(0.3 0.02 90)" }}
            >
              PURSE REMAINING
            </div>
            <ResponsiveContainer width="100%" height={layout.chartHeight}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 8,
                    fill: "oklch(0.4 0.02 90)",
                    fontFamily: "Geist Mono",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0.03 255)",
                    border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                    borderRadius: 0,
                    fontSize: 10,
                    fontFamily: "Geist Mono",
                  }}
                  formatter={(val: number) => [`${fmt(val)} pts`, "Purse"]}
                  labelStyle={{ color: "oklch(0.78 0.165 85)" }}
                  itemStyle={{ color: "oklch(0.75 0.02 90)" }}
                />
                <Bar dataKey="purse" radius={0} maxBarSize={20}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.isLeading
                          ? "oklch(0.78 0.165 85)"
                          : "oklch(0.28 0.06 255)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
