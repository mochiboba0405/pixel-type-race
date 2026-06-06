import type { TypingMetrics } from './raceTypes';
import {
  alignTypedToFullPrompt,
  alignTypedToPromptPrefix,
  getAlignmentCounts,
  getEditDistance,
} from './typingAlignment';
import {
  detectTypingSpam,
  getAccuracyPenaltyMs,
  hasReachedLiveDqTypedThreshold,
  isLiveAccuracyDisqualified,
  LIVE_DQ_REASON,
  shouldWarnBeforeLiveDq,
} from './raceScoring';

export function countCorrectChars(prompt: string, typed: string) {
  return getAlignmentCounts(alignTypedToPromptPrefix(prompt, typed).tokens).matches;
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
  return getAlignmentCounts(alignTypedToPromptPrefix(prompt, typed).tokens).substitutions;
}

export function calculateTypingMetrics(prompt: string, typed: string, startedAt: number | null): TypingMetrics {
  const now = Date.now();
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const prefixAlignment = alignTypedToPromptPrefix(prompt, typed);
  const prefixCounts = getAlignmentCounts(prefixAlignment.tokens);
  const fullCounts = getAlignmentCounts(alignTypedToFullPrompt(prompt, typed).tokens);
  const finished = prompt.length > 0 && typed.length > 0 && prefixAlignment.promptEndIndex >= prompt.length;
  const editDistance = finished ? getEditDistance(prompt, typed) : prefixAlignment.editDistance;
  const comparedLength = Math.max(finished ? prompt.length : prefixAlignment.promptEndIndex, typed.length, 1);
  const activeCounts = finished ? fullCounts : prefixCounts;
  const correctChars = activeCounts.matches;
  const correctPrefix = countCorrectPrefix(prompt, typed);
  const incorrectChars = activeCounts.substitutions;
  const extraChars = activeCounts.insertions;
  const missingChars = activeCounts.missing;
  const progress = prompt.length > 0 ? Math.min(prefixAlignment.promptEndIndex / prompt.length, 1) : 0;
  const wpm = Math.round(typed.length / 5 / elapsedMinutes);
  const accuracy =
    typed.length === 0 ? 100 : Math.max(0, Math.round(((comparedLength - editDistance) / comparedLength) * 100));
  const accuracyPenaltyMs = getAccuracyPenaltyMs(accuracy);
  const spamDetected = detectTypingSpam({ typed, prompt, accuracy });
  const liveDqThresholdReached = hasReachedLiveDqTypedThreshold(typed.length, prompt.length);
  const liveDqWarning = shouldWarnBeforeLiveDq(accuracy, typed.length, prompt.length);
  const disqualified = isLiveAccuracyDisqualified(accuracy, typed.length, prompt.length);

  return {
    typedLength: typed.length,
    promptLength: prompt.length,
    correctChars,
    correctPrefix,
    incorrectChars,
    missingChars,
    extraChars,
    progress,
    wpm,
    accuracy,
    accuracyPenaltyMs,
    adjustedElapsedMs: elapsedMs + accuracyPenaltyMs,
    spamDetected,
    liveDqWarning,
    liveDqThresholdReached,
    disqualified,
    disqualificationReason: disqualified ? LIVE_DQ_REASON : undefined,
    elapsedMs,
    finished,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
