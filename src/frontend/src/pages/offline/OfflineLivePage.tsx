import { Crown, Star, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useOfflineAuctionData } from "../../hooks/useOfflineAuctionData";
import type { OfflinePlayer, OfflineTeam } from "../../offlineStore";
import {
  DEFAULT_LIVE_COLORS,
  DEFAULT_LIVE_LAYOUT,
  type LiveColorTheme,
  type LiveLayoutConfig,
  getIconPhotos,
  getLeagueSettings,
  getLiveColors,
  getLiveLayout,
  getOwnerPhotos,
  getTeamLogos,
} from "../LandingPage";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return Number(n).toLocaleString();
}

function displayCategory(cat: string) {
  const c = cat.toLowerCase();
  if (c === "batsman") return "BATSMAN";
  if (c === "bowler") return "BOWLER";
  if (c === "allrounder") return "ALLROUNDER";
  return cat.toUpperCase();
}

function getCategoryColor(cat: string, colors: LiveColorTheme) {
  const c = cat.toLowerCase();
  if (c === "batsman") return colors.batsmanColor;
  if (c === "bowler") return colors.bowlerColor;
  if (c === "allrounder") return colors.allrounderColor;
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
  player: OfflinePlayer | null;
  team: OfflineTeam | null;
  teamLogoUrl: string;
  colors: LiveColorTheme;
}

function SoldOverlay({
  visible,
  player,
  team,
  teamLogoUrl,
  colors,
}: SoldOverlayProps) {
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
          <div
            className="absolute inset-0"
            style={{ background: `${colors.soldBannerBg}dd` }}
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative z-10 flex flex-col items-center gap-6 px-16 py-12"
            style={{
              background: `${colors.soldBannerBg}f2`,
              border: `3px solid ${colors.soldBannerBorder}`,
              boxShadow: `0 0 80px ${colors.soldBannerBorder}99, 0 0 160px ${colors.soldBannerBorder}40`,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.8,
              }}
              className="font-broadcast text-8xl font-black tracking-widest"
              style={{
                color: colors.soldTextColor,
                textShadow: `0 0 40px ${colors.soldTextColor}cc, 0 0 80px ${colors.soldTextColor}66`,
              }}
            >
              SOLD!
            </motion.div>
            {player && (
              <div
                className="font-broadcast text-4xl tracking-wider"
                style={{ color: colors.primaryText }}
              >
                {player.name.toUpperCase()}
              </div>
            )}
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
                      border: `2px solid ${colors.goldAccent}99`,
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center font-broadcast font-black text-sm"
                    style={{
                      width: 64,
                      height: 64,
                      background: colors.playerImageBg,
                      border: `2px solid ${colors.goldAccent}99`,
                      color: colors.goldAccent,
                    }}
                  >
                    {teamInitials(team.name)}
                  </div>
                )}
                <div>
                  <div
                    className="font-broadcast text-2xl tracking-wider"
                    style={{ color: colors.leadingTeamText }}
                  >
                    {team.name.toUpperCase()}
                  </div>
                  {player?.soldPrice != null && (
                    <div
                      className="font-digital text-xl"
                      style={{ color: colors.goldAccent }}
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
  colors,
}: {
  team: OfflineTeam;
  isLeading: boolean;
  logoUrl: string;
  colors: LiveColorTheme;
}) {
  const slots = 7 - team.numberOfPlayers;
  const pct =
    team.purseAmountTotal > 0
      ? (team.purseAmountLeft / team.purseAmountTotal) * 100
      : 0;

  return (
    <motion.div
      layout
      className="flex items-center gap-2 px-2 py-2.5 rounded transition-all"
      style={{
        background: isLeading ? colors.teamRowLeadingBg : colors.teamRowBg,
        border: isLeading
          ? `1px solid ${colors.teamRowLeadingBorder}`
          : "1px solid transparent",
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={team.name}
          className="rounded-full flex-shrink-0"
          style={{ width: 28, height: 28, objectFit: "cover" }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-broadcast flex-shrink-0"
          style={{
            width: 28,
            height: 28,
            background: colors.playerImageBg,
            color: colors.goldAccent,
            fontSize: 9,
            fontWeight: 900,
          }}
        >
          {teamInitials(team.name).slice(0, 2)}
        </div>
      )}
      <span
        className="font-broadcast tracking-wide truncate flex-1 text-left"
        style={{
          fontSize: 13,
          color: isLeading ? colors.teamRowLeadingText : colors.teamRowText,
        }}
      >
        {team.name}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 50, height: 5, background: colors.playerImageBg }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct > 40 ? colors.goldAccent : colors.bowlerColor,
            }}
          />
        </div>
        <span
          className="font-digital"
          style={{
            fontSize: 11,
            color: isLeading ? colors.goldAccent : colors.secondaryText,
          }}
        >
          {fmt(team.purseAmountLeft)}
        </span>
        <span
          className="font-broadcast"
          style={{ color: colors.secondaryText, fontSize: 11 }}
        >
          {slots}SL
        </span>
      </div>
    </motion.div>
  );
}

