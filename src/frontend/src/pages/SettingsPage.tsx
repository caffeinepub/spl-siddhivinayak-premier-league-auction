import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Loader2,
  Minus,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Category, type Player, type Team } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useImageUpload } from "../hooks/useImageUpload";
import {
  DEFAULT_LIVE_LAYOUT,
  LIVE_LAYOUT_KEY,
  type LeagueSettings,
  type LiveLayoutConfig,
  getIconPhotos,
  getLeagueSettings,
  getLiveLayout,
  getOwnerPhotos,
  getTeamLogos,
  saveIconPhotos,
  saveLeagueSettings,
  saveOwnerPhotos,
  saveTeamLogos,
} from "./LandingPage";

// ─── Auth guard ────────────────────────────────────────────────────────────────
const AUTH_KEY = "spl_admin_auth";

function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === "1";
}

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "league" | "teams" | "players" | "layout";

// ─── Upload button ────────────────────────────────────────────────────────────
function UploadBtn({
  onUrl,
  label = "UPLOAD",
  circle = false,
}: {
  onUrl: (url: string) => void;
  label?: string;
  circle?: boolean;
}) {
  const { upload, progress, isUploading } = useImageUpload();
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) onUrl(url);
    e.target.value = "";
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
      {isUploading ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          {progress}%
        </>
      ) : (
        <>
          <Upload size={12} />
          {label}
        </>
      )}
      <input
        ref={ref}
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
  const [settings, setSettings] = useState<LeagueSettings>(getLeagueSettings());
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

      {/* Logo */}
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

      {/* Logo size */}
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

      {/* Short name */}
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

      {/* Full name */}
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

      {/* Name size */}
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
  const { actor } = useActor();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
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
        saving: boolean;
      }
    >
  >({});

  useEffect(() => {
    if (!actor) return;
    actor
      .getTeams()
      .then((t) => {
        setTeams(t.sort((a, b) => Number(a.id) - Number(b.id)));
        const edits: typeof localEdits = {};
        for (const team of t) {
          edits[String(team.id)] = {
            name: team.name,
            ownerName: team.ownerName,
            teamIconPlayer: team.teamIconPlayer,
            purse: String(team.purseAmountLeft),
            saving: false,
          };
        }
        setLocalEdits(edits);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const setEdit = (id: string, patch: Partial<(typeof localEdits)[string]>) => {
    setLocalEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveTeam = async (team: Team) => {
    if (!actor) return;
    const id = String(team.id);
    const edit = localEdits[id];
    if (!edit) return;
    setEdit(id, { saving: true });
    try {
      const r = await actor.updateTeam(
        team.id,
        edit.name,
        edit.ownerName,
        edit.teamIconPlayer,
      );
      if (r.__kind__ === "err") {
        toast.error(r.err);
      } else {
        // Also save purse if changed
        const newPurse = BigInt(edit.purse || "0");
        if (newPurse !== team.purseAmountLeft) {
          const pr = await actor.editTeamPurse(team.id, newPurse);
          if (pr.__kind__ === "err") toast.error(pr.err);
        }
        toast.success(`${edit.name} saved`);
        setTeams((prev) =>
          prev.map((t) =>
            t.id === team.id
              ? {
                  ...t,
                  name: edit.name,
                  ownerName: edit.ownerName,
                  teamIconPlayer: edit.teamIconPlayer,
                  purseAmountLeft: BigInt(edit.purse || "0"),
                }
              : t,
          ),
        );
      }
    } catch {
      toast.error("Failed to save team");
    } finally {
      setEdit(id, { saving: false });
    }
  };

  const saveLogo = (team: Team, url: string) => {
    const id = String(team.id);
    const newLogos = { ...teamLogos, [id]: url };
    setTeamLogos(newLogos);
    saveTeamLogos(newLogos);
    toast.success("Logo saved");
  };

  const saveOwnerPhoto = (teamId: string, url: string) => {
    const updated = { ...ownerPhotos, [teamId]: url };
    setOwnerPhotos(updated);
    saveOwnerPhotos(updated);
    toast.success("Owner photo saved");
  };

  const saveIconPhoto = (teamId: string, url: string) => {
    const updated = { ...iconPhotos, [teamId]: url };
    setIconPhotos(updated);
    saveIconPhotos(updated);
    toast.success("Icon photo saved");
  };

  if (loading) {
    return (
      <div
        className="flex items-center gap-3"
        style={{ color: "oklch(0.55 0.02 90)" }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span className="font-broadcast text-xs tracking-widest">
          LOADING TEAMS...
        </span>
      </div>
    );
  }

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
          saving: false,
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
            {/* Photos row */}
            <div className="flex gap-6 flex-wrap">
              {/* Team logo */}
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
              {/* Owner photo */}
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
              {/* Icon photo */}
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

            {/* Text fields */}
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
              disabled={edit.saving}
              className="flex items-center gap-2 px-5 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                color: "oklch(0.08 0.02 265)",
              }}
            >
              {edit.saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              SAVE TEAM
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: Category.batsman, label: "BATSMAN" },
  { value: Category.bowler, label: "BOWLER" },
  { value: Category.allrounder, label: "ALLROUNDER" },
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
  const { actor } = useActor();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [edits, setEdits] = useState<Record<string, PlayerEditState>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    category: Category.batsman,
    basePrice: "100",
    imageUrl: "",
    rating: "3",
  });
  const [addSaving, setAddSaving] = useState(false);
  const { upload } = useImageUpload();

  const fetchPlayers = useCallback(async () => {
    if (!actor) return;
    const ps = await actor.getPlayers();
    setPlayers(ps.sort((a, b) => (a.name > b.name ? 1 : -1)));
    const e: typeof edits = {};
    for (const p of ps) {
      e[String(p.id)] = {
        name: p.name,
        category: p.category as Category,
        basePrice: String(p.basePrice),
        imageUrl: p.imageUrl,
        rating: String(p.rating),
        saving: false,
        expanded: false,
      };
    }
    setEdits(e);
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const setEdit = (id: string, patch: Partial<PlayerEditState>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const savePlayer = async (player: Player) => {
    if (!actor) return;
    const id = String(player.id);
    const edit = edits[id];
    if (!edit) return;
    setEdit(id, { saving: true });
    try {
      const r = await actor.updatePlayer(
        player.id,
        edit.name,
        edit.category,
        BigInt(edit.basePrice || "100"),
        edit.imageUrl,
        BigInt(edit.rating || "3"),
      );
      if (r.__kind__ === "err") toast.error(r.err);
      else {
        toast.success(`${edit.name} saved`);
        await fetchPlayers();
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setEdit(id, { saving: false });
    }
  };

  const deletePlayer = async (player: Player) => {
    if (!actor) return;
    if (!confirm(`Delete ${player.name}? This cannot be undone.`)) return;
    try {
      const r = await actor.deletePlayer(player.id);
      if (r.__kind__ === "err") toast.error(r.err);
      else {
        toast.success("Player deleted");
        await fetchPlayers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const addPlayer = async () => {
    if (!actor) return;
    if (!newPlayer.name.trim()) return toast.error("Name required");
    setAddSaving(true);
    try {
      const r = await actor.addPlayer(
        newPlayer.name.trim(),
        newPlayer.category,
        BigInt(newPlayer.basePrice || "100"),
        newPlayer.imageUrl,
        BigInt(newPlayer.rating || "3"),
      );
      if (r.__kind__ === "err") toast.error(r.err);
      else {
        toast.success("Player added");
        setNewPlayer({
          name: "",
          category: Category.batsman,
          basePrice: "100",
          imageUrl: "",
          rating: "3",
        });
        setShowAddForm(false);
        await fetchPlayers();
      }
    } catch {
      toast.error("Add failed");
    } finally {
      setAddSaving(false);
    }
  };

  const handleImageFile = async (file: File, id: string | null) => {
    const url = await upload(file);
    if (!url) return;
    if (id === null) {
      setNewPlayer((p) => ({ ...p, imageUrl: url }));
    } else {
      setEdit(id, { imageUrl: url });
    }
  };

  const filteredPlayers =
    filter === "all" ? players : players.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div
        className="flex items-center gap-3"
        style={{ color: "oklch(0.55 0.02 90)" }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span className="font-broadcast text-xs tracking-widest">
          LOADING PLAYERS...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          PLAYER SETTINGS ({filteredPlayers.length})
        </h2>
        {/* Filter */}
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

      {/* Add player button */}
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

      {/* Add form */}
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
              {/* Photo upload */}
              <div className="flex items-center gap-3">
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
                  disabled={addSaving}
                  className="flex items-center gap-2 px-5 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                    color: "oklch(0.08 0.02 265)",
                  }}
                >
                  {addSaving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Plus size={12} />
                  )}
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

      {/* Player list */}
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
              {/* Header row */}
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

              {/* Expanded edit form */}
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
                  {/* Photo */}
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
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => savePlayer(player)}
                      disabled={edit.saving}
                      className="flex items-center gap-2 px-4 py-1.5 font-broadcast tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.78 0.165 85), oklch(0.65 0.14 75))",
                        color: "oklch(0.08 0.02 265)",
                      }}
                    >
                      {edit.saving ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Save size={11} />
                      )}
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
    toast.success("Live layout saved — refresh /live to apply");
  };

  const reset = () => {
    setLayout({ ...DEFAULT_LIVE_LAYOUT });
    toast.info("Reset to defaults (not saved yet)");
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
            onClick={reset}
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

      {/* Preview */}
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
                {/* Mini preview of live screen layout */}
                <div
                  className="flex"
                  style={{
                    height: "100%",
                    background: "oklch(0.09 0.025 255)",
                    border: "1px solid oklch(0.22 0.04 255)",
                  }}
                >
                  {/* Left: player area */}
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
                  {/* Right panel */}
                  <div
                    style={{
                      width: layout.rightPanelWidth,
                      background: "oklch(0.08 0.025 255)",
                      borderLeft: "1px solid oklch(0.22 0.04 255)",
                      padding: 8,
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`preview-team-row-${i + 1}`}
                        style={{
                          height: Math.round(
                            14 * (layout.teamTableFontSize / 100),
                          ),
                          background: "oklch(0.14 0.04 255)",
                          marginBottom: 3,
                        }}
                      />
                    ))}
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

      {/* Sliders */}
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
      <p
        className="font-broadcast tracking-wide text-xs"
        style={{ color: "oklch(0.4 0.02 90)" }}
      >
        Refresh /live after saving to see the updated layout.
      </p>
    </div>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("league");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  if (!isAuthenticated()) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "league", label: "LEAGUE" },
    { id: "teams", label: "TEAMS" },
    { id: "players", label: "PLAYERS" },
    { id: "layout", label: "LIVE LAYOUT" },
  ];

  return (
    <div className="min-h-screen bg-background broadcast-overlay">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 10%, oklch(0.14 0.05 255 / 0.6) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-4 px-5 py-3"
        style={{
          background: "oklch(0.09 0.025 255 / 0.95)",
          borderBottom: "1px solid oklch(0.78 0.165 85 / 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="flex items-center gap-2 font-broadcast tracking-wider text-sm transition-opacity hover:opacity-70"
          style={{ color: "oklch(0.55 0.02 90)" }}
        >
          <ChevronLeft size={16} />
          ADMIN
        </button>
        <div
          className="font-broadcast text-lg tracking-widest"
          style={{ color: "oklch(0.78 0.165 85)" }}
        >
          SETTINGS
        </div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-57px)]">
        {/* Sidebar tabs */}
        <nav
          className="w-44 flex-shrink-0 pt-4 px-2"
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

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
