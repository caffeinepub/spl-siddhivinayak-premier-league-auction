import { useCallback, useEffect, useRef, useState } from "react";
import type { AuctionState, Dashboard, Player, Team } from "../backend.d";
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

// Mobile-hotspot tolerant settings:
// - Poll every 5 seconds (gives the network time to breathe)
// - Make 4 calls in parallel (not sequential) so total wait time = slowest single call
// - Show error only after 8 consecutive failures
// - Use a local in-memory cache so the UI never goes blank
const DEFAULT_POLL_MS = 5000;
const MAX_CONSECUTIVE_ERRORS = 8;

export function useAuctionData(intervalMs = DEFAULT_POLL_MS): AuctionData {
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
      // Fire all 4 calls in PARALLEL — total wait = slowest single call, not sum of all 4.
      // This is critical for mobile hotspot: 4 sequential calls at 2s each = 8s total,
      // but 4 parallel calls at 2s each = 2s total.
      const [state, teamsData, playersData, dashData] = await Promise.all([
        actor.getAuctionState(),
        actor.getTeams(),
        actor.getPlayers(),
        actor.getDashboard(),
      ]);

      if (!mountedRef.current) return;

      setAuctionState(state);
      setTeams(teamsData);
      setPlayers(playersData);
      setDashboard(dashData);
      setError(null);
      consecutiveErrorsRef.current = 0;
    } catch (err) {
      if (!mountedRef.current) return;
      consecutiveErrorsRef.current += 1;

      // Only surface error to UI after many consecutive failures.
      // Brief hotspot hiccups (1-7 failures in a row) are completely invisible.
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        const msg =
          err instanceof Error ? err.message : "Failed to connect to server";
        setError(msg);
      }

      // Exponential backoff capped at 15s
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
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
