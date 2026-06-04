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

export function countIncorrectChars(prompt: string, typed: string) {
  let incorrect = 0;
  const comparedLength = Math.min(prompt.length, typed.length);

  for (let index = 0; index < comparedLength; index += 1) {
    if (typed[index] !== prompt[index]) {
      incorrect += 1;
    }
  }

  return incorrect;
}

export function calculateTypingMetrics(prompt: string, typed: string, startedAt: number | null): TypingMetrics {
  const now = Date.now();
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const correctChars = countCorrectChars(prompt, typed);
  const correctPrefix = countCorrectPrefix(prompt, typed);
  const incorrectChars = countIncorrectChars(prompt, typed);
  const extraChars = Math.max(0, typed.length - prompt.length);
  const missingChars = Math.max(0, prompt.length - typed.length);
  const comparedLength = Math.max(prompt.length, typed.length, 1);
  const progress = prompt.length > 0 ? Math.min(typed.length / prompt.length, 1) : 0;
  const wpm = Math.round(typed.length / 5 / elapsedMinutes);
  const accuracy = typed.length === 0 ? 100 : Math.max(0, Math.round((correctChars / comparedLength) * 100));

  return {
    correctChars,
    correctPrefix,
    incorrectChars,
    missingChars,
    extraChars,
    progress,
    wpm,
    accuracy,
    elapsedMs,
    finished: prompt.length > 0 && typed.length >= prompt.length,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
