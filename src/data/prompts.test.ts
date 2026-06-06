import { difficultyOptions, getPromptPool } from './prompts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const minimumCounts = {
  easy: 100,
  medium: 200,
  hard: 300,
  demon: 200,
};

for (const difficulty of difficultyOptions) {
  const prompts = getPromptPool(difficulty);
  const uniquePrompts = new Set(prompts);

  assert(prompts.length >= minimumCounts[difficulty], `${difficulty} prompt pool is too small`);
  assert(uniquePrompts.size === prompts.length, `${difficulty} prompt pool has duplicates`);
}

console.log('prompt pool tests passed');
