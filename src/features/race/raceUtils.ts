import { DEFAULT_DIFFICULTY, getPromptEntries, getPromptPool, getPromptTopic } from '../../data/prompts';
import type { MatchScore, PromptDifficulty, RoundCount, RoundPlayerResult, RoundResult } from './raceTypes';

export const DEFAULT_PROMPT = getPromptPool(DEFAULT_DIFFICULTY)[0];
export const DEFAULT_ROUND_COUNT: RoundCount = 3;
export const ROUND_COUNT_OPTIONS = [1, 3, 5, 7, 10] as const;

export function getRandomPrompt(difficulty: PromptDifficulty, excludedPrompts: string[] = []) {
  const entries = getPromptEntries(difficulty);
  const excludedPromptSet = new Set(excludedPrompts);
  const excludedTopicSet = new Set(excludedPrompts.map(getPromptTopic).filter(Boolean));
  const unusedEntries = entries.filter((entry) => !excludedPromptSet.has(entry.text));
  const topicDiverseEntries = unusedEntries.filter((entry) => !excludedTopicSet.has(entry.topic));
  const promptPool =
    topicDiverseEntries.length > 0 ? topicDiverseEntries : unusedEntries.length > 0 ? unusedEntries : entries;

  return promptPool[Math.floor(Math.random() * promptPool.length)].text;
}

export function createRoundId() {
  return `round-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createMatchId() {
  return `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildMatchScores(results: RoundResult[]): MatchScore[] {
  const scoreMap = new Map<string, MatchScore>();

  for (const result of dedupeRoundResults(results)) {
    const winnerResult = result.players.find((player) => player.playerId === result.winner.playerId);
    const winnerCanScore = Boolean(winnerResult && !winnerResult.disqualified);

    for (const player of result.players) {
      const previous = scoreMap.get(player.playerId);
      const roundWins =
        (previous?.roundWins ?? 0) + (winnerCanScore && result.winner.playerId === player.playerId ? 1 : 0);
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

export function dedupePlayers<T extends PlayerRaceStateLikeWithId>(players: T[]) {
  const playerMap = new Map<string, T>();

  for (const player of players) {
    const previous = playerMap.get(player.playerId);

    if (!previous || (player.lastSeen ?? 0) >= (previous.lastSeen ?? 0)) {
      playerMap.set(player.playerId, player);
    }
  }

  return Array.from(playerMap.values());
}

export function dedupeRoundPlayers(players: RoundPlayerResult[]) {
  const playerMap = new Map<string, RoundPlayerResult>();

  for (const player of players) {
    const previous = playerMap.get(player.playerId);

    if (!previous || (player.finished && !previous.finished)) {
      playerMap.set(player.playerId, player);
      continue;
    }

    if (
      previous.finished === player.finished &&
      (player.finishMs ?? Number.MAX_SAFE_INTEGER) < (previous.finishMs ?? Number.MAX_SAFE_INTEGER)
    ) {
      playerMap.set(player.playerId, player);
    }
  }

  return Array.from(playerMap.values());
}

export function dedupeRoundResult(result: RoundResult): RoundResult {
  return {
    ...result,
    players: dedupeRoundPlayers(result.players),
  };
}

export function dedupeRoundResults(results: RoundResult[]) {
  const resultMap = new Map<string, RoundResult>();

  for (const result of results) {
    const key = result.roundId || `${result.matchId}:${result.roundNumber}`;

    if (!resultMap.has(key)) {
      resultMap.set(key, dedupeRoundResult(result));
    }
  }

  return Array.from(resultMap.values()).sort((first, second) => first.roundNumber - second.roundNumber);
}

export function dedupeMatchScores(scores: MatchScore[]) {
  const scoreMap = new Map<string, MatchScore>();

  for (const score of scores) {
    const previous = scoreMap.get(score.playerId);

    if (!previous || score.roundsPlayed >= previous.roundsPlayed) {
      scoreMap.set(score.playerId, score);
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
  return dedupePlayers(players).sort((first, second) => {
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
  playerId: string;
  displayName: string;
  isHost: boolean;
  finished: boolean;
  progress: number;
  lastSeen?: number;
};

type PlayerRaceStateLikeWithId = {
  playerId: string;
  lastSeen?: number;
};
