import type { RoundPlayerResult, RoundWinner } from './raceTypes';

export const WIN_ACCURACY_THRESHOLD = 80;
export const DISQUALIFY_ACCURACY_THRESHOLD = 80;
export const LIVE_DQ_ACCURACY_THRESHOLD = 75;
export const LIVE_DQ_MIN_TYPED_CHARS = 15;
export const LIVE_DQ_PROMPT_RATIO = 0.25;
export const LIVE_DQ_WARNING = 'Careful — accuracy matters!';
export const LIVE_DQ_REASON = 'Disqualified this round — accuracy dropped below 75%.';
export const FINAL_ACCURACY_DQ_REASON = 'Accuracy below 80%';
export const SPAM_DQ_REASON = 'Spam detected';
const SPAM_ACCURACY_THRESHOLD = 50;
const SPAM_EXTRA_LENGTH_RATIO = 1.35;
const SPAM_EXTRA_LENGTH_BUFFER = 12;
const MIN_SPAM_TYPED_LENGTH = 8;

export type SpamCheckInput = {
  typed: string;
  prompt: string;
  accuracy: number;
};

export function getAccuracyPenaltyMs(accuracy: number) {
  if (accuracy < 85) {
    return 3000;
  }

  if (accuracy < 90) {
    return 2000;
  }

  if (accuracy < 95) {
    return 1000;
  }

  return 0;
}

export function detectTypingSpam({ typed, prompt, accuracy }: SpamCheckInput) {
  if (typed.length < MIN_SPAM_TYPED_LENGTH) {
    return false;
  }

  const isMuchLongerThanPrompt =
    typed.length > prompt.length * SPAM_EXTRA_LENGTH_RATIO && typed.length - prompt.length >= SPAM_EXTRA_LENGTH_BUFFER;
  const hasLongRepeatedRun = /(.)\1{7,}/.test(typed);
  const hasKeyboardMashPattern = /(asdf|fdsa|qwer|rewq|hjkl|lkjh|zxcv|vcxz){2,}/i.test(typed);

  return accuracy < SPAM_ACCURACY_THRESHOLD || isMuchLongerThanPrompt || hasLongRepeatedRun || hasKeyboardMashPattern;
}

export function getLiveDqTypedThreshold(promptLength: number) {
  const promptRatioThreshold =
    promptLength > 0 ? Math.ceil(promptLength * LIVE_DQ_PROMPT_RATIO) : LIVE_DQ_MIN_TYPED_CHARS;

  return Math.max(1, Math.min(LIVE_DQ_MIN_TYPED_CHARS, promptRatioThreshold));
}

export function hasReachedLiveDqTypedThreshold(typedLength: number, promptLength: number) {
  return typedLength >= getLiveDqTypedThreshold(promptLength);
}

export function shouldWarnBeforeLiveDq(accuracy: number, typedLength: number, promptLength: number) {
  return (
    typedLength > 0 &&
    accuracy < LIVE_DQ_ACCURACY_THRESHOLD &&
    !hasReachedLiveDqTypedThreshold(typedLength, promptLength)
  );
}

export function isLiveAccuracyDisqualified(accuracy: number, typedLength: number, promptLength: number) {
  return (
    typedLength > 0 &&
    accuracy < LIVE_DQ_ACCURACY_THRESHOLD &&
    hasReachedLiveDqTypedThreshold(typedLength, promptLength)
  );
}

export function scoreRoundPlayers(players: RoundPlayerResult[]) {
  const finishedPlayers = players.filter((player) => player.finished);
  const scoredPlayers = players.map((player) => {
    const accuracyPenaltyMs = player.accuracyPenaltyMs ?? getAccuracyPenaltyMs(player.accuracy);
    const adjustedFinishMs = player.finishMs === undefined ? undefined : player.finishMs + accuracyPenaltyMs;
    const spamDetected = player.spamDetected ?? false;

    return {
      ...player,
      accuracyPenaltyMs,
      adjustedFinishMs,
      spamDetected,
      disqualified: player.disqualified ?? false,
      disqualificationReason: player.disqualificationReason,
    };
  });
  const allFinishedPlayersBelow80 =
    finishedPlayers.length > 0 &&
    finishedPlayers.every((player) => player.accuracy < DISQUALIFY_ACCURACY_THRESHOLD);

  return scoredPlayers.map((player) => {
    const isLiveDisqualified = player.finished && player.disqualificationReason === LIVE_DQ_REASON;
    const isAccuracyDisqualified =
      player.finished && player.accuracy < DISQUALIFY_ACCURACY_THRESHOLD && !allFinishedPlayersBelow80;
    const isSpamDisqualified = player.finished && player.spamDetected;
    const disqualified = player.disqualified || isLiveDisqualified || isAccuracyDisqualified || isSpamDisqualified;

    return {
      ...player,
      disqualified,
      disqualificationReason: isLiveDisqualified
        ? LIVE_DQ_REASON
        : isSpamDisqualified
          ? SPAM_DQ_REASON
          : isAccuracyDisqualified
            ? FINAL_ACCURACY_DQ_REASON
            : player.disqualificationReason,
    };
  });
}

export function selectRoundWinner(players: RoundPlayerResult[], fallbackWinner: RoundWinner): RoundWinner {
  const scoredPlayers = scoreRoundPlayers(players);
  const finishedPlayers = scoredPlayers.filter((player) => player.finished);
  const accuratePlayers = finishedPlayers.filter(
    (player) => !player.disqualified && !player.spamDetected && player.accuracy >= WIN_ACCURACY_THRESHOLD,
  );
  const fallbackEligiblePlayers = finishedPlayers.filter((player) => !player.disqualified && !player.spamDetected);
  const winnerPool = accuratePlayers.length > 0 ? accuratePlayers : fallbackEligiblePlayers;
  const sortedWinners = [...winnerPool].sort(compareRoundWinners);
  const winner = sortedWinners[0] ?? [...finishedPlayers].sort(compareRoundWinners)[0];

  if (!winner) {
    return fallbackWinner;
  }

  return {
    playerId: winner.playerId,
    displayName: winner.displayName,
    wpm: winner.wpm,
    accuracy: winner.accuracy,
    finishMs: winner.finishMs ?? fallbackWinner.finishMs,
    accuracyPenaltyMs: winner.accuracyPenaltyMs,
    adjustedFinishMs: winner.adjustedFinishMs ?? winner.finishMs ?? fallbackWinner.adjustedFinishMs,
  };
}

function compareRoundWinners(first: RoundPlayerResult, second: RoundPlayerResult) {
  return (
    second.accuracy - first.accuracy ||
    (first.adjustedFinishMs ?? Number.MAX_SAFE_INTEGER) -
      (second.adjustedFinishMs ?? Number.MAX_SAFE_INTEGER) ||
    second.wpm - first.wpm ||
    first.displayName.localeCompare(second.displayName)
  );
}
