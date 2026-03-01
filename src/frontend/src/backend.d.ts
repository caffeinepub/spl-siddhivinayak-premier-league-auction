import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Player {
    id: bigint;
    status: string;
    soldTo?: bigint;
    name: string;
    soldPrice?: bigint;
    imageUrl: string;
    category: string;
    rating: bigint;
    basePrice: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface PlayerWithTeam {
    player: Player;
    team?: Team;
}
export interface Dashboard {
    remainingPlayers: bigint;
    totalSpent: bigint;
    mostExpensivePlayer?: Player;
    soldPlayers: bigint;
}
export interface AuctionState {
    currentPlayerId?: bigint;
    leadingTeamId?: bigint;
    isActive: boolean;
    currentBid: bigint;
}
export interface Team {
    id: bigint;
    purseAmountLeft: bigint;
    teamIconPlayer: string;
    teamLogo?: ExternalBlob;
    isTeamLocked: boolean;
    ownerName: string;
    name: string;
    purseAmountTotal: bigint;
    numberOfPlayers: bigint;
}
export interface backendInterface {
    addPlayer(name: string, category: string, basePrice: bigint, imageUrl: string, rating: bigint): Promise<Result>;
    adminLogin(password: string): Promise<boolean>;
    deletePlayer(playerId: bigint): Promise<Result>;
    editTeamPurse(teamId: bigint, newPurse: bigint): Promise<Result>;
    getAuctionState(): Promise<AuctionState>;
    getDashboard(): Promise<Dashboard>;
    getPlayerById(playerId: bigint): Promise<Player | null>;
    getPlayers(): Promise<Array<Player>>;
    getPlayersByCategory(category: string): Promise<Array<Player>>;
    getRemainingPurse(teamId: bigint): Promise<bigint | null>;
    getResults(): Promise<Array<PlayerWithTeam>>;
    getTeamById(teamId: bigint): Promise<Team | null>;
    getTeams(): Promise<Array<Team>>;
    placeBid(teamId: bigint): Promise<Result>;
    resetAuction(): Promise<void>;
    selectPlayer(playerId: bigint): Promise<Result>;
    sellPlayer(): Promise<Result>;
    updatePlayer(playerId: bigint, name: string, category: string, basePrice: bigint, imageUrl: string, rating: bigint): Promise<Result>;
    updateTeam(teamId: bigint, name: string, ownerName: string, iconPlayerName: string): Promise<Result>;
    uploadTeamLogo(teamId: bigint, blob: ExternalBlob): Promise<Result>;
}
