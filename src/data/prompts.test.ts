import { difficultyOptions, getPromptEntries, getPromptPool } from './prompts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const minimumCounts = {
  easy: 500,
  medium: 500,
  hard: 500,
  demon: 500,
};

for (const difficulty of difficultyOptions) {
  const prompts = getPromptPool(difficulty);
  const entries = getPromptEntries(difficulty);
  const uniquePrompts = new Set(prompts);
  const uniqueTopics = new Set(entries.map((entry) => entry.topic));

  assert(prompts.length >= minimumCounts[difficulty], `${difficulty} prompt pool is too small`);
  assert(uniquePrompts.size === prompts.length, `${difficulty} prompt pool has duplicates`);
  assert(uniqueTopics.size >= 16, `${difficulty} prompt pool does not cover enough topics`);
}

console.log('prompt pool tests passed');