// ─── Squad overlay helpers ────────────────────────────────────────────────────
type SquadSlotType = "owner" | "icon" | "auction-filled" | "auction-empty";

function getSquadCatColor(cat: string) {
  const c = cat.toLowerCase();
  if (c === "batsman") return "oklch(0.7 0.15 140)";
  if (c === "bowler") return "oklch(0.65 0.18 25)";
  if (c === "allrounder") return "oklch(0.78 0.165 85)";
  return "oklch(0.55 0.02 90)";
}

function SquadPlayerSlot({
  type,
  name,
  photo,
  category,
  soldPrice,
  slotNumber,
}: {
  type: SquadSlotType;
  name?: string;
  photo?: string;
  category?: string;
  soldPrice?: number;
  slotNumber?: number;
}) {
  const isFixed = type === "owner" || type === "icon";
  const isEmpty = type === "auction-empty";
  const catColor = category
    ? getSquadCatColor(category)
    : "oklch(0.55 0.02 90)";

  return (
    <div
      className="flex flex-col items-center flex-shrink-0"
      style={{ width: 66 }}
    >
      <div
        className="relative"
        style={{
          width: 52,
          height: 64,
          background: isEmpty
            ? "oklch(0.10 0.025 255)"
            : "oklch(0.14 0.04 255)",
          border: isEmpty
            ? "1px dashed oklch(0.22 0.04 255)"
            : isFixed
              ? `1px solid ${type === "owner" ? "oklch(0.78 0.165 85 / 0.5)" : "oklch(0.7 0.12 60 / 0.5)"}`
              : "1px solid oklch(0.35 0.06 255 / 0.5)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {isEmpty ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: "oklch(0.22 0.04 255)" }}
          >
            <span className="font-broadcast" style={{ fontSize: 8 }}>
              {slotNumber ?? ""}
            </span>
          </div>
        ) : photo ? (
          <img
            src={photo}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-broadcast font-black"
            style={{ color: "oklch(0.25 0.04 255)", fontSize: 16 }}
          >
            {name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {type === "owner" && (
          <div
            className="absolute top-0.5 right-0.5 rounded-full p-0.5"
            style={{ background: "oklch(0.78 0.165 85 / 0.9)" }}
          >
            <Crown size={6} style={{ color: "oklch(0.08 0.02 265)" }} />
          </div>
        )}
        {type === "icon" && (
          <div
            className="absolute top-0.5 right-0.5 rounded-full p-0.5"
            style={{ background: "oklch(0.7 0.12 60 / 0.9)" }}
          >
            <Star size={6} style={{ color: "oklch(0.08 0.02 265)" }} />
          </div>
        )}
        {type === "auction-filled" && category && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 2, background: catColor }}
          />
        )}
      </div>
      <div
        className="font-broadcast tracking-wide text-center leading-tight mt-0.5"
        style={{
          fontSize: 7,
          color: isEmpty
            ? "oklch(0.25 0.02 90)"
            : isFixed
              ? "oklch(0.72 0.08 82)"
              : "oklch(0.72 0.015 90)",
          maxWidth: 64,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {isEmpty ? "OPEN" : (name?.toUpperCase() ?? "")}
      </div>
      <div
        className="font-digital text-center"
        style={{
          fontSize: 6,
          color: isEmpty
            ? "oklch(0.2 0.02 90)"
            : type === "owner"
              ? "oklch(0.78 0.165 85)"
              : type === "icon"
                ? "oklch(0.7 0.12 60)"
                : "oklch(0.5 0.12 82)",
        }}
      >
        {isEmpty
          ? "—"
          : type === "owner"
            ? "200 PTS"
            : type === "icon"
              ? "300 PTS"
              : soldPrice != null
                ? `${fmt(soldPrice)}`
                : ""}
      </div>
    </div>
  );
}

function SquadTeamRow({
  team,
  players,
  teamLogoUrl,
  ownerPhotoUrl,
  iconPhotoUrl,
}: {
  team: OfflineTeam;
  players: OfflinePlayer[];
  teamLogoUrl: string;
  ownerPhotoUrl: string;
  iconPhotoUrl: string;
}) {
  const boughtPlayers = players
    .filter((p) => p.status === "sold" && p.soldTo === team.id)
    .sort((a, b) => (b.soldPrice ?? 0) - (a.soldPrice ?? 0));

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded"
      style={{
        background: team.isTeamLocked
          ? "oklch(0.55 0.15 140 / 0.06)"
          : "oklch(0.10 0.025 255)",
        border: team.isTeamLocked
          ? "1px solid oklch(0.55 0.15 140 / 0.3)"
          : "1px solid oklch(0.18 0.04 255 / 0.6)",
      }}
    >
      <div
        className="flex flex-col items-center gap-1 flex-shrink-0"
        style={{ width: 72 }}
      >
        {teamLogoUrl ? (
          <img
            src={teamLogoUrl}
            alt={team.name}
            className="rounded-full"
            style={{
              width: 34,
              height: 34,
              objectFit: "cover",
              border: "1px solid oklch(0.78 0.165 85 / 0.4)",
            }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center font-broadcast font-black"
            style={{
              width: 34,
              height: 34,
              background: "oklch(0.15 0.05 255)",
              border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              color: "oklch(0.78 0.165 85)",
              fontSize: 9,
            }}
          >
            {teamInitials(team.name).slice(0, 2)}
          </div>
        )}
        <div
          className="font-broadcast tracking-wide text-center leading-tight"
          style={{
            fontSize: 7,
            color: "oklch(0.65 0.02 90)",
            maxWidth: 70,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team.name.toUpperCase()}
        </div>
        <div
          className="font-broadcast tracking-widest"
          style={{
            fontSize: 6,
            color: team.isTeamLocked
              ? "oklch(0.65 0.18 140)"
              : "oklch(0.4 0.02 90)",
          }}
        >
          {team.numberOfPlayers}/7 {team.isTeamLocked ? "✓ FULL" : "BOUGHT"}
        </div>
      </div>
      <div
        className="flex gap-1.5 overflow-x-auto flex-1 pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        <SquadPlayerSlot
          type="owner"
          name={team.ownerName}
          photo={ownerPhotoUrl}
        />
        <SquadPlayerSlot
          type="icon"
          name={team.teamIconPlayer}
          photo={iconPhotoUrl}
        />
        {Array.from({ length: 7 }).map((_, i) => {
          const player = boughtPlayers[i];
          const slotNum = i + 3;
          if (player) {
            return (
              <SquadPlayerSlot
                key={player.id}
                type="auction-filled"
                name={player.name}
                photo={player.imageUrl}
                category={player.category}
                soldPrice={player.soldPrice}
              />
            );
          }
          return (
            <SquadPlayerSlot
              key={`slot-${slotNum}`}
              type="auction-empty"
              slotNumber={slotNum}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main OfflineLivePage ─────────────────────────────────────────────────────
export default function OfflineLivePage() {
  const { auctionState, teams, players, isLoading } = useOfflineAuctionData();
  const [layout, setLayout] = useState<LiveLayoutConfig>(() => getLiveLayout());
  const [colors, setColors] = useState<LiveColorTheme>(() => getLiveColors());
  const [showSquads, setShowSquads] = useState(false);
  const [league, setLeague] = useState(() => getLeagueSettings());
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>(() =>
    getTeamLogos(),
  );
  const [ownerPhotos, setOwnerPhotos] = useState<Record<string, string>>(() =>
    getOwnerPhotos(),
  );
  const [iconPhotos, setIconPhotos] = useState<Record<string, string>>(() =>
    getIconPhotos(),
  );

  const sortedSquadTeams = [...teams].sort((a, b) => a.id - b.id);

  const prevAuctionActiveRef = useRef<boolean | null>(null);
  const prevLeadingTeamIdRef = useRef<number | null>(null);
  const prevCurrentPlayerIdRef = useRef<number | null>(null);
  const prevCurrentBidRef = useRef<number>(0);
  const [soldOverlayVisible, setSoldOverlayVisible] = useState(false);
  const [lastSoldPlayer, setLastSoldPlayer] = useState<OfflinePlayer | null>(
    null,
  );
  const [lastSoldTeam, setLastSoldTeam] = useState<OfflineTeam | null>(null);
  const soldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh layout + colors + league + logos from localStorage periodically
  useEffect(() => {
    const refresh = () => {
      setLayout(getLiveLayout());
      setColors(getLiveColors());
      setLeague(getLeagueSettings());
      setTeamLogos(getTeamLogos());
      setOwnerPhotos(getOwnerPhotos());
      setIconPhotos(getIconPhotos());
    };
    const interval = setInterval(refresh, 3000);
    // Also refresh instantly when Settings saves in another tab
    window.addEventListener("storage", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const currentPlayer =
    auctionState?.currentPlayerId != null
      ? (players.find((p) => p.id === auctionState.currentPlayerId) ?? null)
      : null;

  const leadingTeam =
    auctionState?.leadingTeamId != null
      ? (teams.find((t) => t.id === auctionState.leadingTeamId) ?? null)
      : null;

  useEffect(() => {
    if (!auctionState) return;
    const wasActive = prevAuctionActiveRef.current;
    const isNowActive = auctionState.isActive;

    if (wasActive === true && isNowActive === false) {
      const prevLeadingId = prevLeadingTeamIdRef.current;
      const prevPlayerId = prevCurrentPlayerIdRef.current;
      const prevBid = prevCurrentBidRef.current;

      if (prevLeadingId != null && prevPlayerId != null && prevBid > 0) {
        const soldPlayer =
          players.find((p) => p.id === prevPlayerId && p.status === "sold") ??
          players.find((p) => p.id === prevPlayerId) ??
          null;
        const soldTeam = teams.find((t) => t.id === prevLeadingId) ?? null;
        setLastSoldPlayer(soldPlayer);
        setLastSoldTeam(soldTeam);
        setSoldOverlayVisible(true);
        if (soldTimerRef.current) clearTimeout(soldTimerRef.current);
        soldTimerRef.current = setTimeout(
          () => setSoldOverlayVisible(false),
          4000,
        );
      }
    }

    prevAuctionActiveRef.current = isNowActive;
    if (auctionState.leadingTeamId != null)
      prevLeadingTeamIdRef.current = auctionState.leadingTeamId;
    prevCurrentPlayerIdRef.current = auctionState.currentPlayerId ?? null;
    prevCurrentBidRef.current = auctionState.currentBid;
  }, [auctionState, players, teams]);

  const sortedTeams = [...teams].sort(
    (a, b) => b.purseAmountLeft - a.purseAmountLeft,
  );
  const catColor = currentPlayer
    ? getCategoryColor(currentPlayer.category, colors)
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
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-hidden relative broadcast-overlay"
      style={{ background: colors.pageBg }}
    >
      {/* Offline badge */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div
          className="font-broadcast tracking-widest px-3 py-1"
          style={{
            background: "oklch(0.55 0.18 55 / 0.9)",
            border: "1px solid oklch(0.72 0.18 55)",
            color: "oklch(0.97 0.02 90)",
            fontSize: 9,
          }}
        >
          ⚡ OFFLINE MODE
        </div>
      </div>

      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${colors.atmosphereBg}b3 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${colors.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridColor} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <SoldOverlay
        visible={soldOverlayVisible}
        player={lastSoldPlayer}
        team={lastSoldTeam}
        teamLogoUrl={
          lastSoldTeam ? (teamLogos[String(lastSoldTeam.id)] ?? "") : ""
        }
        colors={colors}
      />

      {/* Squads Overlay */}
      <AnimatePresence>
        {showSquads && (
          <motion.div
            key="squads-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: colors.pageBg }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{
                background: colors.headerBg,
                borderBottom: `1px solid ${colors.goldAccent}33`,
              }}
            >
              <div className="flex items-center gap-3">
                {league.logoUrl ? (
                  <img
                    src={league.logoUrl}
                    alt={league.shortName}
                    style={{ height: 28, objectFit: "contain" }}
                  />
                ) : (
                  <div
                    className="font-broadcast font-black"
                    style={{
                      fontSize: 18,
                      color: colors.goldAccent,
                      textShadow: `0 0 16px ${colors.goldAccent}80`,
                    }}
                  >
                    {league.shortName || "SPL"}
                  </div>
                )}
                <div>
                  <div
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 14, color: colors.goldAccent }}
                  >
                    ALL SQUADS
                  </div>
                  <div
                    className="font-broadcast tracking-wide"
                    style={{ fontSize: 9, color: colors.secondaryText }}
                  >
                    {(
                      league.fullName || "SIDDHIVINAYAK PREMIER LEAGUE 2026"
                    ).toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSquads(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: `${colors.goldAccent}18`,
                  border: `1px solid ${colors.goldAccent}66`,
                  color: colors.goldAccent,
                }}
              >
                <X size={12} />
                <span
                  className="font-broadcast tracking-widest"
                  style={{ fontSize: 10 }}
                >
                  CLOSE
                </span>
              </button>
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${colors.atmosphereBg}80 0%, transparent 70%)`,
              }}
            />
            <div className="flex-1 overflow-y-auto relative z-10 px-3 py-3 space-y-2">
              {sortedSquadTeams.map((team) => (
                <SquadTeamRow
                  key={team.id}
                  team={team}
                  players={players}
                  teamLogoUrl={teamLogos[String(team.id)] ?? ""}
                  ownerPhotoUrl={ownerPhotos[String(team.id)] ?? ""}
                  iconPhotoUrl={iconPhotos[String(team.id)] ?? ""}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-3"
        style={{
          background: colors.headerBg,
          borderBottom: `1px solid ${colors.goldAccent}33`,
        }}
      >
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
                color: colors.goldAccent,
                textShadow: `0 0 20px ${colors.goldAccent}80`,
              }}
            >
              {league.shortName || "SPL"}
            </div>
          )}
          <div>
            <div
              className="font-broadcast tracking-widest text-xs"
              style={{ color: colors.goldAccent }}
            >
              {(league.shortName || "SPL").toUpperCase()}
            </div>
            <div
              className="font-broadcast tracking-wide"
              style={{ fontSize: 10, color: colors.secondaryText }}
            >
              {(
                league.fullName || "SIDDHIVINAYAK PREMIER LEAGUE 2026"
              ).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowSquads((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:opacity-90 active:scale-95"
            style={{
              background: showSquads ? `${colors.goldAccent}22` : "transparent",
              border: `1px solid ${colors.goldAccent}${showSquads ? "aa" : "55"}`,
              color: colors.goldAccent,
              boxShadow: showSquads
                ? `0 0 12px ${colors.goldAccent}44`
                : "none",
            }}
          >
            {showSquads ? <X size={12} /> : <Users size={12} />}
            <span
              className="font-broadcast tracking-widest"
              style={{ fontSize: 10 }}
            >
              {showSquads ? "CLOSE" : "SQUADS"}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: colors.liveDotColor }}
            />
            <span
              className="font-broadcast tracking-widest text-xs"
              style={{ color: colors.liveDotColor }}
            >
              LIVE
            </span>
            <span
              className="font-broadcast text-xs"
              style={{ color: colors.secondaryText }}
            >
              · {league.auctionYear || "PLAYER AUCTION 2026"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row h-[calc(100vh-57px)]">
        {/* Left: Player display */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 gap-4 md:gap-6 min-h-0">
          <AnimatePresence mode="wait">
            {currentPlayer ? (
              <motion.div
                key={currentPlayer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="relative">
                  {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((cls) => (
                    <div
                      key={cls}
                      className={`absolute w-5 h-5 ${cls}`}
                      style={{ borderColor: colors.goldAccent }}
                    />
                  ))}
                  <div
                    style={{
                      width: layout.playerImageWidth,
                      height: layout.playerImageHeight,
                      overflow: "hidden",
                      background: colors.playerImageBg,
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
                        style={{ color: colors.secondaryText }}
                      >
                        {currentPlayer.name[0]?.toUpperCase()}
                      </div>
                    )}
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
                <div
                  className="font-broadcast tracking-wider text-center mt-4"
                  style={{
                    fontSize: Math.round(36 * (layout.playerNameSize / 100)),
                    color: colors.primaryText,
                    textShadow: `0 2px 20px ${colors.pageBg}cc`,
                  }}
                >
                  {currentPlayer.name.toUpperCase()}
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-1"
                  style={{
                    background: `${colors.playerImageBg}b3`,
                    border: `1px solid ${colors.silverAccent}33`,
                  }}
                >
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 11, color: colors.secondaryText }}
                  >
                    BASE PRICE
                  </span>
                  <span
                    className="font-digital"
                    style={{ fontSize: 14, color: colors.goldAccent }}
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
                  style={{ color: colors.secondaryText }}
                >
                  AWAITING
                </div>
                <div
                  className="font-broadcast text-xl tracking-widest"
                  style={{ color: `${colors.goldAccent}55` }}
                >
                  NEXT PLAYER
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bid counter area */}
          {auctionState && (
            <div className="flex flex-col items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={auctionState.currentBid}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="font-digital font-bold"
                  style={{
                    fontSize: Math.round(80 * (layout.bidCounterSize / 100)),
                    color: auctionState.isActive
                      ? colors.bidCounterColor
                      : colors.secondaryText,
                    textShadow: auctionState.isActive
                      ? `0 0 40px ${colors.bidCounterGlow}, 0 0 80px ${colors.bidCounterGlow}66`
                      : "none",
                    lineHeight: 1,
                  }}
                >
                  {fmt(auctionState.currentBid)}
                </motion.div>
              </AnimatePresence>
              <div
                className="font-broadcast tracking-widest"
                style={{ fontSize: 11, color: colors.secondaryText }}
              >
                CURRENT BID (PTS)
              </div>
              <AnimatePresence mode="wait">
                {leadingTeam ? (
                  <motion.div
                    key={leadingTeam.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 px-5 py-2"
                    style={{
                      background: colors.leadingTeamBg,
                      border: `1px solid ${colors.goldAccent}66`,
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
                          background: colors.playerImageBg,
                          color: colors.goldAccent,
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
                          color: colors.leadingTeamText,
                        }}
                      >
                        {leadingTeam.name.toUpperCase()}
                      </div>
                      <div
                        className="font-broadcast tracking-widest"
                        style={{
                          fontSize: 9,
                          color: `${colors.leadingTeamText}88`,
                        }}
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
                    style={{ fontSize: 11, color: colors.secondaryText }}
                  >
                    NO BIDS YET
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right panel — desktop vertical, mobile horizontal strip */}
        {/* Desktop */}
        <div
          className="hidden md:flex flex-col gap-3 py-4 px-3 overflow-hidden"
          style={{
            width: rp,
            minWidth: rp,
            borderLeft: `1px solid ${colors.goldAccent}1f`,
            background: colors.rightPanelBg,
          }}
        >
          <div
            className="font-broadcast tracking-widest"
            style={{ fontSize: 10, color: colors.secondaryText }}
          >
            TEAM STANDINGS
          </div>
          {/* Team list — no scroll, all 10 teams fill the panel */}
          <div className="flex flex-col gap-1.5 flex-1">
            {sortedTeams.map((team) => (
              <TeamTableRow
                key={team.id}
                team={team}
                isLeading={team.id === auctionState?.leadingTeamId}
                logoUrl={teamLogos[String(team.id)] ?? ""}
                colors={colors}
              />
            ))}
          </div>
        </div>

        {/* Mobile: compact horizontal team strip at bottom */}
        <div
          className="md:hidden flex-shrink-0 py-2 px-2 overflow-x-auto"
          style={{
            borderTop: `1px solid ${colors.goldAccent}1f`,
            background: colors.rightPanelBg,
            scrollbarWidth: "none",
          }}
        >
          <div className="flex gap-2 min-w-max">
            {sortedTeams.map((team) => {
              const isLeading = team.id === auctionState?.leadingTeamId;
              const logoUrl = teamLogos[String(team.id)] ?? "";
              return (
                <div
                  key={team.id}
                  className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded"
                  style={{
                    background: isLeading
                      ? colors.teamRowLeadingBg
                      : "transparent",
                    border: isLeading
                      ? `1px solid ${colors.teamRowLeadingBorder}`
                      : "1px solid transparent",
                    minWidth: 52,
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={team.name}
                      className="rounded-full"
                      style={{ width: 22, height: 22, objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center font-broadcast"
                      style={{
                        width: 22,
                        height: 22,
                        background: colors.playerImageBg,
                        color: colors.goldAccent,
                        fontSize: 7,
                        fontWeight: 900,
                      }}
                    >
                      {teamInitials(team.name).slice(0, 2)}
                    </div>
                  )}
                  <span
                    className="font-broadcast tracking-wide text-center"
                    style={{
                      fontSize: 7,
                      color: isLeading
                        ? colors.teamRowLeadingText
                        : colors.teamRowText,
                      maxWidth: 50,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {teamInitials(team.name)}
                  </span>
                  <span
                    className="font-digital"
                    style={{
                      fontSize: 8,
                      color: isLeading
                        ? colors.goldAccent
                        : colors.secondaryText,
                    }}
                  >
                    {fmt(team.purseAmountLeft)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
