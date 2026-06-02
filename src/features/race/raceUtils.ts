import { prompts } from '../../data/prompts';
import type { MatchScore, RoundCount, RoundResult } from './raceTypes';

export const DEFAULT_PROMPT = prompts[0];
export const DEFAULT_ROUND_COUNT: RoundCount = 3;
export const ROUND_COUNT_OPTIONS = [1, 3, 5, 7, 10] as const;

export function getRandomPrompt(excludedPrompts: string[] = []) {
  const unusedPrompts = prompts.filter((prompt) => !excludedPrompts.includes(prompt));
  const promptPool = unusedPrompts.length > 0 ? unusedPrompts : prompts;
  return promptPool[Math.floor(Math.random() * promptPool.length)];
}

export function createRoundId() {
  return `round-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMatchId() {
  return `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildMatchScores(results: RoundResult[]): MatchScore[] {
  const scoreMap = new Map<string, MatchScore>();

  for (const result of results) {
    for (const player of result.players) {
      const previous = scoreMap.get(player.playerId);
      const roundWins = (previous?.roundWins ?? 0) + (result.winner.playerId === player.playerId ? 1 : 0);
      const roundsPlayed = (previous?.roundsPlayed ?? 0) + 1;
      const totalWpm = (previous?.totalWpm ?? 0) + player.wpm;
      const totalAccuracy = (previous?.totalAccuracy ?? 0) + player.accuracy;

      scoreMap.set(player.playerId, {
        playerId: player.playerId,
        displayName: player.displayName,
        avatarId: player.avatarId,
        avatar: player.avatar,
        roundWins,
        roundsPlayed,
        totalWpm,
        totalAccuracy,
        averageWpm: Math.round(totalWpm / roundsPlayed),
        averageAccuracy: Math.round(totalAccuracy / roundsPlayed),
      });
    }
  }

  return sortMatchScores(Array.from(scoreMap.values()));
}

export function sortMatchScores(scores: MatchScore[]) {
  return [...scores].sort(
    (first, second) =>
      second.roundWins - first.roundWins ||
      second.averageWpm - first.averageWpm ||
      second.averageAccuracy - first.averageAccuracy ||
      first.displayName.localeCompare(second.displayName),
  );
}

export function getMatchWinner(scores: MatchScore[]) {
  return sortMatchScores(scores)[0] ?? null;
}

export function isRoundCount(value: number): value is RoundCount {
  return ROUND_COUNT_OPTIONS.some((option) => option === value);
}

export function sortPlayers<T extends PlayerRaceStateLike>(players: T[]) {
  return [...players].sort((first, second) => {
    if (first.isHost !== second.isHost) {
      return first.isHost ? -1 : 1;
    }

    if (first.finished !== second.finished) {
      return first.finished ? -1 : 1;
    }

    return second.progress - first.progress || first.displayName.localeCompare(second.displayName);
  });
}

type PlayerRaceStateLike = {
  displayName: string;
  isHost: boolean;
  finished: boolean;
  progress: number;
};
