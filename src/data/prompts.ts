import type { PromptDifficulty } from '../features/race/raceTypes';

export const DEFAULT_DIFFICULTY: PromptDifficulty = 'medium';

export const difficultyLabels: Record<PromptDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const difficultyOptions: PromptDifficulty[] = ['easy', 'medium', 'hard'];

const easySeedPrompts = [
  'warm lights glow on the street',
  'kind friends share fresh tea',
  'soft music fills the room',
  'blue trains roll past shops',
  'small stars shine above town',
  'calm hands make neat notes',
  'fresh bread waits on the table',
  'bright signs light the road',
  'quiet rain taps the window',
  'happy teams help each other',
  'paper kites drift over hills',
  'cozy rooms feel safe and warm',
];

const easyGroups = [
  'kind friends',
  'happy neighbors',
  'busy cooks',
  'calm students',
  'brave helpers',
  'little painters',
  'new teammates',
  'quiet readers',
  'city riders',
  'morning bakers',
  'garden helpers',
  'cozy friends',
  'bright makers',
  'careful builders',
  'gentle dreamers',
  'street vendors',
  'paper artists',
  'window shoppers',
  'music fans',
  'moon watchers',
];

const easyActions = [
  'walk slowly',
  'share snacks',
  'wave hello',
  'make tea',
  'plant seeds',
  'fold maps',
  'carry bags',
  'clean desks',
  'sing softly',
  'draw stars',
];

const easyPlaces = [
  'near the window',
  'by the road',
  'under soft stars',
  'at the park',
  'beside the cafe',
  'over the hill',
  'in the room',
  'past the bridge',
  'around the corner',
  'on the table',
];

const mediumSeedPrompts = [
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
  'The lobby grows lively as new friends join the room, choose cozy avatars, and wait for the countdown together.',
  'Careful racers keep typing through mistakes, watch the prompt wrap neatly, and finish the round with a calm smile.',
];

const mediumSubjects = [
  'The morning bakery',
  'A quiet library',
  'The corner market',
  'A warm kitchen',
  'The tiny studio',
  'A busy train station',
  'The community garden',
  'A silver elevator',
  'The neighborhood cafe',
  'A clean workshop',
  'The rooftop patio',
  'A friendly classroom',
  'The music room',
  'A small bookstore',
  'The city bus',
  'A bright museum',
  'The picnic table',
  'A cozy office',
  'The rainlit sidewalk',
  'A sunny kitchen',
];

const mediumActions = [
  'opened early, and a calm line formed by the door.',
  'felt peaceful while soft music played in the background.',
  'shimmered under warm lights, ready for a busy afternoon.',
  'held a quiet conversation about plans, weather, and dinner.',
  'kept everyone comfortable as the evening settled in.',
  'welcomed a new idea, then turned it into a simple plan.',
  'was full of color, fresh notes, and friendly smiles.',
  'paused for a moment before the next task began.',
  'made ordinary errands feel bright, useful, and easy.',
  'reminded the group to slow down, breathe, and begin again.',
];

const hardSeedPrompts = [
  'At 9:42 p.m., Mochee whispered, "Focus first, fireworks later," and typed 117 careful characters.',
  'TheoDore dodged commas, quotes, and numbers: 14 lanes, 3 shortcuts, and one very stubborn semicolon.',
  'The cafe sign read "Open 24/7," but the racers still argued about capitalization, rhythm, and accuracy.',
  'In the neon district, quick-thinking players typed: careful words, crisp pauses, and zero panic.',
  'A tiny scoreboard flashed "Round 2 begins now," while everyone balanced speed, precision, and calm.',
  'The studio list included zephyr, queueing, awkward, rhythm, and kaleidoscope; every word needed attention.',
  'When the clock hit 00:30, the host said, "Ready?" and the whole room answered with flying fingers.',
  'Bright buses, 8-bit billboards, and midnight rain made the city feel wonderfully impossible.',
  'Typing "co-op victory" is easy; typing it under pressure, with punctuation, is another challenge.',
  'The final prompt included 3 numbers, 2 quotes, 1 comma, and a surprisingly sneaky capital Q.',
  'At exactly 10:18 p.m., the host selected Hard mode, whispered "steady hands," and sent everyone a long challenge.',
  'The neon scoreboard compared 58 WPM, 96% accuracy, 2 finish times, and one hyper-focused typing streak.',
];

