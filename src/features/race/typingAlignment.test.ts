import { calculateTypingMetrics } from './typingMetrics';
import { getEditDistance, getPromptDisplayTokens } from './typingAlignment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertKinds(prompt: string, typed: string, expectedKinds: string[]) {
  const actualKinds = getPromptDisplayTokens(prompt, typed).map((token) => token.kind);

  assert(
    actualKinds.join('|') === expectedKinds.join('|'),
    `${typed} vs ${prompt}: expected ${expectedKinds.join(', ')}, got ${actualKinds.join(', ')}`,
  );
}

assertKinds('keys', 'ketys', ['correct', 'correct', 'extra', 'correct', 'correct']);
assert(getEditDistance('keys', 'ketys') === 1, 'insertion typo should have edit distance 1');
assert(calculateTypingMetrics('keys', 'ketys', Date.now() - 1000).accuracy === 80, 'insertion accuracy should use edit distance');

assertKinds('keys', 'kys', ['correct', 'missing', 'correct', 'correct']);
assert(getEditDistance('keys', 'kys') === 1, 'missing character should have edit distance 1');
assert(calculateTypingMetrics('keys', 'kys', Date.now() - 1000).missingChars === 1, 'missing character should be counted');
assert(calculateTypingMetrics('keys', 'kys', Date.now() - 1000).finished, 'missing character should still allow finishing');

assertKinds('keys', 'keyss', ['correct', 'correct', 'correct', 'correct', 'extra']);
assert(getEditDistance('keys', 'keyss') === 1, 'extra character should have edit distance 1');
assert(calculateTypingMetrics('keys', 'keyss', Date.now() - 1000).extraChars === 1, 'extra character should be counted');

assertKinds('ready, set.', 'ready. set.', [
  'correct',
  'correct',
  'correct',
  'correct',
  'correct',
  'wrong',
  'correct',
  'correct',
  'correct',
  'correct',
  'correct',
]);
assert(getEditDistance('ready, set.', 'ready. set.') === 1, 'wrong punctuation should have edit distance 1');

assertKinds('Keys', 'keys', ['wrong', 'correct', 'correct', 'correct']);
assert(getEditDistance('Keys', 'keys') === 1, 'capitalization mistake should have edit distance 1');

{
  const earlyMetrics = calculateTypingMetrics('steady notes guide the room', 'x', Date.now() - 1000);

  assert(!earlyMetrics.disqualified, 'one early mistake should not mark typing metrics as DQ');
  assert(earlyMetrics.liveDqWarning, 'one early low-accuracy mistake should show a warning');
}

{
  const metrics = calculateTypingMetrics('steady notes guide the room', 'xxxxxxxxxxxxxxx', Date.now() - 1000);

  assert(metrics.disqualified, 'live accuracy below 75% should mark typing metrics as DQ');
  assert(
    metrics.disqualificationReason === 'Disqualified this round — accuracy dropped below 75%.',
    'live DQ metrics should include the player-facing reason',
  );
}

console.log('typing alignment tests passed');
