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

const MAX_CONSECUTIVE_ERRORS = 8;

export function useAuctionData(intervalMs = 3000): AuctionData {
  const { actor, isFetching } = useActor();
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

      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        const msg =
          err instanceof Error ? err.message : "Failed to connect to server";
        setError(msg);

        // Exponential backoff capped at 15s
        clearTimers();
        const backoffMs = Math.min(
          3000 * (consecutiveErrorsRef.current - MAX_CONSECUTIVE_ERRORS + 1),
          15000,
        );
        retryTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          isFetchingDataRef.current = false;
          fetchAll().then(() => {
            if (mountedRef.current && !intervalRef.current) {
              intervalRef.current = setInterval(fetchAll, intervalMs);
            }
          });
        }, backoffMs);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
      isFetchingDataRef.current = false;
    }
  }, [actor, intervalMs, clearTimers]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    await fetchAll();
    if (mountedRef.current && !intervalRef.current) {
      intervalRef.current = setInterval(fetchAll, intervalMs);
    }
  }, [fetchAll, clearTimers, intervalMs]);

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
