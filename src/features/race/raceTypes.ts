import type { AvatarOption } from '../profile/profileTypes';

export type RacePhase = 'lobby' | 'countdown' | 'racing' | 'finished';

export type ConnectionStatus = 'demo' | 'connecting' | 'online' | 'offline';

export type PlayerRaceState = {
  playerId: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  isHost: boolean;
  sceneryId: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishMs?: number;
  lastSeen: number;
};

export type RaceStartPayload = {
  prompt: string;
  roundId: string;
  startedAt: number;
  sceneryId: string;
};

export type SceneryChangePayload = {
  sceneryId: string;
};

export type RaceFinishPayload = {
  playerId: string;
  displayName: string;
  wpm: number;
  accuracy: number;
  finishMs: number;
  roundId: string;
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
