import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Monitor,
  RefreshCw,
  Shield,
  Users,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { getLastSyncTime } from "../../utils/syncToOffline";
import { getLeagueSettings } from "../LandingPage";

function formatSyncTime(iso: string | null): string {
  if (!iso) return "Never (open the online version first)";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

export default function OfflineLandingPage() {
  const navigate = useNavigate();
  const settings = getLeagueSettings();
  const shortName = settings.shortName || "SPL";
  const fullName = settings.fullName || "Siddhivinayak Premier League 2026";
  const logoUrl = settings.logoUrl;
  const logoSizePct = settings.logoSize / 100;
  const nameSizePct = settings.nameSize / 100;
  const lastSync = getLastSyncTime();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden broadcast-overlay flex flex-col items-center justify-center">
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, oklch(0.18 0.07 55 / 0.5) 0%, transparent 70%)",
        }}
      />
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.82 0.18 65 / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.82 0.18 65 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Diagonal accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.82 0.18 65 / 0.02) 0%, transparent 50%, oklch(0.82 0.18 65 / 0.04) 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl w-full"
      >
        {/* OFFLINE BACKUP badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-broadcast tracking-widest"
            style={{
              background: "oklch(0.82 0.18 65 / 0.18)",
              border: "1px solid oklch(0.82 0.18 65 / 0.55)",
              color: "oklch(0.88 0.18 68)",
            }}
          >
            <WifiOff size={12} />
            OFFLINE BACKUP VERSION
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-6"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={shortName}
              style={{
                width: `${Math.round(200 * logoSizePct)}px`,
                height: `${Math.round(200 * logoSizePct)}px`,
                objectFit: "contain",
                filter: "drop-shadow(0 0 40px oklch(0.82 0.18 65 / 0.4))",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: `${Math.round(160 * logoSizePct)}px`,
                height: `${Math.round(160 * logoSizePct)}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "radial-gradient(circle, oklch(0.18 0.07 255) 0%, oklch(0.11 0.03 255) 100%)",
                border: "2px solid oklch(0.82 0.18 65 / 0.6)",
                boxShadow:
                  "0 0 60px oklch(0.82 0.18 65 / 0.35), 0 0 120px oklch(0.82 0.18 65 / 0.12)",
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontWeight: 900,
                fontSize: `${Math.round(52 * logoSizePct)}px`,
                color: "oklch(0.82 0.18 65)",
                letterSpacing: "-0.03em",
                margin: "0 auto",
              }}
            >
              {shortName.slice(0, 3)}
            </div>
          )}
        </motion.div>

        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <span
            className="inline-block px-4 py-1 text-xs font-broadcast tracking-widest"
            style={{
              background: "oklch(0.78 0.165 85 / 0.12)",
              border: "1px solid oklch(0.78 0.165 85 / 0.4)",
              color: "oklch(0.88 0.18 88)",
            }}
          >
            ● LIVE AUCTION EVENT 2026
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-broadcast leading-none mb-2"
          style={{
            fontSize: `${Math.round(96 * nameSizePct)}px`,
            color: "oklch(0.78 0.165 85)",
            textShadow:
              "0 0 40px oklch(0.78 0.165 85 / 0.5), 0 0 80px oklch(0.78 0.165 85 / 0.2)",
          }}
        >
          {shortName}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-full max-w-lg h-px mb-4"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.165 85), transparent)",
          }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-broadcast tracking-widest mb-2"
          style={{
            fontSize: `${Math.round(22 * nameSizePct)}px`,
            color: "oklch(0.72 0.04 90)",
          }}
        >
          {fullName.toUpperCase()}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm mb-4"
          style={{ color: "oklch(0.82 0.18 65)" }}
        >
          This version works without internet. All data is stored on this
          device.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4"
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/offline/live" })}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 text-base font-broadcast tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
              color: "oklch(0.08 0.025 265)",
              boxShadow: "0 0 30px oklch(0.78 0.165 85 / 0.4)",
            }}
          >
            <Monitor size={20} />
            LIVE SCREEN
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/offline/admin" })}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 text-base font-broadcast tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "oklch(0.13 0.03 255 / 0.8)",
              border: "1px solid oklch(0.78 0.165 85 / 0.4)",
              color: "oklch(0.78 0.165 85)",
              boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.08)",
            }}
          >
            <Shield size={20} />
            ADMIN PANEL
            <ChevronRight size={16} />
          </button>
        </motion.div>

        {/* Squads link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          className="mt-5"
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/offline/squads" })}
            className="flex items-center gap-2 text-sm font-broadcast tracking-wider transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.55 0.02 90)" }}
          >
            <Users size={14} />
            SQUADS
          </button>
        </motion.div>

        {/* Offline note + last sync time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-6 px-5 py-4 max-w-sm w-full"
          style={{
            background: "oklch(0.82 0.18 65 / 0.06)",
            border: "1px solid oklch(0.82 0.18 65 / 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={12} style={{ color: "oklch(0.82 0.18 65)" }} />
            <span
              className="text-xs font-broadcast tracking-widest"
              style={{ color: "oklch(0.82 0.18 65)" }}
            >
              LAST SYNCED FROM ONLINE
            </span>
          </div>
          <p
            className="text-xs font-digital"
            style={{
              color: lastSync ? "oklch(0.88 0.18 68)" : "oklch(0.55 0.05 65)",
            }}
          >
            {formatSyncTime(lastSync)}
          </p>
          {!lastSync && (
            <p
              className="text-xs mt-2 font-broadcast tracking-wide"
              style={{ color: "oklch(0.55 0.05 65)" }}
            >
              Visit the online version at least once to auto-sync all data here.
            </p>
          )}
          {lastSync && (
            <p
              className="text-xs mt-2 font-broadcast tracking-wide"
              style={{ color: "oklch(0.52 0.06 65)" }}
            >
              Teams, players, auction state & settings (league name, logos,
              colours, layout) are all synced as of above time.
            </p>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-12 grid grid-cols-3 gap-8 text-center"
        >
          {[
            { value: "10", label: "TEAMS" },
            { value: "70", label: "PLAYERS" },
            { value: "20,000", label: "PURSE PTS" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="font-digital text-3xl font-bold"
                style={{ color: "oklch(0.82 0.18 65)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-broadcast tracking-widest mt-1"
                style={{ color: "oklch(0.42 0.02 90)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Back to online version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 left-0 right-0 text-center z-10"
      >
        <a
          href="/"
          className="text-xs font-broadcast tracking-wider transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.42 0.02 90)" }}
        >
          ← Online Version
        </a>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-6 left-0 right-0 text-center text-xs z-10"
        style={{ color: "oklch(0.32 0.02 90)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          style={{ color: "oklch(0.58 0.12 82)" }}
        >
          caffeine.ai
        </a>
      </motion.footer>
    </div>
  );
}
