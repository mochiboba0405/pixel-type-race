import type { PromptDifficulty } from '../features/race/raceTypes';

export const DEFAULT_DIFFICULTY: PromptDifficulty = 'medium';

export const difficultyLabels: Record<PromptDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const difficultyOptions: PromptDifficulty[] = ['easy', 'medium', 'hard'];

const easyPrompts = [
  'tiny racers tap soft keys',
  'moon lights glow near neon roads',
  'pixel friends type and smile',
  'calm hands win the little race',
  'soft lights glow over the park',
  'happy keys click in the room',
  'fast feet cross the cute street',
  'brave players try one more round',
  'warm tea waits by the keyboard',
  'small stars shine above the track',
  'cozy friends cheer and type',
  'blue cars roll past quiet shops',
];

const mediumPrompts = [
  'Tiny keys click softly while pixel racers zoom past candy clouds.',
  'Brave beginners type one clean word at a time, then win the race.',
  'A cheerful keyboard can turn practice into a bright little adventure.',
  'Fast fingers help, but calm focus makes the finish line easier.',
  'Every typo is a small signpost pointing toward better rhythm.',
  'The moonlit arcade glows as friends race across the letter bridge.',
  'Fresh coffee, cozy lights, and steady typing make a perfect practice run.',
  'A good race starts with patience and ends with a happy victory dance.',
  'Neon windows blink gently while brave racers tap through the night.',
  'Tiny street lamps guide each player toward the glowing finish line.',
  'A quiet city hums below as every word becomes another step forward.',
  'Starry parks, soft clouds, and steady hands make the race feel magical.',
];

const hardPrompts = [
  'At 9:42 p.m., Mochee whispered, "Focus first, fireworks later," and typed 117 perfect characters.',
  'TheoDore dodged commas, quotes, and numbers: 14 lanes, 3 shortcuts, and one very stubborn semicolon.',
  'The cafe sign read "Open 24/7," but the racers still argued about capitalization, rhythm, and accuracy.',
  'In the neon district, quick-thinking players typed: careful words, crisp pauses, and zero panic.',
  'A tiny scoreboard flashed "Round 2 begins now," while everyone balanced speed, precision, and calm.',
  'Pixel pilots love tricky words like zephyr, queueing, awkward, rhythm, and kaleidoscope.',
  'When the clock hit 00:30, the host said, "Ready?" and the whole room answered with flying fingers.',
  'Bright buses, 8-bit billboards, and midnight rain made the city feel wonderfully impossible.',
  'Typing "co-op victory" is easy; typing it under pressure, with punctuation, is another quest.',
  'The final prompt included 3 numbers, 2 quotes, 1 comma, and a surprisingly sneaky capital Q.',
];

const easySubjects = ['little racers', 'pixel pals', 'tiny heroes', 'neon friends', 'sleepy typists'];
const easyVerbs = ['tap', 'race', 'jump', 'type', 'glow'];
const easyPlaces = ['under soft stars', 'by the blue road', 'near cozy shops', 'at moon park', 'past tiny lamps'];

const mediumOpeners = ['At the arcade', 'Under the sleepy skyline', 'Beside the cafe window', 'Across the moon bridge'];
const mediumActions = [
  'friends practice steady typing with bright smiles',
  'racers trade quick jokes before the next round',
  'tiny avatars chase the finish line with careful focus',
  'players find a smooth rhythm through every sentence',
];

const hardOpeners = ['At 11:07 p.m.', 'During Round 5', 'Inside "Neon Lane"', 'After 42 seconds'];
const hardActions = [
  'the racers balanced speed, accuracy, and one suspiciously wobbly keyboard',
  'someone typed "victory is cozy," then corrected 3 dramatic punctuation mistakes',
  'the scoreboard compared WPM, accuracy, finish time, and the courage to keep going',
  'every player handled capitals, commas, quotes, numbers, and tricky words like queueing',
];

export function getPromptPool(difficulty: PromptDifficulty) {
  if (difficulty === 'easy') {
    return easyPrompts;
  }

  if (difficulty === 'hard') {
    return hardPrompts;
  }

  return mediumPrompts;
}

export function createGeneratedPrompt(difficulty: PromptDifficulty) {
  if (difficulty === 'easy') {
    return `${pick(easySubjects)} ${pick(easyVerbs)} ${pick(easyPlaces)}`;
  }

  if (difficulty === 'hard') {
    return `${pick(hardOpeners)}, ${pick(hardActions)}.`;
  }

  return `${pick(mediumOpeners)}, ${pick(mediumActions)}.`;
}

function pick(values: string[]) {
  return values[Math.floor(Math.random() * values.length)];
}
