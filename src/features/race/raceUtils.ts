import { prompts } from '../../data/prompts';

export const DEFAULT_PROMPT = prompts[0];

export function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function createRoundId() {
  return `round-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
