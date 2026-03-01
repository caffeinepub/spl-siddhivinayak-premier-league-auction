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
import type { TooltipProps } from "recharts";
import { useAuctionData } from "../hooks/useAuctionData";
import { getLeagueSettings, getLiveLayout, getTeamLogos } from "./LandingPage";

// ─── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Batsman: "oklch(0.7 0.15 140)",
  Bowler: "oklch(0.65 0.18 25)",
  Allrounder: "oklch(0.78 0.165 85)",
};

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const val = (payload[0] as { value: number }).value;
    return (
      <div
        className="px-3 py-2 text-xs"
        style={{
          background: "oklch(0.14 0.03 255)",
          border: "1px solid oklch(0.78 0.165 85 / 0.3)",
          color: "oklch(0.96 0.01 90)",
        }}
      >
        <p className="font-broadcast tracking-wider mb-1">{label}</p>
        <p style={{ color: "oklch(0.78 0.165 85)" }}>
          {Number(val).toLocaleString()} pts
        </p>
      </div>
    );
  }
  return null;
}

// SoldOverlay component removed — replaced with inline photo banner + team display

// ─── Live Page ─────────────────────────────────────────────────────────────────
export default function LivePage() {
  const { auctionState, teams, players } = useAuctionData(3000);
  const leagueSettings = getLeagueSettings();
  const layout = getLiveLayout();
  const teamLogos = getTeamLogos();

  const shortName = leagueSettings.shortName || "SPL";
  const fullName =
    leagueSettings.fullName || "Siddhivinayak Premier League 2026";
  const logoUrl = leagueSettings.logoUrl;
  const logoSizePx = layout.headerLogoSize;

  const prevBidRef = useRef(0);
  const prevActiveRef = useRef(false);
  const [bidBumping, setBidBumping] = useState(false);
  const [soldOverlay, setSoldOverlay] = useState(false);
  // State for the 2-second team display below the photo after SOLD
  const [soldTeamDisplay, setSoldTeamDisplay] = useState<{
    teamId: string;
    teamName: string;
    soldPrice: number;
  } | null>(null);

  const currentBid = Number(auctionState?.currentBid ?? 0);

  const currentPlayer = auctionState?.currentPlayerId
    ? (players.find((p) => p.id === auctionState.currentPlayerId) ?? null)
    : null;

  const leadingTeam = auctionState?.leadingTeamId
    ? (teams.find((t) => t.id === auctionState.leadingTeamId) ?? null)
    : null;

  // Detect bid change → bump animation
  useEffect(() => {
    if (
      currentBid > 0 &&
      currentBid !== prevBidRef.current &&
      prevBidRef.current !== 0
    ) {
      setBidBumping(true);
      const t = setTimeout(() => setBidBumping(false), 400);
      prevBidRef.current = currentBid;
      return () => clearTimeout(t);
    }
    prevBidRef.current = currentBid;
  }, [currentBid]);

  // Detect sold: auction goes from active → inactive
  useEffect(() => {
    const wasActive = prevActiveRef.current;
    const isActive = !!auctionState?.isActive;
    prevActiveRef.current = isActive;

    if (wasActive && !isActive && currentPlayer && leadingTeam) {
      const soldP = players.find(
        (p) => currentPlayer && p.id === currentPlayer.id,
      );
      if (soldP) {
        const finalPrice =
          soldP.soldPrice !== undefined ? Number(soldP.soldPrice) : currentBid;
        setSoldOverlay(true);
        setSoldTeamDisplay({
          teamId: String(leadingTeam.id),
          teamName: leadingTeam.name,
          soldPrice: finalPrice,
        });
        const t1 = setTimeout(() => setSoldOverlay(false), 2000);
        const t2 = setTimeout(() => setSoldTeamDisplay(null), 2000);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [auctionState?.isActive, currentPlayer, leadingTeam, players, currentBid]);

  const sortedTeams = [...teams].sort(
    (a, b) => Number(b.purseAmountLeft) - Number(a.purseAmountLeft),
  );

  const chartData = sortedTeams.map((team) => ({
    name: team.name.length > 10 ? `${team.name.substring(0, 10)}…` : team.name,
    purse: Number(team.purseAmountLeft),
    id: Number(team.id),
  }));

  const leadingTeamLogoUrl = leadingTeam
    ? (teamLogos[String(leadingTeam.id)] ?? "")
    : "";

  return (
    <div className="min-h-screen bg-background overflow-hidden broadcast-overlay">
      {/* Background atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.14 0.06 255 / 0.7) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
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
        className="relative z-10 flex items-center justify-between px-5 py-2.5"
        style={{
          background: "oklch(0.1 0.025 255 / 0.96)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shortName}
              style={{
                width: `${logoSizePx}px`,
                height: `${logoSizePx}px`,
                objectFit: "contain",
                flexShrink: 0,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="flex-shrink-0 flex items-center justify-center font-broadcast"
              style={{
                width: `${logoSizePx}px`,
                height: `${logoSizePx}px`,
                background: "oklch(0.78 0.165 85 / 0.12)",
                border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                color: "oklch(0.78 0.165 85)",
                fontSize: `${logoSizePx * 0.4}px`,
              }}
            >
              {shortName.slice(0, 3)}
            </div>
          )}
          <div>
            <div
              className="font-broadcast tracking-widest leading-none"
              style={{
                color: "oklch(0.78 0.165 85)",
                fontSize: `${1.1 * (leagueSettings.nameSize / 100)}rem`,
              }}
            >
              {shortName}
            </div>
            <div
              className="tracking-wider leading-none mt-0.5"
              style={{
                color: "oklch(0.42 0.02 90)",
                fontSize: `${0.68 * (leagueSettings.nameSize / 100)}rem`,
              }}
            >
              {fullName.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="text-xs font-broadcast tracking-widest px-3 py-1"
            style={{
              background: "oklch(0.78 0.165 85 / 0.1)",
              border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              color: "oklch(0.78 0.165 85)",
            }}
          >
            PLAYER AUCTION 2026
          </div>
          {auctionState?.isActive && (
            <div
              className="flex items-center gap-2 text-xs font-broadcast tracking-widest px-3 py-1"
              style={{
                background: "oklch(0.62 0.22 25 / 0.15)",
                border: "1px solid oklch(0.62 0.22 25 / 0.4)",
                color: "oklch(0.75 0.15 25)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.75 0.15 25)" }}
              />
              LIVE
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 52px)" }}
      >
        {/* ─── CENTER PLAYER SECTION ────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 min-w-0">
          {currentPlayer ? (
            <div className="flex flex-col items-center">
              {/* Player photo */}
              <motion.div
                key={String(currentPlayer.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative mb-3"
                style={{ overflow: "visible" }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    width: `${layout.playerImageWidth}px`,
                    height: `${layout.playerImageHeight}px`,
                    border: "2px solid oklch(0.78 0.165 85 / 0.6)",
                    boxShadow: [
                      "0 0 0 1px oklch(0.78 0.165 85 / 0.15)",
                      "0 0 40px oklch(0.78 0.165 85 / 0.25)",
                      "0 0 80px oklch(0.78 0.165 85 / 0.1)",
                      "0 20px 60px oklch(0 0 0 / 0.6)",
                    ].join(", "),
                    position: "relative",
                  }}
                >
                  {currentPlayer.imageUrl ? (
                    <img
                      src={currentPlayer.imageUrl}
                      alt={currentPlayer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-broadcast"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.16 0.05 255), oklch(0.12 0.03 255))",
                        color: "oklch(0.78 0.165 85)",
                        fontSize: `${layout.playerImageWidth * 0.3}px`,
                      }}
                    >
                      {currentPlayer.name.charAt(0)}
                    </div>
                  )}

                  {/* SOLD diagonal banner — on photo, bottom-left, bleeds outside */}
                  <AnimatePresence>
                    {soldOverlay && (
                      <motion.div
                        key="sold-banner"
                        initial={{ opacity: 0, x: -40, y: 40 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -20, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          bottom: "-18px",
                          left: "-22px",
                          width: "180%",
                          pointerEvents: "none",
                          zIndex: 10,
                          transformOrigin: "bottom left",
                          transform: "rotate(-28deg)",
                        }}
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(90deg, oklch(0.55 0.22 25), oklch(0.72 0.22 35) 40%, oklch(0.78 0.165 85))",
                            padding: "10px 40px 10px 24px",
                            boxShadow:
                              "0 4px 24px oklch(0 0 0 / 0.5), 0 0 30px oklch(0.72 0.22 35 / 0.4)",
                          }}
                        >
                          <span
                            className="font-broadcast tracking-widest"
                            style={{
                              fontSize: "clamp(22px, 3.5vw, 38px)",
                              color: "oklch(0.98 0.01 90)",
                              textShadow:
                                "0 2px 8px oklch(0 0 0 / 0.5), 0 0 20px oklch(0.78 0.165 85 / 0.6)",
                              display: "block",
                              lineHeight: 1,
                            }}
                          >
                            SOLD!
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Gold corner brackets */}
                {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                  <div
                    key={corner}
                    className="absolute w-5 h-5"
                    style={{
                      top: corner.startsWith("t") ? -2 : "auto",
                      bottom: corner.startsWith("b") ? -2 : "auto",
                      left: corner.endsWith("l") ? -2 : "auto",
                      right: corner.endsWith("r") ? -2 : "auto",
                      borderTop: corner.startsWith("t")
                        ? "3px solid oklch(0.88 0.18 88)"
                        : undefined,
                      borderBottom: corner.startsWith("b")
                        ? "3px solid oklch(0.88 0.18 88)"
                        : undefined,
                      borderLeft: corner.endsWith("l")
                        ? "3px solid oklch(0.88 0.18 88)"
                        : undefined,
                      borderRight: corner.endsWith("r")
                        ? "3px solid oklch(0.88 0.18 88)"
                        : undefined,
                    }}
                  />
                ))}
              </motion.div>

              {/* Player name */}
              <motion.h1
                key={`name-${String(currentPlayer.id)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-broadcast text-center mb-1.5"
                style={{
                  fontSize: `clamp(${Math.round((22 * layout.playerNameSize) / 100)}px, ${(3.5 * layout.playerNameSize) / 100}vw, ${Math.round((44 * layout.playerNameSize) / 100)}px)`,
                  color: "oklch(0.97 0.01 90)",
                  letterSpacing: "-0.01em",
                }}
              >
                {currentPlayer.name}
              </motion.h1>

              {/* Category + base price */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-broadcast tracking-widest"
                  style={{
                    fontSize: `${(0.75 * layout.categoryBadgeSize) / 100}rem`,
                    padding: `${(3 * layout.categoryBadgeSize) / 100}px ${(12 * layout.categoryBadgeSize) / 100}px`,
                    background: `${CATEGORY_COLORS[currentPlayer.category] ?? "oklch(0.55 0.02 90)"}22`,
                    border: `1px solid ${CATEGORY_COLORS[currentPlayer.category] ?? "oklch(0.55 0.02 90)"}55`,
                    color:
                      CATEGORY_COLORS[currentPlayer.category] ??
                      "oklch(0.55 0.02 90)",
                  }}
                >
                  {currentPlayer.category.toUpperCase()}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.42 0.02 90)" }}
                >
                  BASE{" "}
                  <span
                    className="font-digital"
                    style={{ color: "oklch(0.62 0.12 82)" }}
                  >
                    {Number(currentPlayer.basePrice).toLocaleString()}
                  </span>
                </span>
              </div>

              {/* Bid stage */}
              <motion.div
                key={`bid-${String(currentPlayer.id)}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full max-w-xl"
                style={{
                  background: "oklch(0.07 0.025 255)",
                  border: "1px solid oklch(0.78 0.165 85 / 0.2)",
                  boxShadow: [
                    "0 0 0 1px oklch(0.78 0.165 85 / 0.06)",
                    "inset 0 1px 0 oklch(0.78 0.165 85 / 0.08)",
                    "0 20px 60px oklch(0 0 0 / 0.5)",
                  ].join(", "),
                }}
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-1">
                  <span
                    className="text-xs font-broadcast tracking-widest"
                    style={{ color: "oklch(0.35 0.02 90)" }}
                  >
                    CURRENT BID
                  </span>
                </div>
                <div
                  className="mx-5 mb-3"
                  style={{
                    height: "1px",
                    background:
                      "linear-gradient(90deg, oklch(0.78 0.165 85 / 0.5), oklch(0.78 0.165 85 / 0.15) 70%, transparent)",
                  }}
                />
                <div className="px-5 pb-3 flex items-end gap-3">
                  <div
                    className={`font-digital leading-none pulse-gold ${bidBumping ? "bid-bump" : ""}`}
                    style={{
                      fontSize: `clamp(${Math.round((64 * layout.bidCounterSize) / 100)}px, ${(10 * layout.bidCounterSize) / 100}vw, ${Math.round((120 * layout.bidCounterSize) / 100)}px)`,
                      fontWeight: 800,
                      color: "oklch(0.82 0.17 87)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {currentBid.toLocaleString()}
                  </div>
                  <div
                    className="font-broadcast pb-2"
                    style={{
                      fontSize: `clamp(${Math.round((14 * layout.bidCounterSize) / 100)}px, ${(2 * layout.bidCounterSize) / 100}vw, ${Math.round((22 * layout.bidCounterSize) / 100)}px)`,
                      color: "oklch(0.48 0.08 80)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    PTS
                  </div>
                </div>

                {/* Leading team */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{
                    borderTop: "1px solid oklch(0.78 0.165 85 / 0.12)",
                    background: "oklch(0.78 0.165 85 / 0.05)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {leadingTeam ? (
                      <motion.div
                        key={String(leadingTeam.id)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 w-full"
                      >
                        {leadingTeamLogoUrl ? (
                          <img
                            src={leadingTeamLogoUrl}
                            alt={leadingTeam.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid oklch(0.78 0.165 85 / 0.4)",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span
                            className="w-2 h-2 flex-shrink-0"
                            style={{ background: "oklch(0.78 0.165 85)" }}
                          />
                        )}
                        <span
                          className="text-xs font-broadcast tracking-widest"
                          style={{ color: "oklch(0.42 0.02 90)" }}
                        >
                          LEADING
                        </span>
                        <span
                          className="font-broadcast tracking-wide"
                          style={{
                            fontSize: `clamp(${Math.round((14 * layout.leadingTeamSize) / 100)}px, ${(2 * layout.leadingTeamSize) / 100}vw, ${Math.round((22 * layout.leadingTeamSize) / 100)}px)`,
                            color: "oklch(0.85 0.165 85)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {leadingTeam.name.toUpperCase()}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="no-bid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-broadcast tracking-widest"
                        style={{ color: "oklch(0.28 0.02 90)" }}
                      >
                        AWAITING FIRST BID
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center">
              <div
                className="text-7xl mb-5 opacity-20"
                style={{ filter: "grayscale(1)" }}
              >
                🏏
              </div>
              <div
                className="font-broadcast text-xl tracking-widest"
                style={{ color: "oklch(0.32 0.02 90)" }}
              >
                AUCTION STARTING SOON
              </div>
              <div
                className="text-sm mt-2"
                style={{ color: "oklch(0.28 0.02 90)" }}
              >
                Waiting for admin to select a player
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL ──────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            width: `${layout.rightPanelWidth}px`,
            minWidth: `${Math.min(layout.rightPanelWidth, 280)}px`,
            background: "oklch(0.09 0.025 255)",
            borderLeft: "1px solid oklch(0.78 0.165 85 / 0.18)",
          }}
        >
          {/* Team Purse Table */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div
              className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
              style={{ borderBottom: "1px solid oklch(0.16 0.03 255)" }}
            >
              <div
                className="w-0.5 h-4 flex-shrink-0"
                style={{ background: "oklch(0.78 0.165 85)" }}
              />
              <span
                className="font-broadcast text-xs tracking-widest"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                TEAM PURSE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table
                className="w-full"
                style={{
                  fontSize: `${(0.75 * layout.teamTableFontSize) / 100}rem`,
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid oklch(0.16 0.03 255)" }}
                  >
                    <th
                      className="px-3 py-2 text-left font-broadcast tracking-widest"
                      style={{ color: "oklch(0.35 0.02 90)" }}
                    >
                      TEAM
                    </th>
                    <th
                      className="px-2 py-2 text-right font-broadcast tracking-widest"
                      style={{ color: "oklch(0.35 0.02 90)" }}
                    >
                      PURSE
                    </th>
                    <th
                      className="px-2 py-2 text-right font-broadcast tracking-widest"
                      style={{ color: "oklch(0.35 0.02 90)" }}
                    >
                      SL
                    </th>
                    <th
                      className="px-2 py-2 text-right font-broadcast tracking-widest"
                      style={{ color: "oklch(0.35 0.02 90)" }}
                    >
                      PL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team) => {
                    const isLeading =
                      auctionState?.leadingTeamId !== undefined &&
                      team.id === auctionState.leadingTeamId;
                    const slots = 7 - Number(team.numberOfPlayers);
                    const logoUrl2 = teamLogos[String(team.id)] ?? "";
                    return (
                      <tr
                        key={String(team.id)}
                        style={{
                          borderBottom: "1px solid oklch(0.12 0.02 255)",
                          background: isLeading
                            ? "oklch(0.78 0.165 85 / 0.07)"
                            : "transparent",
                        }}
                      >
                        <td
                          className="py-2 font-medium"
                          style={{
                            paddingLeft: isLeading ? "0" : "12px",
                            color: isLeading
                              ? "oklch(0.88 0.14 87)"
                              : team.isTeamLocked
                                ? "oklch(0.3 0.02 90)"
                                : "oklch(0.75 0.02 90)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {isLeading && (
                              <div
                                className="w-1 self-stretch flex-shrink-0"
                                style={{ background: "oklch(0.78 0.165 85)" }}
                              />
                            )}
                            {logoUrl2 ? (
                              <img
                                src={logoUrl2}
                                alt={team.name}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : null}
                            <span className="truncate max-w-[90px]">
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-2 py-2 text-right font-digital"
                          style={{
                            color: isLeading
                              ? "oklch(0.82 0.16 86)"
                              : "oklch(0.62 0.02 90)",
                          }}
                        >
                          {Number(team.purseAmountLeft).toLocaleString()}
                        </td>
                        <td
                          className="px-2 py-2 text-right font-digital"
                          style={{
                            color:
                              slots === 0
                                ? "oklch(0.3 0.02 90)"
                                : "oklch(0.65 0.18 25)",
                          }}
                        >
                          {slots}
                        </td>
                        <td
                          className="px-2 py-2 text-right font-digital"
                          style={{ color: "oklch(0.62 0.15 140)" }}
                        >
                          {Number(team.numberOfPlayers)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purse Bar Chart — replaced with team SOLD display for 2s after SOLD */}
          <div
            className="p-3 flex-shrink-0"
            style={{ borderTop: "1px solid oklch(0.16 0.03 255)" }}
          >
            <AnimatePresence mode="wait">
              {soldTeamDisplay ? (
                <motion.div
                  key="sold-team-display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-2 gap-2"
                >
                  <div
                    className="font-broadcast text-xs tracking-widest mb-1"
                    style={{ color: "oklch(0.72 0.22 35)" }}
                  >
                    SOLD TO
                  </div>
                  {/* Team logo */}
                  {(() => {
                    const tLogoUrl = teamLogos[soldTeamDisplay.teamId] ?? "";
                    const tInitials = soldTeamDisplay.teamName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return tLogoUrl ? (
                      <img
                        src={tLogoUrl}
                        alt={soldTeamDisplay.teamName}
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid oklch(0.78 0.165 85 / 0.7)",
                          boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.4)",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "oklch(0.16 0.05 255)",
                          border: "2px solid oklch(0.78 0.165 85 / 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "oklch(0.78 0.165 85)",
                          fontFamily: '"Bricolage Grotesque", sans-serif',
                        }}
                      >
                        {tInitials}
                      </div>
                    );
                  })()}
                  <div
                    className="font-broadcast tracking-wide text-center"
                    style={{
                      color: "oklch(0.92 0.02 90)",
                      fontSize: "13px",
                    }}
                  >
                    {soldTeamDisplay.teamName}
                  </div>
                  <div
                    className="font-digital px-3 py-1"
                    style={{
                      fontSize: "16px",
                      color: "oklch(0.08 0.025 265)",
                      background:
                        "linear-gradient(135deg, oklch(0.88 0.18 88), oklch(0.78 0.165 85))",
                      fontWeight: 700,
                    }}
                  >
                    {soldTeamDisplay.soldPrice.toLocaleString()} PTS
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {teams.length > 0 && (
                    <ResponsiveContainer
                      width="100%"
                      height={layout.chartHeight}
                    >
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          type="number"
                          tick={{ fill: "oklch(0.3 0.02 90)", fontSize: 9 }}
                          axisLine={{ stroke: "oklch(0.18 0.03 255)" }}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{
                            fill: "oklch(0.48 0.02 90)",
                            fontSize: 9,
                          }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "oklch(0.78 0.165 85 / 0.05)" }}
                        />
                        <Bar dataKey="purse" radius={[0, 2, 2, 0]}>
                          {chartData.map((entry) => (
                            <Cell
                              key={`cell-${entry.id}`}
                              fill={
                                auctionState?.leadingTeamId !== undefined &&
                                BigInt(entry.id) === auctionState.leadingTeamId
                                  ? "oklch(0.78 0.165 85)"
                                  : "oklch(0.3 0.07 255)"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2 text-center text-xs"
            style={{
              borderTop: "1px solid oklch(0.14 0.025 255)",
              color: "oklch(0.25 0.02 90)",
            }}
          >
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "oklch(0.48 0.08 80)" }}
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
