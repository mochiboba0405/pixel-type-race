import type { TypingMetrics } from './raceTypes';

export function countCorrectChars(prompt: string, typed: string) {
  let correct = 0;

  for (let index = 0; index < typed.length; index += 1) {
    if (typed[index] === prompt[index]) {
      correct += 1;
    }
  }

  return correct;
}

export function countCorrectPrefix(prompt: string, typed: string) {
  let correct = 0;

  for (let index = 0; index < typed.length && index < prompt.length; index += 1) {
    if (typed[index] !== prompt[index]) {
      break;
    }

    correct += 1;
  }

  return correct;
}

export function calculateTypingMetrics(prompt: string, typed: string, startedAt: number | null): TypingMetrics {
  const now = Date.now();
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const correctChars = countCorrectChars(prompt, typed);
  const correctPrefix = countCorrectPrefix(prompt, typed);
  const progress = prompt.length > 0 ? Math.min(correctPrefix / prompt.length, 1) : 0;
  const wpm = Math.round(correctChars / 5 / elapsedMinutes);
  const accuracy = typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 100);

  return {
    correctChars,
    correctPrefix,
    progress,
    wpm,
    accuracy,
    elapsedMs,
    finished: typed === prompt,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
