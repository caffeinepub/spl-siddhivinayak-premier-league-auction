import { useParams } from "@tanstack/react-router";
import { Crown, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { OfflinePlayer, OfflineTeam } from "../../offlineStore";
import { offlineStore } from "../../offlineStore";
import {
  getIconPhotos,
  getLeagueSettings,
  getOwnerPhotos,
  getTeamLogos,
} from "../LandingPage";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return Number(n).toLocaleString();
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

// ─── Player card ──────────────────────────────────────────────────────────────
interface PlayerCardProps {
  slotLabel: string;
  name: string;
  photo: string;
  subLabel: string;
  price: string;
  priceColor: string;
  accentColor: string;
  icon?: React.ReactNode;
  isEmpty?: boolean;
}

function PlayerCard({
  slotLabel,
  name,
  photo,
  subLabel,
  price,
  priceColor,
  accentColor,
  icon,
  isEmpty = false,
}: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isEmpty ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
      style={{
        background: isEmpty ? "oklch(0.09 0.02 255)" : "oklch(0.11 0.03 255)",
        border: isEmpty
          ? "1px dashed oklch(0.2 0.04 255)"
          : `1px solid ${accentColor}33`,
      }}
    >
      <div
        className="px-2 py-1 font-broadcast tracking-widest"
        style={{
          fontSize: 8,
          color: isEmpty ? "oklch(0.25 0.02 90)" : accentColor,
          background: isEmpty ? "oklch(0.1 0.02 255)" : `${accentColor}18`,
          borderBottom: `1px solid ${accentColor}22`,
        }}
      >
        {slotLabel}
      </div>
      <div
        style={{
          width: "100%",
          aspectRatio: "3/4",
          overflow: "hidden",
          background: "oklch(0.12 0.03 255)",
          position: "relative",
        }}
      >
        {isEmpty ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: "oklch(0.2 0.04 255)" }}
          >
            <span className="font-broadcast" style={{ fontSize: 24 }}>
              ?
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
            style={{ color: "oklch(0.25 0.04 255)", fontSize: 32 }}
          >
            {name[0]?.toUpperCase()}
          </div>
        )}
        {icon && !isEmpty && (
          <div
            className="absolute top-1.5 right-1.5 rounded-full p-1"
            style={{ background: `${accentColor}dd` }}
          >
            {icon}
          </div>
        )}
        {!isEmpty && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 2, background: accentColor }}
          />
        )}
      </div>
      <div className="p-2 space-y-0.5">
        <div
          className="font-broadcast tracking-wide leading-tight"
          style={{
            fontSize: 11,
            color: isEmpty ? "oklch(0.3 0.02 90)" : "oklch(0.88 0.015 90)",
          }}
        >
          {isEmpty ? "SLOT OPEN" : name.toUpperCase()}
        </div>
        {!isEmpty && (
          <>
            <div
              className="font-broadcast tracking-widest"
              style={{ fontSize: 8, color: "oklch(0.45 0.02 90)" }}
            >
              {subLabel}
            </div>
            <div
              className="font-digital"
              style={{ fontSize: 10, color: priceColor }}
            >
              {price}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main OfflineTeamPage ─────────────────────────────────────────────────────
export default function OfflineTeamPage() {
  const params = useParams({ from: "/offline/team/$teamId" });
  const teamId = Number(params.teamId ?? "0");
  const league = getLeagueSettings();
  const teamLogos = getTeamLogos();
  const ownerPhotos = getOwnerPhotos();
  const iconPhotos = getIconPhotos();

  const [team, setTeam] = useState<OfflineTeam | null>(null);
  const [players, setPlayers] = useState<OfflinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = () => {
      const t = offlineStore.getTeamById(teamId);
      const ps = offlineStore.getPlayers();
      setTeam(t);
      setPlayers(ps);
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [teamId]);

  const teamLogoUrl = teamLogos[String(teamId)] ?? "";
  const ownerPhotoUrl = ownerPhotos[String(teamId)] ?? "";
  const iconPhotoUrl = iconPhotos[String(teamId)] ?? "";

  const boughtPlayers = players
    .filter((p) => p.status === "sold" && p.soldTo === teamId)
    .sort((a, b) => (b.soldPrice ?? 0) - (a.soldPrice ?? 0));

  const purseUsed = team ? team.purseAmountTotal - team.purseAmountLeft : 0;
  const pctLeft =
    team && team.purseAmountTotal > 0
      ? (team.purseAmountLeft / team.purseAmountTotal) * 100
      : 0;

  if (loading) {
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
            LOADING TEAM...
          </p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="font-broadcast text-2xl tracking-widest mb-2"
            style={{ color: "oklch(0.65 0.18 25)" }}
          >
            TEAM NOT FOUND
          </div>
          <p
            className="font-broadcast text-sm"
            style={{ color: "oklch(0.45 0.02 90)" }}
          >
            Team ID {teamId} does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background broadcast-overlay">
      {/* OFFLINE badge */}
      <div className="fixed top-3 right-3 z-40 pointer-events-none">
        <div
          className="font-broadcast tracking-widest px-3 py-1.5"
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

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.15 0.06 255 / 0.6) 0%, transparent 70%)",
        }}
      />

      <header
        className="relative z-10 flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid oklch(0.78 0.165 85 / 0.18)" }}
      >
        <div className="flex items-center gap-2">
          {league.logoUrl ? (
            <img
              src={league.logoUrl}
              alt={league.shortName}
              style={{ height: 28, objectFit: "contain" }}
            />
          ) : (
            <div
              className="font-broadcast font-black"
              style={{ fontSize: 16, color: "oklch(0.78 0.165 85)" }}
            >
              {league.shortName || "SPL"}
            </div>
          )}
          <span
            className="font-broadcast tracking-widest"
            style={{ fontSize: 10, color: "oklch(0.38 0.02 90)" }}
          >
            SQUAD
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "oklch(0.65 0.22 25)" }}
          />
          <span
            className="font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.45 0.12 140)" }}
          >
            UPDATES EVERY 5s
          </span>
        </div>
      </header>

      <section className="relative z-10 px-5 py-6 text-center">
        {teamLogoUrl ? (
          <img
            src={teamLogoUrl}
            alt={team.name}
            className="mx-auto rounded-full mb-4"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              border: "3px solid oklch(0.78 0.165 85 / 0.5)",
              boxShadow: "0 0 40px oklch(0.78 0.165 85 / 0.25)",
            }}
          />
        ) : (
          <div
            className="mx-auto rounded-full flex items-center justify-center font-broadcast font-black mb-4"
            style={{
              width: 100,
              height: 100,
              background: "oklch(0.15 0.06 255)",
              border: "3px solid oklch(0.78 0.165 85 / 0.4)",
              color: "oklch(0.78 0.165 85)",
              fontSize: 28,
              boxShadow: "0 0 40px oklch(0.78 0.165 85 / 0.2)",
            }}
          >
            {teamInitials(team.name).slice(0, 2)}
          </div>
        )}
        <h1
          className="font-broadcast tracking-wider mb-1"
          style={{ fontSize: 28, color: "oklch(0.78 0.165 85)" }}
        >
          {team.name.toUpperCase()}
        </h1>
        <p
          className="font-broadcast tracking-widest mb-5"
          style={{ fontSize: 11, color: "oklch(0.45 0.02 90)" }}
        >
          OWNER: {team.ownerName.toUpperCase()}
        </p>
        <div className="flex items-center justify-center gap-8 mb-3 flex-wrap">
          {[
            {
              label: "PURSE LEFT",
              value: `${fmt(team.purseAmountLeft)} PTS`,
              color: "oklch(0.78 0.165 85)",
            },
            {
              label: "SPENT",
              value: `${fmt(purseUsed)} PTS`,
              color: "oklch(0.7 0.1 25)",
            },
            {
              label: "PLAYERS",
              value: `${team.numberOfPlayers} / 7`,
              color: "oklch(0.65 0.12 140)",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-digital text-xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="font-broadcast tracking-widest"
                style={{ fontSize: 9, color: "oklch(0.38 0.02 90)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div
          className="mx-auto rounded-full overflow-hidden mb-1"
          style={{
            width: "min(300px, 80%)",
            height: 6,
            background: "oklch(0.14 0.03 255)",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctLeft}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background:
                pctLeft > 50
                  ? "linear-gradient(90deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))"
                  : "linear-gradient(90deg, oklch(0.65 0.18 25), oklch(0.55 0.2 25))",
            }}
          />
        </div>
        <div
          className="font-broadcast tracking-widest"
          style={{ fontSize: 9, color: "oklch(0.35 0.02 90)" }}
        >
          {Math.round(pctLeft)}% PURSE REMAINING
        </div>
        {team.isTeamLocked && (
          <div
            className="inline-block mt-3 px-4 py-1 font-broadcast tracking-widest"
            style={{
              background: "oklch(0.55 0.15 140 / 0.2)",
              border: "1px solid oklch(0.55 0.15 140 / 0.5)",
              color: "oklch(0.7 0.18 140)",
              fontSize: 11,
            }}
          >
            ✓ SQUAD COMPLETE
          </div>
        )}
      </section>

      <section className="relative z-10 px-4 pb-8">
        <div
          className="font-broadcast tracking-widest mb-3"
          style={{ fontSize: 11, color: "oklch(0.4 0.02 90)" }}
        >
          ALL 9 SLOTS
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          <PlayerCard
            slotLabel="OWNER"
            name={team.ownerName}
            photo={ownerPhotoUrl}
            subLabel="FIXED"
            price="200 PTS"
            priceColor="oklch(0.78 0.165 85)"
            accentColor="oklch(0.78 0.165 85)"
            icon={<Crown size={8} style={{ color: "oklch(0.08 0.02 265)" }} />}
          />
          <PlayerCard
            slotLabel="ICON PLAYER"
            name={team.teamIconPlayer}
            photo={iconPhotoUrl}
            subLabel="FIXED"
            price="300 PTS"
            priceColor="oklch(0.7 0.12 60)"
            accentColor="oklch(0.7 0.12 60)"
            icon={<Star size={8} style={{ color: "oklch(0.08 0.02 265)" }} />}
          />
          {Array.from({ length: 7 }).map((_, i) => {
            const player = boughtPlayers[i];
            const slotNum = i + 3;
            if (player) {
              const catColor = getCategoryColor(player.category);
              return (
                <PlayerCard
                  key={player.id}
                  slotLabel={`SLOT ${slotNum}`}
                  name={player.name}
                  photo={player.imageUrl}
                  subLabel={player.category.toUpperCase()}
                  price={`${fmt(player.soldPrice ?? 0)} PTS`}
                  priceColor={catColor}
                  accentColor={catColor}
                />
              );
            }
            return (
              <PlayerCard
                key={`slot-${slotNum}`}
                slotLabel={`SLOT ${slotNum}`}
                name=""
                photo=""
                subLabel=""
                price=""
                priceColor=""
                accentColor="oklch(0.22 0.04 255)"
                isEmpty
              />
            );
          })}
        </div>
      </section>

      <div className="relative z-10 text-center pb-4">
        <p
          className="font-broadcast tracking-widest"
          style={{ fontSize: 9, color: "oklch(0.28 0.02 90)" }}
        >
          LAST UPDATED: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <footer
        className="relative z-10 text-center py-4 text-xs"
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
