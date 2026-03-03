import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Minus,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, OfflinePlayer, OfflineTeam } from "../../offlineStore";
import { offlineStore } from "../../offlineStore";
import {
  DEFAULT_LIVE_COLORS,
  DEFAULT_LIVE_LAYOUT,
  LIVE_LAYOUT_KEY,
  type LeagueSettings,
  type LiveColorTheme,
  type LiveLayoutConfig,
  getIconPhotos,
  getLeagueSettings,
  getLiveColors,
  getLiveLayout,
  getOwnerPhotos,
  getTeamLogos,
  saveIconPhotos,
  saveLeagueSettings,
  saveLiveColors,
  saveOwnerPhotos,
  saveTeamLogos,
} from "../LandingPage";

// ─── Auth guard ────────────────────────────────────────────────────────────────
const OFFLINE_AUTH_KEY = "spl_offline_admin_auth";

function isAuthenticated() {
  return localStorage.getItem(OFFLINE_AUTH_KEY) === "1";
}

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "league" | "teams" | "players" | "layout" | "colours";

// ─── Base64 upload helper ─────────────────────────────────────────────────────
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── Upload button (base64 / local) ───────────────────────────────────────────
function UploadBtn({
  onUrl,
  label = "UPLOAD",
  circle = false,
}: {
  onUrl: (url: string) => void;
  label?: string;
  circle?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await readFileAsDataUrl(file);
      onUrl(url);
    } catch {
      toast.error("Failed to read image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label
      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-broadcast tracking-wider transition-all hover:opacity-80 active:scale-95"
      style={{
        background: "oklch(0.78 0.165 85 / 0.12)",
        border: "1px solid oklch(0.78 0.165 85 / 0.4)",
        color: "oklch(0.78 0.165 85)",
        borderRadius: circle ? "9999px" : 0,
      }}
    >
      {uploading ? (
        <>
          <span className="animate-spin">⏳</span>
          SAVING...
        </>
      ) : (
        <>
          <Upload size={12} />
          {label}
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </label>
  );
}

// ─── Photo preview ────────────────────────────────────────────────────────────
function PhotoPreview({
  url,
  size = 48,
  circle = false,
  fallback,
}: {
  url: string;
  size?: number;
  circle?: boolean;
  fallback?: string;
}) {
  if (!url) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: circle ? "50%" : 0,
          background: "oklch(0.14 0.04 255)",
          border: "1px solid oklch(0.22 0.04 255)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          color: "oklch(0.35 0.02 90)",
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {fallback ?? "?"}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: circle ? "50%" : 0,
        border: "1px solid oklch(0.78 0.165 85 / 0.3)",
        flexShrink: 0,
      }}
    />
  );
}

// ─── League Tab ───────────────────────────────────────────────────────────────
function LeagueTab() {
  const [settings, setSettings] = useState<LeagueSettings>(getLeagueSettings);
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveLeagueSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("League settings saved");
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2
        className="font-broadcast text-lg tracking-widest"
        style={{ color: "oklch(0.78 0.165 85)" }}
      >
        LEAGUE SETTINGS
      </h2>
      <div className="space-y-2">
        <span
          className="font-broadcast text-xs tracking-widest"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          LEAGUE LOGO
        </span>
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="logo"
              style={{ height: 80, maxWidth: 160, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                background: "oklch(0.14 0.04 255)",
                border: "1px solid oklch(0.22 0.04 255)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "oklch(0.3 0.02 90)",
                fontSize: 11,
              }}
              className="font-broadcast tracking-widest"
            >
              NO LOGO
            </div>
          )}
          <div className="flex flex-col gap-2">
            <UploadBtn
              onUrl={(url) => setSettings((s) => ({ ...s, logoUrl: url }))}
            />
            {settings.logoUrl && (
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, logoUrl: "" }))}
                className="text-xs font-broadcast tracking-wider px-2 py-1 transition-opacity hover:opacity-70"
                style={{ color: "oklch(0.65 0.18 25)" }}
              >
                REMOVE
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span
            className="font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.55 0.02 90)" }}
          >
            LOGO SIZE
          </span>
          <span
            className="font-digital text-xs"
            style={{ color: "oklch(0.78 0.165 85)" }}
          >
            {settings.logoSize}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          value={settings.logoSize}
          onChange={(e) =>
            setSettings((s) => ({ ...s, logoSize: +e.target.value }))
          }
          className="w-full accent-amber-400"
        />
      </div>
      <div className="space-y-1">
        <span
          className="font-broadcast text-xs tracking-widest"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          SHORT NAME (e.g. SPL)
        </span>
        <input
          value={settings.shortName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, shortName: e.target.value }))
          }
          className="w-full px-3 py-2 font-broadcast tracking-wider text-sm"
          style={{
            background: "oklch(0.11 0.03 255)",
            border: "1px solid oklch(0.22 0.05 255)",
            color: "oklch(0.88 0.02 90)",
            outline: "none",
          }}
          placeholder="SPL"
        />
      </div>
      <div className="space-y-1">
        <span
          className="font-broadcast text-xs tracking-widest"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          FULL NAME
        </span>
        <input
          value={settings.fullName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, fullName: e.target.value }))
          }
          className="w-full px-3 py-2 font-broadcast tracking-wider text-sm"
          style={{
            background: "oklch(0.11 0.03 255)",
            border: "1px solid oklch(0.22 0.05 255)",
            color: "oklch(0.88 0.02 90)",
            outline: "none",
          }}
          placeholder="Siddhivinayak Premier League 2026"
        />
      </div>

      {/* Auction year / event label */}
      <div className="space-y-1">
        <span
          className="font-broadcast text-xs tracking-widest"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          AUCTION YEAR / EVENT LABEL
        </span>
        <input
          value={settings.auctionYear ?? "PLAYER AUCTION 2026"}
          onChange={(e) =>
            setSettings((s) => ({ ...s, auctionYear: e.target.value }))
          }
          className="w-full px-3 py-2 font-broadcast tracking-wider text-sm"
          style={{
            background: "oklch(0.11 0.03 255)",
            border: "1px solid oklch(0.22 0.05 255)",
            color: "oklch(0.88 0.02 90)",
            outline: "none",
          }}
          placeholder="PLAYER AUCTION 2026"
        />
        <p
          className="font-broadcast text-xs"
          style={{ color: "oklch(0.42 0.02 90)" }}
        >
          Shown in the live screen header after the league name
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span
            className="font-broadcast text-xs tracking-widest"
            style={{ color: "oklch(0.55 0.02 90)" }}
          >
            NAME SIZE
          </span>
          <span
            className="font-digital text-xs"
            style={{ color: "oklch(0.78 0.165 85)" }}
          >
            {settings.nameSize}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          value={settings.nameSize}
          onChange={(e) =>
            setSettings((s) => ({ ...s, nameSize: +e.target.value }))
          }
          className="w-full accent-amber-400"
        />
      </div>
      <button
        type="button"
        onClick={save}
        className="flex items-center gap-2 px-6 py-2 font-broadcast tracking-widest text-sm transition-all hover:opacity-90 active:scale-95"
        style={{
          background: saved
            ? "oklch(0.55 0.15 140)"
            : "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
          color: "oklch(0.08 0.02 265)",
          boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.25)",
        }}
      >
        <Save size={14} />
        {saved ? "SAVED!" : "SAVE LEAGUE"}
      </button>
    </div>
  );
}

