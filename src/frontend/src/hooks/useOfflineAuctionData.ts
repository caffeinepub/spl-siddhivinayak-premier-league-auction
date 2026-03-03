import { useCallback, useEffect, useRef, useState } from "react";
import {
  OFFLINE_CHANGE_EVENT,
  type OfflineAuctionState,
  type OfflineDashboard,
  type OfflinePlayer,
  type OfflineTeam,
  offlineStore,
} from "../offlineStore";

export interface OfflineAuctionData {
  auctionState: OfflineAuctionState | null;
  teams: OfflineTeam[];
  players: OfflinePlayer[];
  dashboard: OfflineDashboard | null;
  isLoading: boolean;
  refetch: () => void;
  pausePolling: (ms: number) => void;
}

export function useOfflineAuctionData(): OfflineAuctionData {
  const [auctionState, setAuctionState] = useState<OfflineAuctionState | null>(
    null,
  );
  const [teams, setTeams] = useState<OfflineTeam[]>([]);
  const [players, setPlayers] = useState<OfflinePlayer[]>([]);
  const [dashboard, setDashboard] = useState<OfflineDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pausedUntilRef = useRef<number>(0);

  const readAll = useCallback(() => {
    if (Date.now() < pausedUntilRef.current) return;
    setAuctionState(offlineStore.getAuctionState());
    setTeams(offlineStore.getTeams());
    setPlayers(offlineStore.getPlayers());
    setDashboard(offlineStore.getDashboard());
    setIsLoading(false);
  }, []);

  // Read on mount immediately
  useEffect(() => {
    readAll();
  }, [readAll]);

  // Listen for same-tab changes (dispatched by offlineStore after every mutation)
  useEffect(() => {
    const handleChange = () => {
      readAll();
    };
    window.addEventListener(OFFLINE_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(OFFLINE_CHANGE_EVENT, handleChange);
  }, [readAll]);

  // Listen for cross-tab changes via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "spl_offline_ts") {
        if (Date.now() < pausedUntilRef.current) return;
        readAll();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [readAll]);

  const pausePolling = useCallback((ms: number) => {
    pausedUntilRef.current = Date.now() + ms;
  }, []);

  const refetch = useCallback(() => {
    readAll();
  }, [readAll]);

  return {
    auctionState,
    teams,
    players,
    dashboard,
    isLoading,
    refetch,
    pausePolling,
  };
}
