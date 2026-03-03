import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AuctionState, Dashboard, Player, Team } from "../backend.d";
import {
  isSettingsPlayer,
  loadSettingsFromBackend,
} from "../utils/settingsStore";
import { syncSettingsToOffline, syncToOffline } from "../utils/syncToOffline";
import { useActor } from "./useActor";

export interface AuctionData {
  auctionState: AuctionState | null;
  teams: Team[];
  players: Player[];
  dashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pausePolling: (ms: number) => void;
}

// Show error UI after this many consecutive failures
const MAX_CONSECUTIVE_ERRORS = 5;
// Force-recreate the ICP actor after this many failures
// (covers the "canister is stopped" case)
const ACTOR_RECREATE_THRESHOLD = 3;

export function useAuctionData(intervalMs = 3000): AuctionData {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedUntilRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef(0);
  const isFetchingDataRef = useRef(false);
  const mountedRef = useRef(true);
  // Only load settings once per actor instance to avoid expensive polling
  const settingsSyncedRef = useRef(false);
  // Rate-limit actor recreations to avoid a tight loop
  const lastActorRecreateRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  /**
   * Force-recreate the actor by invalidating its react-query cache entry.
   * This handles the "canister is stopped" case where the existing actor
   * object is valid but the canister on the network is down/restarted.
   * Rate-limited to once per 10 seconds.
   */
  const tryRecreateActor = useCallback(() => {
    const now = Date.now();
    if (now - lastActorRecreateRef.current < 10000) return;
    lastActorRecreateRef.current = now;
    queryClient.invalidateQueries({ queryKey: ["actor"] });
    queryClient.refetchQueries({ queryKey: ["actor"] });
  }, [queryClient]);

  const fetchAll = useCallback(async () => {
    if (!actor) return;
    if (Date.now() < pausedUntilRef.current) return;
    if (isFetchingDataRef.current) return;

    isFetchingDataRef.current = true;
    try {
      // Parallel fetch — total wait = slowest single call
      const [state, teamsData, playersData, dashData] = await Promise.all([
        actor.getAuctionState(),
        actor.getTeams(),
        actor.getPlayers(),
        actor.getDashboard(),
      ]);

      if (!mountedRef.current) return;

      // Filter out the hidden settings player so it never appears in UI
      const visiblePlayers = playersData.filter((p) => !isSettingsPlayer(p));

      setAuctionState(state);
      setTeams(teamsData);
      setPlayers(visiblePlayers);
      setDashboard(dashData);
      setError(null);
      consecutiveErrorsRef.current = 0;

      // Auto-sync latest online data to offline localStorage backup
      // Runs silently — never throws, never affects online functionality
      syncToOffline(teamsData, visiblePlayers, state, dashData);

      // On first successful fetch, load settings from backend and mirror
      // them to localStorage so offline mode and other devices stay in sync.
      if (!settingsSyncedRef.current) {
        settingsSyncedRef.current = true;
        loadSettingsFromBackend(actor).then((settings) => {
          if (settings && mountedRef.current) {
            syncSettingsToOffline(settings);
          }
        });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      consecutiveErrorsRef.current += 1;

      // At ACTOR_RECREATE_THRESHOLD failures, force a new actor to be created.
      // The canister may have been restarted on the network.
      if (
        consecutiveErrorsRef.current > 0 &&
        consecutiveErrorsRef.current % ACTOR_RECREATE_THRESHOLD === 0
      ) {
        tryRecreateActor();
      }

      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        const msg =
          err instanceof Error ? err.message : "Failed to connect to server";
        setError(msg);

        // Short fixed backoff (2s) — recover quickly when canister comes back
        clearTimers();
        retryTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          isFetchingDataRef.current = false;
          fetchAll().then(() => {
            if (mountedRef.current && !intervalRef.current) {
              intervalRef.current = setInterval(fetchAll, intervalMs);
            }
          });
        }, 2000);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
      isFetchingDataRef.current = false;
    }
  }, [actor, intervalMs, clearTimers, tryRecreateActor]);

  useEffect(() => {
    mountedRef.current = true;

    // Recover when tab regains focus or device comes back online —
    // covers the projector screen that was idle for a long time.
    const onResume = () => {
      if (!mountedRef.current) return;
      tryRecreateActor();
      consecutiveErrorsRef.current = 0;
      setError(null);
      isFetchingDataRef.current = false;
      clearTimers();
      fetchAll().then(() => {
        if (mountedRef.current && !intervalRef.current) {
          intervalRef.current = setInterval(fetchAll, intervalMs);
        }
      });
    };
    window.addEventListener("focus", onResume);
    window.addEventListener("online", onResume);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("focus", onResume);
      window.removeEventListener("online", onResume);
    };
  }, [clearTimers, fetchAll, intervalMs, tryRecreateActor]);

  useEffect(() => {
    if (!actor || isFetching) return;

    consecutiveErrorsRef.current = 0;
    settingsSyncedRef.current = false; // Reset so we re-sync settings on new actor
    setError(null);
    isFetchingDataRef.current = false;
    clearTimers();

    fetchAll();
    intervalRef.current = setInterval(fetchAll, intervalMs);

    return clearTimers;
  }, [actor, isFetching, fetchAll, intervalMs, clearTimers]);

  const pausePolling = useCallback((ms: number) => {
    pausedUntilRef.current = Date.now() + ms;
  }, []);

  const refetch = useCallback(async () => {
    consecutiveErrorsRef.current = 0;
    setError(null);
    isFetchingDataRef.current = false;
    clearTimers();
    tryRecreateActor();
    await fetchAll();
    if (mountedRef.current && !intervalRef.current) {
      intervalRef.current = setInterval(fetchAll, intervalMs);
    }
  }, [fetchAll, clearTimers, intervalMs, tryRecreateActor]);

  return {
    auctionState,
    teams,
    players,
    dashboard,
    isLoading,
    error,
    refetch,
    pausePolling,
  };
}
