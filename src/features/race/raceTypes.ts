import type { AvatarOption } from '../profile/profileTypes';
import type { LocalStats } from '../profile/profileTypes';

export type RacePhase = 'lobby' | 'countdown' | 'racing' | 'round-results' | 'match-results';

export type RoundCount = 1 | 3 | 5 | 7 | 10;

export type ConnectionStatus = 'demo' | 'connecting' | 'online' | 'offline';

export type PlayerRaceState = {
  playerId: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  favoriteSceneryId: string;
  profileStats: LocalStats;
  isHost: boolean;
  sceneryId: string;
  totalRounds: RoundCount;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishMs?: number;
  lastSeen: number;
};

export type RaceStartPayload = {
  matchId: string;
  prompt: string;
  roundId: string;
  roundNumber: number;
  totalRounds: RoundCount;
  startedAt: number;
  sceneryId: string;
};

export type NextRoundPayload = {
  matchId: string;
  roundNumber: number;
  totalRounds: RoundCount;
};

export type ResetRoundProgressPayload = {
  matchId: string;
  roundId: string;
  roundNumber: number;
  totalRounds: RoundCount;
};

export type MatchConfigPayload = {
  totalRounds: RoundCount;
};

export type SceneryChangePayload = {
  sceneryId: string;
};

export type PlayerProgressPayload = {
  player: PlayerRaceState;
};

export type RoundWinner = {
  playerId: string;
  displayName: string;
  wpm: number;
  accuracy: number;
  finishMs: number;
};

export type RoundPlayerResult = {
  playerId: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishMs?: number;
};

export type RoundResult = {
  matchId: string;
  roundId: string;
  roundNumber: number;
  totalRounds: RoundCount;
  winner: RoundWinner;
  players: RoundPlayerResult[];
};

export type RaceFinishPayload = {
  matchId: string;
  roundId: string;
  roundNumber: number;
  totalRounds: RoundCount;
  winner: RoundWinner;
  result: RoundResult;
};

export type MatchResultsPayload = {
  matchId: string;
  totalRounds: RoundCount;
  roundResults: RoundResult[];
  scores: MatchScore[];
  winner: MatchScore | null;
};

export type MatchScore = {
  playerId: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  roundWins: number;
  roundsPlayed: number;
  totalWpm: number;
  totalAccuracy: number;
  averageWpm: number;
  averageAccuracy: number;
};

export type TypingMetrics = {
  correctChars: number;
  correctPrefix: number;
  progress: number;
  wpm: number;
  accuracy: number;
  elapsedMs: number;
  finished: boolean;
};
