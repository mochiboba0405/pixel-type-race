import type { AvatarOption } from '../profile/profileTypes';
import type { LocalStats } from '../profile/profileTypes';

export type RacePhase = 'lobby' | 'countdown' | 'racing' | 'round-results' | 'match-results';

export type RoundCount = 1 | 3 | 5 | 7 | 10;

export type ConnectionStatus = 'demo' | 'connecting' | 'online' | 'offline';

export type PromptDifficulty = 'easy' | 'medium' | 'hard' | 'demon';

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
  accuracyPenaltyMs: number;
  adjustedFinishMs?: number;
  spamDetected: boolean;
  disqualified: boolean;
  disqualificationReason?: string;
  lastSeen: number;
};

export type RaceStartPayload = {
  matchId: string;
  prompt: string;
  difficulty: PromptDifficulty;
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
  difficulty: PromptDifficulty;
};

export type DifficultyChangePayload = {
  difficulty: PromptDifficulty;
};

export type SceneryChangePayload = {
  sceneryId: string;
};

export type ChatMessage = {
  id: string;
  playerId: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  timestamp: number;
  text: string;
};

export type ChatMessagePayload = {
  message: ChatMessage;
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
  accuracyPenaltyMs: number;
  adjustedFinishMs: number;
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
  accuracyPenaltyMs: number;
  adjustedFinishMs?: number;
  spamDetected: boolean;
  disqualified: boolean;
  disqualificationReason?: string;
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
  typedLength: number;
  promptLength: number;
  correctChars: number;
  correctPrefix: number;
  incorrectChars: number;
  missingChars: number;
  extraChars: number;
  progress: number;
  wpm: number;
  accuracy: number;
  accuracyPenaltyMs: number;
  adjustedElapsedMs: number;
  spamDetected: boolean;
  liveDqWarning: boolean;
  liveDqThresholdReached: boolean;
  disqualified: boolean;
  disqualificationReason?: string;
  elapsedMs: number;
  finished: boolean;
};
