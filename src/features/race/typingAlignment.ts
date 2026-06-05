export type TypingAlignmentToken =
  | {
      kind: 'match' | 'substitution';
      promptChar: string;
      typedChar: string;
      promptIndex: number;
      typedIndex: number;
    }
  | {
      kind: 'missing';
      promptChar: string;
      promptIndex: number;
      typedIndex: null;
    }
  | {
      kind: 'insertion';
      typedChar: string;
      promptIndex: number;
      typedIndex: number;
    };

export type TypingDisplayToken = {
  kind: 'correct' | 'wrong' | 'missing' | 'extra' | 'current' | 'pending';
  char: string;
  promptIndex: number | null;
  typedIndex: number | null;
};

type AlignmentResult = {
  tokens: TypingAlignmentToken[];
  editDistance: number;
  promptEndIndex: number;
};

export function alignTypedToPromptPrefix(prompt: string, typed: string): AlignmentResult {
  const matrix = createEditDistanceMatrix(prompt, typed);
  const promptEndIndex = getBestPromptEndIndex(matrix, prompt.length, typed.length);

  return {
    tokens: backtrackAlignment(prompt, typed, matrix, promptEndIndex),
    editDistance: matrix[promptEndIndex][typed.length],
    promptEndIndex,
  };
}

export function alignTypedToFullPrompt(prompt: string, typed: string): AlignmentResult {
  const matrix = createEditDistanceMatrix(prompt, typed);

  return {
    tokens: backtrackAlignment(prompt, typed, matrix, prompt.length),
    editDistance: matrix[prompt.length][typed.length],
    promptEndIndex: prompt.length,
  };
}

export function getPromptDisplayTokens(prompt: string, typed: string): TypingDisplayToken[] {
  const alignment = alignTypedToPromptPrefix(prompt, typed);
  const displayTokens = alignment.tokens.map((token): TypingDisplayToken => {
    if (token.kind === 'match') {
      return {
        kind: 'correct',
        char: token.promptChar,
        promptIndex: token.promptIndex,
        typedIndex: token.typedIndex,
      };
    }

    if (token.kind === 'substitution') {
      return {
        kind: 'wrong',
        char: token.promptChar,
        promptIndex: token.promptIndex,
        typedIndex: token.typedIndex,
      };
    }

    if (token.kind === 'missing') {
      return {
        kind: 'missing',
        char: token.promptChar,
        promptIndex: token.promptIndex,
        typedIndex: null,
      };
    }

    return {
      kind: 'extra',
      char: token.typedChar,
      promptIndex: null,
      typedIndex: token.typedIndex,
    };
  });

  for (let index = alignment.promptEndIndex; index < prompt.length; index += 1) {
    displayTokens.push({
      kind: index === alignment.promptEndIndex ? 'current' : 'pending',
      char: prompt[index],
      promptIndex: index,
      typedIndex: null,
    });
  }

  return displayTokens;
}

export function getAlignmentCounts(tokens: TypingAlignmentToken[]) {
  return tokens.reduce(
    (counts, token) => {
      counts.matches += token.kind === 'match' ? 1 : 0;
      counts.substitutions += token.kind === 'substitution' ? 1 : 0;
      counts.missing += token.kind === 'missing' ? 1 : 0;
      counts.insertions += token.kind === 'insertion' ? 1 : 0;
      return counts;
    },
    {
      matches: 0,
      substitutions: 0,
      missing: 0,
      insertions: 0,
    },
  );
}

export function getEditDistance(prompt: string, typed: string) {
  const matrix = createEditDistanceMatrix(prompt, typed);
  return matrix[prompt.length][typed.length];
}