const hardSubjects = [
  'At 7:15 a.m., the neighborhood planner',
  'During the 3rd budget review, Mina',
  'Inside Studio 204, the design team',
  'Before the 12-minute timer expired, Jordan',
  'On the rainlit platform, the station manager',
  'After reading "Chapter 6," the study group',
  'While the clock displayed 21:09, the cafe owner',
  'Near the mural labeled "Begin Again," Priya',
  'During a careful inventory count, the shop team',
  'At the community meeting, Alex',
  'Before sending Version 2.0, the editor',
  'After comparing 14 color samples, the artist',
  'While reviewing the route map, the driver',
  'At Table 8, the workshop coordinator',
  'During the midnight maintenance window, Sam',
  'Beside the sign that read "Please Reset," the technician',
  'After sorting 37 index cards, the librarian',
  'While the dashboard showed 99.4%, the analyst',
  'During a quiet planning call, the project lead',
  'At the end of a long Tuesday, the team captain',
];

const hardActions = [
  'said, "Start with clarity," then sorted 18 notes, 4 sketches, and 2 careful reminders.',
  'balanced quick decisions, patient questions, and a checklist labeled "Version 2.0."',
  'compared coffee receipts, train times, and weather alerts; the numbers refused to line up.',
  'wrote, "Small steps still count," across the top of page 47, then underlined it twice.',
  'noticed that 6 tiny errors, 3 missing labels, and 1 loose cable could delay the plan.',
  'measured the hallway twice; first at 28 feet, then at 28 feet and 6 inches.',
  'saved a draft named "final-final-really-final.txt," paused, and laughed at the obvious problem.',
  'explained the schedule clearly: arrive by 8:05, review at 8:30, and present before 9:00.',
  'arranged blue folders, yellow sticky notes, and white cards; every stack needed a label.',
  'tested the backup plan with 5 volunteers, 2 spare chargers, and one calm checklist.',
  'revised the sentence until its rhythm felt precise, generous, and just a little surprising.',
  'described the room as "bright, narrow, and full of possible solutions," which sounded exactly right.',
  'prepared a simple rule: if the first idea fails, try the second one without drama.',
  'asked, "Which detail matters most?" then waited through a useful, thoughtful silence.',
  'finished the report at 11:58 p.m.; the title, summary, and footnotes were finally consistent.',
];

const easyPromptPool = buildPromptPool(
  easySeedPrompts,
  buildEasyPrompts(),
  120,
);
const mediumPromptPool = buildPromptPool(
  mediumSeedPrompts,
  buildCombinations(mediumSubjects, mediumActions, (subject, action) => `${subject} ${action}`),
  220,
);
const hardPromptPool = buildPromptPool(
  hardSeedPrompts,
  buildCombinations(hardSubjects, hardActions, (subject, action) => `${subject} ${action}`),
  320,
);

export function getPromptPool(difficulty: PromptDifficulty) {
  if (difficulty === 'easy') {
    return easyPromptPool;
  }

  if (difficulty === 'hard') {
    return hardPromptPool;
  }

  return mediumPromptPool;
}

export function createGeneratedPrompt(difficulty: PromptDifficulty) {
  return pick(getPromptPool(difficulty));
}

function buildEasyPrompts() {
  const prompts: string[] = [];

  for (const group of easyGroups) {
    for (const action of easyActions) {
      prompts.push(`${group} ${action} ${easyPlaces[prompts.length % easyPlaces.length]}`);
    }
  }

  return prompts;
}

function buildCombinations(
  firstValues: string[],
  secondValues: string[],
  format: (firstValue: string, secondValue: string) => string,
) {
  const prompts: string[] = [];

  for (const firstValue of firstValues) {
    for (const secondValue of secondValues) {
      prompts.push(format(firstValue, secondValue));
    }
  }

  return prompts;
}

function buildPromptPool(seedPrompts: string[], generatedPrompts: string[], targetCount: number) {
  return Array.from(new Set([...seedPrompts, ...generatedPrompts])).slice(0, targetCount);
}

function pick(values: string[]) {
  return values[Math.floor(Math.random() * values.length)];
}
