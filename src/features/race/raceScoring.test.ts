import {
  detectTypingSpam,
  getLiveDqTypedThreshold,
  getAccuracyPenaltyMs,
  hasReachedLiveDqTypedThreshold,
  isLiveAccuracyDisqualified,
  LIVE_DQ_REASON,
  scoreRoundPlayers,
  selectRoundWinner,
  shouldWarnBeforeLiveDq,
} from './raceScoring';
import type { RoundPlayerResult, RoundWinner } from './raceTypes';
import { avatarOptions } from '../../data/avatarOptions';

const avatar = avatarOptions[0];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function player(overrides: Partial<RoundPlayerResult> & Pick<RoundPlayerResult, 'playerId' | 'displayName' | 'accuracy'>) {
  const finishMs = overrides.finishMs ?? 12000;
  const accuracyPenaltyMs = overrides.accuracyPenaltyMs ?? getAccuracyPenaltyMs(overrides.accuracy);

  return {
    avatar,
    avatarId: avatar.id,
    wpm: 80,
    finished: true,
    finishMs,
    accuracyPenaltyMs,
    adjustedFinishMs: finishMs + accuracyPenaltyMs,
    spamDetected: false,
    disqualified: false,
    ...overrides,
  } satisfies RoundPlayerResult;
}

function fallback(players: RoundPlayerResult[]): RoundWinner {
  const first = players[0];

  return {
    playerId: first.playerId,
    displayName: first.displayName,
    wpm: first.wpm,
    accuracy: first.accuracy,
    finishMs: first.finishMs ?? 0,
    accuracyPenaltyMs: first.accuracyPenaltyMs,
    adjustedFinishMs: first.adjustedFinishMs ?? first.finishMs ?? 0,
  };
}

{
  assert(getLiveDqTypedThreshold(100) === 15, 'long prompts should use the 15 character DQ threshold');
  assert(getLiveDqTypedThreshold(40) === 10, 'shorter prompts should use the 25% DQ threshold');
  assert(!hasReachedLiveDqTypedThreshold(1, 100), 'one early typo should not reach the DQ threshold');
  assert(shouldWarnBeforeLiveDq(0, 1, 100), 'early low accuracy should warn before DQ');
  assert(!isLiveAccuracyDisqualified(0, 1, 100), 'early low accuracy should not instantly DQ');
  assert(isLiveAccuracyDisqualified(74, 15, 100), 'below 75% should DQ after 15 characters on long prompts');
  assert(isLiveAccuracyDisqualified(74, 10, 40), 'below 75% should DQ after 25% of shorter prompts');
  assert(!isLiveAccuracyDisqualified(75, 15, 100), '75% live accuracy should stay playable');
  assert(!isLiveAccuracyDisqualified(0, 0, 100), 'empty input should not be DQ');
}

{
  const players = [
    player({ playerId: 'accurate-fast', displayName: 'Accurate Fast', accuracy: 98, finishMs: 8000, wpm: 88 }),
    player({ playerId: 'less-accurate', displayName: 'Less Accurate', accuracy: 92, finishMs: 6000, wpm: 100 }),
  ];
  const winner = selectRoundWinner(players, fallback(players));

  assert(winner.playerId === 'accurate-fast', '98% accuracy fast finisher should win over lower accuracy');
  assert(winner.accuracyPenaltyMs === 0, '98% accuracy should not get a penalty');
}

{
  const finisher = player({ playerId: 'threshold', displayName: 'Threshold', accuracy: 85, finishMs: 9000 });
  const scored = scoreRoundPlayers([finisher])[0];

  assert(scored.accuracyPenaltyMs === 2000, '85% accuracy should receive a 2 second penalty');
  assert(scored.adjustedFinishMs === 11000, '85% adjusted time should include penalty');
  assert(!scored.disqualified, '85% accuracy should remain eligible');
}

{
  const players = [
    player({
      playerId: 'spammer',
      displayName: 'Spammer',
      accuracy: 30,
      finishMs: 3000,
      wpm: 220,
      spamDetected: true,
    }),
    player({ playerId: 'steady', displayName: 'Steady', accuracy: 88, finishMs: 15000, wpm: 68 }),
  ];
  const scoredSpammer = scoreRoundPlayers(players).find((result) => result.playerId === 'spammer');
  const winner = selectRoundWinner(players, fallback(players));

  assert(Boolean(scoredSpammer?.disqualified), '30% spammer should be disqualified');
  assert(winner.playerId === 'steady', '30% spammer should not win');
  assert(detectTypingSpam({ typed: 'asdfsdf;lkjasdf;lkj', prompt: 'steady typing wins the round', accuracy: 30 }), 'low accuracy mash should be spam');
}

{
  const players = [
    player({
      playerId: 'live-dq',
      displayName: 'Live DQ',
      accuracy: 74,
      finishMs: 4000,
      wpm: 120,
      disqualified: true,
      disqualificationReason: LIVE_DQ_REASON,
    }),
    player({ playerId: 'eligible', displayName: 'Eligible', accuracy: 84, finishMs: 12000, wpm: 70 }),
  ];
  const scoredLiveDq = scoreRoundPlayers(players).find((result) => result.playerId === 'live-dq');
  const winner = selectRoundWinner(players, fallback(players));

  assert(scoredLiveDq?.disqualificationReason === LIVE_DQ_REASON, 'live DQ reason should be preserved');
  assert(winner.playerId === 'eligible', 'live DQ player should not win');
}

{
  const players = [
    player({ playerId: 'seventy-five', displayName: 'Seventy Five', accuracy: 75, finishMs: 12000, wpm: 60 }),
    player({ playerId: 'seventy', displayName: 'Seventy', accuracy: 70, finishMs: 9000, wpm: 80 }),
  ];
  const scoredPlayers = scoreRoundPlayers(players);
  const winner = selectRoundWinner(players, fallback(players));

  assert(scoredPlayers.every((result) => !result.disqualified), 'all players below 80% should not be accuracy-DQ');
  assert(winner.playerId === 'seventy-five', 'when all players are below 80%, highest accuracy should win');
}

console.log('race scoring tests passed');