// ─── Teams Tab ────────────────────────────────────────────────────────────────
function TeamsTab() {
  const [teams, setTeams] = useState<OfflineTeam[]>([]);
  const [teamLogos, setTeamLogos] =
    useState<Record<string, string>>(getTeamLogos);
  const [ownerPhotos, setOwnerPhotos] =
    useState<Record<string, string>>(getOwnerPhotos);
  const [iconPhotos, setIconPhotos] =
    useState<Record<string, string>>(getIconPhotos);
  const [localEdits, setLocalEdits] = useState<
    Record<
      string,
      {
        name: string;
        ownerName: string;
        teamIconPlayer: string;
        purse: string;
      }
    >
  >({});

  useEffect(() => {
    const ts = offlineStore.getTeams().sort((a, b) => a.id - b.id);
    setTeams(ts);
    const edits: typeof localEdits = {};
    for (const team of ts) {
      edits[String(team.id)] = {
        name: team.name,
        ownerName: team.ownerName,
        teamIconPlayer: team.teamIconPlayer,
        purse: String(team.purseAmountLeft),
      };
    }
    setLocalEdits(edits);
  }, []);

  const setEdit = (id: string, patch: Partial<(typeof localEdits)[string]>) => {
    setLocalEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveTeam = (team: OfflineTeam) => {
    const id = String(team.id);
    const edit = localEdits[id];
    if (!edit) return;
    try {
      const r1 = offlineStore.updateTeam(
        team.id,
        edit.name,
        edit.ownerName,
        edit.teamIconPlayer,
      );
      if (!r1.ok) {
        toast.error(r1.err);
        return;
      }
      const newPurse = Number(edit.purse || "0");
      if (newPurse !== team.purseAmountLeft) {
        const r2 = offlineStore.editTeamPurse(team.id, newPurse);
        if (!r2.ok) {
          toast.error(r2.err);
          return;
        }
      }
      setTeams(offlineStore.getTeams().sort((a, b) => a.id - b.id));
      toast.success(`${edit.name} saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save team");
    }
  };

  const saveLogo = (team: OfflineTeam, url: string) => {
    try {
      const newLogos = { ...teamLogos, [String(team.id)]: url };
      setTeamLogos(newLogos);
      saveTeamLogos(newLogos);
      toast.success("Logo saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save logo");
    }
  };

  const saveOwnerPhoto = (teamId: string, url: string) => {
    try {
      const updated = { ...ownerPhotos, [teamId]: url };
      setOwnerPhotos(updated);
      saveOwnerPhotos(updated);
      toast.success("Owner photo saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save photo");
    }
  };

  const saveIconPhoto = (teamId: string, url: string) => {
    try {
      const updated = { ...iconPhotos, [teamId]: url };
      setIconPhotos(updated);
      saveIconPhotos(updated);
      toast.success("Icon photo saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save photo");
    }
  };

  return (
    <div className="space-y-4">
      <h2
        className="font-broadcast text-lg tracking-widest"
        style={{ color: "oklch(0.78 0.165 85)" }}
      >
        TEAM SETTINGS
      </h2>
      {teams.map((team) => {
        const id = String(team.id);
        const edit = localEdits[id] ?? {
          name: team.name,
          ownerName: team.ownerName,
          teamIconPlayer: team.teamIconPlayer,
          purse: String(team.purseAmountLeft),
        };
        return (
          <div
            key={id}
            className="p-4 space-y-4"
            style={{
              background: "oklch(0.10 0.025 255)",
              border: "1px solid oklch(0.22 0.04 255 / 0.6)",
            }}
          >
            <div className="flex gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-broadcast text-xs tracking-widest"
                  style={{ color: "oklch(0.45 0.02 90)", fontSize: 9 }}
                >
                  TEAM LOGO
                </span>
                <PhotoPreview
                  url={teamLogos[id] ?? ""}
                  size={52}
                  circle
                  fallback={team.name[0]}
                />
                <UploadBtn
                  circle
                  onUrl={(url) => saveLogo(team, url)}
                  label="LOGO"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-broadcast text-xs tracking-widest"
                  style={{ color: "oklch(0.45 0.02 90)", fontSize: 9 }}
                >
                  OWNER
                </span>
                <PhotoPreview
                  url={ownerPhotos[id] ?? ""}
                  size={52}
                  circle
                  fallback={edit.ownerName[0] ?? "O"}
                />
                <UploadBtn
                  circle
                  onUrl={(url) => saveOwnerPhoto(id, url)}
                  label="PHOTO"
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-broadcast text-xs tracking-widest"
                  style={{ color: "oklch(0.45 0.02 90)", fontSize: 9 }}
                >
                  ICON PLAYER
                </span>
                <PhotoPreview
                  url={iconPhotos[id] ?? ""}
                  size={52}
                  circle
                  fallback={edit.teamIconPlayer[0] ?? "I"}
                />
                <UploadBtn
                  circle
                  onUrl={(url) => saveIconPhoto(id, url)}
                  label="PHOTO"
                />
              </div>
            </div>
            <p style={{ fontSize: 10, color: "oklch(0.38 0.02 90)" }}>
              Tip: Use smaller images (under 200KB) to avoid storage issues.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "TEAM NAME", key: "name" as const },
                { label: "OWNER NAME", key: "ownerName" as const },
                { label: "ICON PLAYER", key: "teamIconPlayer" as const },
                { label: "PURSE REMAINING", key: "purse" as const },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                  >
                    {label}
                  </span>
                  <input
                    value={edit[key]}
                    onChange={(e) => setEdit(id, { [key]: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.22 0.05 255)",
                      color: "oklch(0.88 0.02 90)",
                      outline: "none",
                      fontFamily: key === "purse" ? "Geist Mono" : undefined,
                    }}
                    type={key === "purse" ? "number" : "text"}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => saveTeam(team)}
              className="flex items-center gap-2 px-5 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                color: "oklch(0.08 0.02 265)",
              }}
            >
              <Save size={12} />
              SAVE TEAM
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "batsman", label: "BATSMAN" },
  { value: "bowler", label: "BOWLER" },
  { value: "allrounder", label: "ALLROUNDER" },
];

interface PlayerEditState {
  name: string;
  category: Category;
  basePrice: string;
  imageUrl: string;
  rating: string;
  saving: boolean;
  expanded: boolean;
}

function PlayersTab() {
  const [players, setPlayers] = useState<OfflinePlayer[]>([]);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [edits, setEdits] = useState<Record<string, PlayerEditState>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    category: "batsman" as Category,
    basePrice: "100",
    imageUrl: "",
    rating: "3",
  });

  const fetchPlayers = useCallback(() => {
    const ps = offlineStore
      .getPlayers()
      .sort((a, b) => (a.name > b.name ? 1 : -1));
    setPlayers(ps);
    setEdits((prev) => {
      const e: Record<string, PlayerEditState> = {};
      for (const p of ps) {
        const id = String(p.id);
        e[id] = {
          name: p.name,
          category: p.category,
          basePrice: String(p.basePrice),
          imageUrl: p.imageUrl,
          rating: String(p.rating),
          saving: false,
          expanded: prev[id]?.expanded ?? false,
        };
      }
      return e;
    });
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const setEdit = (id: string, patch: Partial<PlayerEditState>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const savePlayer = (player: OfflinePlayer) => {
    const id = String(player.id);
    const edit = edits[id];
    if (!edit) return;
    try {
      const r = offlineStore.updatePlayer(
        player.id,
        edit.name,
        edit.category,
        Number(edit.basePrice || "100"),
        edit.imageUrl,
        Number(edit.rating || "3"),
      );
      if (!r.ok) {
        toast.error(r.err);
        return;
      }
      toast.success(`${edit.name} saved`);
      fetchPlayers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save player");
    }
  };

  const deletePlayer = (player: OfflinePlayer) => {
    if (!confirm(`Delete ${player.name}? This cannot be undone.`)) return;
    try {
      const r = offlineStore.deletePlayer(player.id);
      if (!r.ok) {
        toast.error(r.err);
        return;
      }
      toast.success("Player deleted");
      fetchPlayers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete player");
    }
  };

  const addPlayer = () => {
    if (!newPlayer.name.trim()) {
      toast.error("Name required");
      return;
    }
    try {
      const r = offlineStore.addPlayer(
        newPlayer.name.trim(),
        newPlayer.category,
        Number(newPlayer.basePrice || "100"),
        newPlayer.imageUrl,
        Number(newPlayer.rating || "3"),
      );
      if (!r.ok) {
        toast.error(r.err);
        return;
      }
      toast.success("Player added");
      setNewPlayer({
        name: "",
        category: "batsman",
        basePrice: "100",
        imageUrl: "",
        rating: "3",
      });
      setShowAddForm(false);
      fetchPlayers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add player");
    }
  };

  const handleImageFile = async (file: File, id: string | null) => {
    try {
      const url = await readFileAsDataUrl(file);
      if (id === null) setNewPlayer((p) => ({ ...p, imageUrl: url }));
      else setEdit(id, { imageUrl: url });
    } catch {
      toast.error("Failed to read image");
    }
  };

  const filteredPlayers =
    filter === "all" ? players : players.filter((p) => p.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          PLAYER SETTINGS ({filteredPlayers.length})
        </h2>
        <div className="flex gap-1">
          {(
            [["all", "ALL"], ...CATEGORIES.map((c) => [c.value, c.label])] as [
              string,
              string,
            ][]
          ).map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilter(val as typeof filter)}
              className="px-3 py-1 font-broadcast tracking-wider text-xs transition-all"
              style={{
                background:
                  filter === val
                    ? "oklch(0.78 0.165 85 / 0.2)"
                    : "oklch(0.11 0.03 255 / 0.6)",
                border:
                  filter === val
                    ? "1px solid oklch(0.78 0.165 85 / 0.6)"
                    : "1px solid oklch(0.22 0.04 255 / 0.5)",
                color:
                  filter === val ? "oklch(0.88 0.16 82)" : "oklch(0.5 0.02 90)",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAddForm((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95"
        style={{
          background: "oklch(0.78 0.165 85 / 0.12)",
          border: "1px solid oklch(0.78 0.165 85 / 0.4)",
          color: "oklch(0.78 0.165 85)",
        }}
      >
        <Plus size={13} />
        ADD PLAYER
      </button>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 space-y-3"
              style={{
                background: "oklch(0.10 0.03 255)",
                border: "1px solid oklch(0.78 0.165 85 / 0.3)",
              }}
            >
              <div
                className="font-broadcast text-sm tracking-widest"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                ADD NEW PLAYER
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                  >
                    NAME *
                  </span>
                  <input
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-2 py-1.5 text-sm"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.22 0.05 255)",
                      color: "oklch(0.88 0.02 90)",
                      outline: "none",
                    }}
                    placeholder="Player name"
                  />
                </div>
                <div className="space-y-1">
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                  >
                    CATEGORY
                  </span>
                  <select
                    value={newPlayer.category}
                    onChange={(e) =>
                      setNewPlayer((p) => ({
                        ...p,
                        category: e.target.value as Category,
                      }))
                    }
                    className="w-full px-2 py-1.5 text-sm"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.22 0.05 255)",
                      color: "oklch(0.88 0.02 90)",
                      outline: "none",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                  >
                    BASE PRICE (PTS)
                  </span>
                  <input
                    type="number"
                    value={newPlayer.basePrice}
                    onChange={(e) =>
                      setNewPlayer((p) => ({ ...p, basePrice: e.target.value }))
                    }
                    className="w-full px-2 py-1.5 text-sm font-digital"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.22 0.05 255)",
                      color: "oklch(0.88 0.02 90)",
                      outline: "none",
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <span
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                  >
                    RATING (1-5)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newPlayer.rating}
                    onChange={(e) =>
                      setNewPlayer((p) => ({ ...p, rating: e.target.value }))
                    }
                    className="w-full px-2 py-1.5 text-sm font-digital"
                    style={{
                      background: "oklch(0.13 0.03 255)",
                      border: "1px solid oklch(0.22 0.05 255)",
                      color: "oklch(0.88 0.02 90)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {newPlayer.imageUrl && (
                  <img
                    src={newPlayer.imageUrl}
                    alt="preview"
                    style={{
                      width: 48,
                      height: 60,
                      objectFit: "cover",
                      border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                    }}
                  />
                )}
                <label
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
                  style={{
                    background: "oklch(0.78 0.165 85 / 0.12)",
                    border: "1px solid oklch(0.78 0.165 85 / 0.4)",
                    color: "oklch(0.78 0.165 85)",
                  }}
                >
                  <Upload size={12} />
                  UPLOAD PHOTO
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageFile(f, null);
                      e.target.value = "";
                    }}
                  />
                </label>
                <span style={{ fontSize: 10, color: "oklch(0.4 0.02 90)" }}>
                  or paste URL:
                </span>
                <input
                  value={newPlayer.imageUrl}
                  onChange={(e) =>
                    setNewPlayer((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  className="flex-1 px-2 py-1.5 text-xs"
                  style={{
                    background: "oklch(0.13 0.03 255)",
                    border: "1px solid oklch(0.22 0.05 255)",
                    color: "oklch(0.88 0.02 90)",
                    outline: "none",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addPlayer}
                  className="flex items-center gap-2 px-5 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                    color: "oklch(0.08 0.02 265)",
                  }}
                >
                  <Plus size={12} />
                  ADD PLAYER
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-70"
                  style={{
                    background: "oklch(0.11 0.03 255)",
                    border: "1px solid oklch(0.22 0.04 255)",
                    color: "oklch(0.55 0.02 90)",
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {filteredPlayers.map((player) => {
          const id = String(player.id);
          const edit = edits[id];
          if (!edit) return null;
          return (
            <div
              key={id}
              style={{
                background: "oklch(0.10 0.025 255)",
                border: "1px solid oklch(0.22 0.04 255 / 0.6)",
              }}
            >
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2 cursor-pointer select-none w-full text-left"
                onClick={() => setEdit(id, { expanded: !edit.expanded })}
              >
                {edit.imageUrl ? (
                  <img
                    src={edit.imageUrl}
                    alt={edit.name}
                    style={{
                      width: 36,
                      height: 44,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center font-broadcast font-black"
                    style={{
                      width: 36,
                      height: 44,
                      background: "oklch(0.14 0.04 255)",
                      color: "oklch(0.35 0.02 90)",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {player.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-broadcast tracking-wider truncate"
                    style={{ fontSize: 13, color: "oklch(0.85 0.015 90)" }}
                  >
                    {edit.name}
                  </div>
                  <div
                    className="font-broadcast tracking-widest"
                    style={{ fontSize: 9, color: "oklch(0.42 0.02 90)" }}
                  >
                    {edit.category.toUpperCase()} · {edit.basePrice} PTS · ★
                    {edit.rating}
                  </div>
                </div>
                <span
                  className="font-broadcast text-xs tracking-widest px-2 py-0.5"
                  style={{
                    background:
                      player.status === "sold"
                        ? "oklch(0.55 0.15 140 / 0.2)"
                        : player.status === "live"
                          ? "oklch(0.78 0.165 85 / 0.15)"
                          : "oklch(0.28 0.05 255 / 0.4)",
                    color:
                      player.status === "sold"
                        ? "oklch(0.7 0.18 140)"
                        : player.status === "live"
                          ? "oklch(0.88 0.16 82)"
                          : "oklch(0.5 0.02 90)",
                    fontSize: 9,
                  }}
                >
                  {player.status.toUpperCase()}
                </span>
                {edit.expanded ? (
                  <ChevronUp
                    size={14}
                    style={{ color: "oklch(0.45 0.02 90)", flexShrink: 0 }}
                  />
                ) : (
                  <ChevronDown
                    size={14}
                    style={{ color: "oklch(0.45 0.02 90)", flexShrink: 0 }}
                  />
                )}
              </button>
              {edit.expanded && (
                <div
                  className="px-3 pb-3 pt-1 space-y-3 border-t"
                  style={{ borderColor: "oklch(0.18 0.04 255 / 0.5)" }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span
                        className="font-broadcast tracking-widest"
                        style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                      >
                        NAME
                      </span>
                      <input
                        value={edit.name}
                        onChange={(e) => setEdit(id, { name: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm"
                        style={{
                          background: "oklch(0.13 0.03 255)",
                          border: "1px solid oklch(0.22 0.05 255)",
                          color: "oklch(0.88 0.02 90)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span
                        className="font-broadcast tracking-widest"
                        style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                      >
                        CATEGORY
                      </span>
                      <select
                        value={edit.category}
                        onChange={(e) =>
                          setEdit(id, { category: e.target.value as Category })
                        }
                        className="w-full px-2 py-1.5 text-sm"
                        style={{
                          background: "oklch(0.13 0.03 255)",
                          border: "1px solid oklch(0.22 0.05 255)",
                          color: "oklch(0.88 0.02 90)",
                          outline: "none",
                        }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span
                        className="font-broadcast tracking-widest"
                        style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                      >
                        BASE PRICE
                      </span>
                      <input
                        type="number"
                        value={edit.basePrice}
                        onChange={(e) =>
                          setEdit(id, { basePrice: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm font-digital"
                        style={{
                          background: "oklch(0.13 0.03 255)",
                          border: "1px solid oklch(0.22 0.05 255)",
                          color: "oklch(0.88 0.02 90)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span
                        className="font-broadcast tracking-widest"
                        style={{ fontSize: 9, color: "oklch(0.45 0.02 90)" }}
                      >
                        RATING (1-5)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={edit.rating}
                        onChange={(e) =>
                          setEdit(id, { rating: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm font-digital"
                        style={{
                          background: "oklch(0.13 0.03 255)",
                          border: "1px solid oklch(0.22 0.05 255)",
                          color: "oklch(0.88 0.02 90)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {edit.imageUrl && (
                      <img
                        src={edit.imageUrl}
                        alt="preview"
                        style={{
                          width: 44,
                          height: 56,
                          objectFit: "cover",
                          border: "1px solid oklch(0.78 0.165 85 / 0.3)",
                        }}
                      />
                    )}
                    <label
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-broadcast tracking-wider hover:opacity-80"
                      style={{
                        background: "oklch(0.78 0.165 85 / 0.12)",
                        border: "1px solid oklch(0.78 0.165 85 / 0.4)",
                        color: "oklch(0.78 0.165 85)",
                      }}
                    >
                      <Upload size={12} />
                      UPLOAD PHOTO
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageFile(f, id);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <span style={{ fontSize: 10, color: "oklch(0.4 0.02 90)" }}>
                      or URL:
                    </span>
                    <input
                      value={edit.imageUrl}
                      onChange={(e) =>
                        setEdit(id, { imageUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="flex-1 min-w-0 px-2 py-1.5 text-xs"
                      style={{
                        background: "oklch(0.13 0.03 255)",
                        border: "1px solid oklch(0.22 0.05 255)",
                        color: "oklch(0.88 0.02 90)",
                        outline: "none",
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 10, color: "oklch(0.38 0.02 90)" }}>
                    Tip: Use smaller images (under 200KB) to save storage space.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => savePlayer(player)}
                      className="flex items-center gap-2 px-4 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                        color: "oklch(0.08 0.02 265)",
                      }}
                    >
                      <Save size={11} />
                      SAVE
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePlayer(player)}
                      className="flex items-center gap-2 px-3 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90"
                      style={{
                        background: "oklch(0.65 0.18 25 / 0.15)",
                        border: "1px solid oklch(0.65 0.18 25 / 0.4)",
                        color: "oklch(0.75 0.18 25)",
                      }}
                    >
                      <Trash2 size={11} />
                      DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Layout Tab ──────────────────────────────────────────────────────────
interface LayoutSliderConfig {
  key: keyof LiveLayoutConfig;
  label: string;
  min: number;
  max: number;
  unit?: string;
}

const LAYOUT_SLIDERS: LayoutSliderConfig[] = [
  {
    key: "playerImageWidth",
    label: "Player Image Width",
    min: 100,
    max: 400,
    unit: "px",
  },
  {
    key: "playerImageHeight",
    label: "Player Image Height",
    min: 120,
    max: 500,
    unit: "px",
  },
  {
    key: "playerNameSize",
    label: "Player Name Size",
    min: 50,
    max: 200,
    unit: "%",
  },
  {
    key: "categoryBadgeSize",
    label: "Category Badge Size",
    min: 50,
    max: 200,
    unit: "%",
  },
  {
    key: "bidCounterSize",
    label: "Bid Counter Size",
    min: 50,
    max: 200,
    unit: "%",
  },
  {
    key: "leadingTeamSize",
    label: "Leading Team Size",
    min: 50,
    max: 200,
    unit: "%",
  },
  {
    key: "rightPanelWidth",
    label: "Right Panel Width",
    min: 240,
    max: 600,
    unit: "px",
  },
  {
    key: "teamTableFontSize",
    label: "Team Table Font",
    min: 50,
    max: 200,
    unit: "%",
  },
  { key: "chartHeight", label: "Chart Height", min: 80, max: 400, unit: "px" },
  {
    key: "headerLogoSize",
    label: "Header Logo Size",
    min: 20,
    max: 80,
    unit: "px",
  },
];

function LiveLayoutTab() {
  const [layout, setLayout] = useState<LiveLayoutConfig>(getLiveLayout);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const save = () => {
    localStorage.setItem(LIVE_LAYOUT_KEY, JSON.stringify(layout));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Live layout saved — refresh /offline/live to apply");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          LIVE SCREEN LAYOUT
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="px-4 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-80"
            style={{
              background: showPreview
                ? "oklch(0.78 0.165 85 / 0.2)"
                : "oklch(0.11 0.03 255)",
              border: "1px solid oklch(0.78 0.165 85 / 0.4)",
              color: "oklch(0.78 0.165 85)",
            }}
          >
            {showPreview ? "HIDE PREVIEW" : "SHOW PREVIEW"}
          </button>
          <button
            type="button"
            onClick={() => {
              setLayout({ ...DEFAULT_LIVE_LAYOUT });
              toast.info("Reset to defaults");
            }}
            className="px-3 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-70"
            style={{
              background: "oklch(0.11 0.03 255)",
              border: "1px solid oklch(0.22 0.04 255)",
              color: "oklch(0.5 0.02 90)",
            }}
          >
            RESET
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3"
              style={{
                background: "oklch(0.07 0.025 255)",
                border: "1px solid oklch(0.22 0.04 255)",
              }}
            >
              <div
                className="font-broadcast text-xs tracking-widest mb-2"
                style={{ color: "oklch(0.45 0.02 90)" }}
              >
                PREVIEW (scaled 35%)
              </div>
              <div
                style={{
                  transform: "scale(0.35)",
                  transformOrigin: "top left",
                  width: "285%",
                  height: 260,
                  pointerEvents: "none",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex"
                  style={{
                    height: "100%",
                    background: "oklch(0.09 0.025 255)",
                    border: "1px solid oklch(0.22 0.04 255)",
                  }}
                >
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div
                      style={{
                        width: layout.playerImageWidth,
                        height: layout.playerImageHeight,
                        background: "oklch(0.14 0.04 255)",
                        border: "2px solid oklch(0.78 0.165 85 / 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "oklch(0.3 0.02 90)",
                      }}
                      className="font-broadcast"
                    >
                      PHOTO
                    </div>
                    <div
                      className="font-broadcast"
                      style={{
                        fontSize: 36 * (layout.playerNameSize / 100),
                        color: "oklch(0.88 0.02 90)",
                      }}
                    >
                      PLAYER NAME
                    </div>
                    <div
                      className="font-digital"
                      style={{
                        fontSize: 80 * (layout.bidCounterSize / 100),
                        color: "oklch(0.78 0.165 85)",
                      }}
                    >
                      5,200
                    </div>
                    <div
                      style={{
                        fontSize: Math.round(
                          13 * (layout.leadingTeamSize / 100),
                        ),
                        color: "oklch(0.88 0.14 82)",
                      }}
                      className="font-broadcast"
                    >
                      LEADING TEAM
                    </div>
                  </div>
                  <div
                    style={{
                      width: layout.rightPanelWidth,
                      background: "oklch(0.08 0.025 255)",
                      borderLeft: "1px solid oklch(0.22 0.04 255)",
                      padding: 8,
                    }}
                  >
                    {(["r1", "r2", "r3", "r4", "r5", "r6"] as const).map(
                      (rk) => (
                        <div
                          key={rk}
                          style={{
                            height: Math.round(
                              14 * (layout.teamTableFontSize / 100),
                            ),
                            background: "oklch(0.14 0.04 255)",
                            marginBottom: 3,
                          }}
                        />
                      ),
                    )}
                    <div
                      style={{
                        height: layout.chartHeight,
                        background: "oklch(0.12 0.03 255)",
                        marginTop: 8,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-4">
        {LAYOUT_SLIDERS.map(({ key, label, min, max, unit }) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span
                className="font-broadcast tracking-wide text-sm"
                style={{ color: "oklch(0.65 0.02 90)" }}
              >
                {label}
              </span>
              <span
                className="font-digital text-sm"
                style={{ color: "oklch(0.78 0.165 85)" }}
              >
                {layout[key]}
                {unit}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setLayout((l) => ({
                    ...l,
                    [key]: Math.max(min, l[key] - 10),
                  }))
                }
                className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  background: "oklch(0.13 0.03 255)",
                  border: "1px solid oklch(0.22 0.04 255)",
                  color: "oklch(0.55 0.02 90)",
                }}
              >
                <Minus size={12} />
              </button>
              <input
                type="range"
                min={min}
                max={max}
                value={layout[key]}
                onChange={(e) =>
                  setLayout((l) => ({ ...l, [key]: +e.target.value }))
                }
                className="flex-1 accent-amber-400"
              />
              <button
                type="button"
                onClick={() =>
                  setLayout((l) => ({
                    ...l,
                    [key]: Math.min(max, l[key] + 10),
                  }))
                }
                className="w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  background: "oklch(0.13 0.03 255)",
                  border: "1px solid oklch(0.22 0.04 255)",
                  color: "oklch(0.55 0.02 90)",
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className="flex items-center gap-2 px-6 py-2 font-broadcast tracking-widest text-sm transition-all hover:opacity-90 active:scale-95"
        style={{
          background: saved
            ? "oklch(0.55 0.15 140)"
            : "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
          color: "oklch(0.08 0.02 265)",
          boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.25)",
        }}
      >
        <Save size={14} />
        {saved ? "SAVED!" : "SAVE LAYOUT"}
      </button>
    </div>
  );
}

// ─── Live Colours Tab ─────────────────────────────────────────────────────────
interface ColorGroup {
  label: string;
  fields: { key: keyof LiveColorTheme; label: string }[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "BACKGROUNDS",
    fields: [
      { key: "pageBg", label: "Page Background" },
      { key: "headerBg", label: "Header Bar" },
      { key: "rightPanelBg", label: "Right Panel" },
      { key: "playerImageBg", label: "Player Image Placeholder" },
      { key: "atmosphereBg", label: "Atmosphere Glow" },
    ],
  },
  {
    label: "ACCENTS & TEXT",
    fields: [
      { key: "goldAccent", label: "Primary Accent (Gold)" },
      { key: "silverAccent", label: "Secondary Accent" },
      { key: "primaryText", label: "Primary Text" },
      { key: "secondaryText", label: "Secondary Text" },
      { key: "gridColor", label: "Decorative Grid" },
      { key: "liveDotColor", label: "LIVE Dot" },
    ],
  },
  {
    label: "BID COUNTER",
    fields: [
      { key: "bidCounterColor", label: "Bid Number Colour" },
      { key: "bidCounterGlow", label: "Bid Number Glow" },
    ],
  },
  {
    label: "LEADING TEAM BANNER",
    fields: [
      { key: "leadingTeamBg", label: "Banner Background" },
      { key: "leadingTeamText", label: "Team Name Text" },
    ],
  },
  {
    label: "TEAM TABLE",
    fields: [
      { key: "teamRowBg", label: "Row Background" },
      { key: "teamRowLeadingBg", label: "Leading Row Background" },
      { key: "teamRowLeadingBorder", label: "Leading Row Border" },
      { key: "teamRowText", label: "Row Text" },
      { key: "teamRowLeadingText", label: "Leading Row Text" },
    ],
  },
  {
    label: "PURSE CHART",
    fields: [
      { key: "chartBarDefault", label: "Bar Colour (Default)" },
      { key: "chartBarLeading", label: "Bar Colour (Leading)" },
    ],
  },
  {
    label: "CATEGORY BADGES",
    fields: [
      { key: "batsmanColor", label: "Batsman" },
      { key: "bowlerColor", label: "Bowler" },
      { key: "allrounderColor", label: "Allrounder" },
    ],
  },
  {
    label: "SOLD OVERLAY",
    fields: [
      { key: "soldBannerBg", label: "Banner Background" },
      { key: "soldBannerBorder", label: "Banner Border" },
      { key: "soldTextColor", label: "SOLD! Text" },
    ],
  },
];

function LiveColoursTab() {
  const [colors, setColors] = useState<LiveColorTheme>(getLiveColors);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof LiveColorTheme, val: string) =>
    setColors((prev) => ({ ...prev, [key]: val }));

  const save = () => {
    saveLiveColors(colors);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Colours saved — refresh /offline/live to apply");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          LIVE SCREEN COLOURS
        </h2>
        <button
          type="button"
          onClick={() => {
            setColors({ ...DEFAULT_LIVE_COLORS });
            toast.info("Reset to defaults");
          }}
          className="px-3 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-70"
          style={{
            background: "oklch(0.11 0.03 255)",
            border: "1px solid oklch(0.22 0.04 255)",
            color: "oklch(0.5 0.02 90)",
          }}
        >
          RESET
        </button>
      </div>
      <div className="space-y-8">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-3">
            <div
              className="font-broadcast text-xs tracking-widest pb-1"
              style={{
                color: "oklch(0.55 0.02 90)",
                borderBottom: "1px solid oklch(0.18 0.04 255)",
              }}
            >
              {group.label}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {group.fields.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2"
                  style={{
                    background: "oklch(0.10 0.025 255)",
                    border: "1px solid oklch(0.22 0.04 255 / 0.5)",
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        background: colors[key],
                        border: "2px solid oklch(0.3 0.04 255)",
                        cursor: "pointer",
                      }}
                    />
                    <input
                      type="color"
                      value={
                        colors[key].startsWith("#")
                          ? colors[key].slice(0, 7)
                          : "#888888"
                      }
                      onChange={(e) => set(key, e.target.value)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-broadcast tracking-wide text-xs truncate mb-1"
                      style={{ color: "oklch(0.65 0.02 90)" }}
                    >
                      {label}
                    </div>
                    <input
                      type="text"
                      value={colors[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full px-2 py-0.5 font-digital text-xs"
                      style={{
                        background: "oklch(0.13 0.03 255)",
                        border: "1px solid oklch(0.22 0.05 255)",
                        color: "oklch(0.75 0.02 90)",
                        outline: "none",
                      }}
                      placeholder="#rrggbb or oklch(...)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className="flex items-center gap-2 px-6 py-2 font-broadcast tracking-widest text-sm transition-all hover:opacity-90 active:scale-95"
        style={{
          background: saved
            ? "oklch(0.55 0.15 140)"
            : "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
          color: "oklch(0.08 0.02 265)",
          boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.25)",
        }}
      >
        <Save size={14} />
        {saved ? "SAVED!" : "SAVE COLOURS"}
      </button>
    </div>
  );
}

// ─── Not Authenticated ────────────────────────────────────────────────────────
function NotAuthenticatedView() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center broadcast-overlay">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.15 0.06 255 / 0.6) 0%, transparent 70%)",
        }}
      />
      <div
        className="relative z-10 text-center max-w-sm px-6 py-12"
        style={{
          background: "oklch(0.12 0.03 255 / 0.95)",
          border: "1px solid oklch(0.78 0.165 85 / 0.3)",
          boxShadow: "0 0 60px oklch(0.78 0.165 85 / 0.08)",
        }}
      >
        <div
          className="font-broadcast text-xl tracking-widest mb-3"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          ACCESS REQUIRED
        </div>
        <p className="text-sm mb-6" style={{ color: "oklch(0.45 0.02 90)" }}>
          Please log in via the offline admin panel first.
        </p>
        <a
          href="/offline/admin"
          className="inline-flex items-center gap-2 px-6 py-2.5 font-broadcast tracking-widest text-sm transition-all hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
            color: "oklch(0.08 0.02 265)",
            boxShadow: "0 0 20px oklch(0.78 0.165 85 / 0.25)",
          }}
        >
          GO TO OFFLINE ADMIN
        </a>
      </div>
    </div>
  );
}

// ─── Main OfflineSettingsPage ─────────────────────────────────────────────────
export default function OfflineSettingsPage() {
  const [tab, setTab] = useState<Tab>("league");
  const [authed] = useState(() => isAuthenticated());

  if (!authed) return <NotAuthenticatedView />;

  const TABS: { id: Tab; label: string }[] = [
    { id: "league", label: "LEAGUE" },
    { id: "teams", label: "TEAMS" },
    { id: "players", label: "PLAYERS" },
    { id: "layout", label: "LIVE LAYOUT" },
    { id: "colours", label: "COLOURS" },
  ];

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
            "radial-gradient(ellipse 80% 60% at 50% 10%, oklch(0.14 0.05 255 / 0.6) 0%, transparent 70%)",
        }}
      />
      <header
        className="sticky top-0 z-20 flex items-center gap-4 px-5 py-3"
        style={{
          background: "oklch(0.09 0.025 255 / 0.95)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <a
          href="/offline/admin"
          className="flex items-center gap-2 font-broadcast tracking-wider text-sm transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          <ChevronLeft size={16} />
          ADMIN
        </a>
        <div
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          SETTINGS
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className="font-broadcast tracking-widest px-2 py-0.5"
            style={{
              background: "oklch(0.55 0.18 55 / 0.2)",
              border: "1px solid oklch(0.55 0.18 55 / 0.5)",
              color: "oklch(0.72 0.18 55)",
              fontSize: 9,
            }}
          >
            ⚡ OFFLINE
          </span>
        </div>
      </header>
      <div className="relative z-10 flex flex-col md:flex-row min-h-[calc(100vh-57px)]">
        {/* Mobile: horizontal scrollable tabs */}
        <nav
          className="md:hidden flex overflow-x-auto gap-1 px-3 py-2 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.18 0.04 255 / 0.6)" }}
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="flex-shrink-0 px-3 py-2 font-broadcast tracking-widest text-xs transition-all rounded"
              style={{
                background:
                  tab === id ? "oklch(0.78 0.165 85 / 0.15)" : "transparent",
                borderBottom:
                  tab === id
                    ? "2px solid oklch(0.78 0.165 85)"
                    : "2px solid transparent",
                color:
                  tab === id ? "oklch(0.88 0.16 82)" : "oklch(0.45 0.02 90)",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Desktop: vertical sidebar */}
        <nav
          className="hidden md:block w-44 flex-shrink-0 pt-4 px-2"
          style={{ borderRight: "1px solid oklch(0.18 0.04 255 / 0.6)" }}
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="w-full text-left px-3 py-2.5 mb-1 font-broadcast tracking-widest text-xs transition-all"
              style={{
                background:
                  tab === id ? "oklch(0.78 0.165 85 / 0.12)" : "transparent",
                borderLeft:
                  tab === id
                    ? "2px solid oklch(0.78 0.165 85)"
                    : "2px solid transparent",
                color:
                  tab === id ? "oklch(0.88 0.16 82)" : "oklch(0.45 0.02 90)",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "league" && <LeagueTab />}
              {tab === "teams" && <TeamsTab />}
              {tab === "players" && <PlayersTab />}
              {tab === "layout" && <LiveLayoutTab />}
              {tab === "colours" && <LiveColoursTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