function createEditDistanceMatrix(prompt: string, typed: string) {
  const matrix = Array.from({ length: prompt.length + 1 }, () => Array(typed.length + 1).fill(0));

  for (let promptIndex = 0; promptIndex <= prompt.length; promptIndex += 1) {
    matrix[promptIndex][0] = promptIndex;
  }

  for (let typedIndex = 0; typedIndex <= typed.length; typedIndex += 1) {
    matrix[0][typedIndex] = typedIndex;
  }

  for (let promptIndex = 1; promptIndex <= prompt.length; promptIndex += 1) {
    for (let typedIndex = 1; typedIndex <= typed.length; typedIndex += 1) {
      const substitutionCost = prompt[promptIndex - 1] === typed[typedIndex - 1] ? 0 : 1;
      matrix[promptIndex][typedIndex] = Math.min(
        matrix[promptIndex - 1][typedIndex] + 1,
        matrix[promptIndex][typedIndex - 1] + 1,
        matrix[promptIndex - 1][typedIndex - 1] + substitutionCost,
      );
    }
  }

  return matrix;
}

function getBestPromptEndIndex(matrix: number[][], promptLength: number, typedLength: number) {
  const targetIndex = Math.min(promptLength, typedLength);
  let bestPromptIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestTargetDistance = Number.POSITIVE_INFINITY;

  for (let promptIndex = 0; promptIndex <= promptLength; promptIndex += 1) {
    const editDistance = matrix[promptIndex][typedLength];
    const targetDistance = Math.abs(promptIndex - targetIndex);

    if (
      editDistance < bestDistance ||
      (editDistance === bestDistance && targetDistance < bestTargetDistance) ||
      (editDistance === bestDistance && targetDistance === bestTargetDistance && promptIndex > bestPromptIndex)
    ) {
      bestPromptIndex = promptIndex;
      bestDistance = editDistance;
      bestTargetDistance = targetDistance;
    }
  }

  return bestPromptIndex;
}

function backtrackAlignment(
  prompt: string,
  typed: string,
  matrix: number[][],
  promptEndIndex: number,
): TypingAlignmentToken[] {
  const tokens: TypingAlignmentToken[] = [];
  let promptIndex = promptEndIndex;
  let typedIndex = typed.length;

  while (promptIndex > 0 || typedIndex > 0) {
    const promptChar = prompt[promptIndex - 1];
    const typedChar = typed[typedIndex - 1];
    const currentCost = matrix[promptIndex][typedIndex];

    if (
      promptIndex > 0 &&
      typedIndex > 0 &&
      typedIndex > promptIndex &&
      promptChar === typedChar &&
      currentCost === matrix[promptIndex][typedIndex - 1] + 1
    ) {
      tokens.push({
        kind: 'insertion',
        typedChar,
        promptIndex,
        typedIndex: typedIndex - 1,
      });
      typedIndex -= 1;
      continue;
    }

    if (
      promptIndex > 0 &&
      typedIndex > 0 &&
      promptChar === typedChar &&
      currentCost === matrix[promptIndex - 1][typedIndex - 1]
    ) {
      tokens.push({
        kind: 'match',
        promptChar,
        typedChar,
        promptIndex: promptIndex - 1,
        typedIndex: typedIndex - 1,
      });
      promptIndex -= 1;
      typedIndex -= 1;
      continue;
    }

    if (
      promptIndex > 0 &&
      typedIndex > 0 &&
      currentCost === matrix[promptIndex - 1][typedIndex - 1] + 1
    ) {
      tokens.push({
        kind: 'substitution',
        promptChar,
        typedChar,
        promptIndex: promptIndex - 1,
        typedIndex: typedIndex - 1,
      });
      promptIndex -= 1;
      typedIndex -= 1;
      continue;
    }

    if (typedIndex > 0 && currentCost === matrix[promptIndex][typedIndex - 1] + 1) {
      tokens.push({
        kind: 'insertion',
        typedChar,
        promptIndex,
        typedIndex: typedIndex - 1,
      });
      typedIndex -= 1;
      continue;
    }

    tokens.push({
      kind: 'missing',
      promptChar,
      promptIndex: promptIndex - 1,
      typedIndex: null,
    });
    promptIndex -= 1;
  }

  return tokens.reverse();
}
