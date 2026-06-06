import type { PromptDifficulty } from '../features/race/raceTypes';

export type PromptTopic =
  | 'everyday'
  | 'travel'
  | 'food'
  | 'animals'
  | 'science'
  | 'technology'
  | 'history'
  | 'hobbies'
  | 'nature'
  | 'sports'
  | 'facts'
  | 'storytelling'
  | 'observations'
  | 'workplace'
  | 'school'
  | 'fictional';

export type PromptEntry = {
  text: string;
  topic: PromptTopic;
};

type TopicBank = {
  topic: PromptTopic;
  actors: string[];
  actions: string[];
  items: string[];
  places: string[];
  details: string[];
};

export const DEFAULT_DIFFICULTY: PromptDifficulty = 'medium';

export const difficultyLabels: Record<PromptDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  demon: 'Demon Mode',
};

export const difficultyStatusLabels: Record<PromptDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  demon: 'Demon',
};

export const difficultyOptions: PromptDifficulty[] = ['easy', 'medium', 'hard', 'demon'];

const promptTopics: TopicBank[] = [
  {
    topic: 'everyday',
    actors: ['a busy neighbor', 'the morning bus', 'a quiet shopper', 'the hallway light', 'a careful cook', 'the mail carrier'],
    actions: ['carries', 'sorts', 'wipes', 'checks', 'folds', 'shares'],
    items: ['fresh laundry', 'paper bags', 'clean dishes', 'a small note', 'warm towels', 'a grocery list'],
    places: ['the front step', 'the kitchen sink', 'a corner store', 'the apartment lobby', 'the laundry room', 'a sunny window'],
    details: ['the kettle sings softly', 'a timer blinks twice', 'the floor smells like soap', 'the door closes gently', 'a pencil rolls away', 'the clock gains a minute'],
  },
  {
    topic: 'travel',
    actors: ['a weekend traveler', 'the station guide', 'a map reader', 'the airport clerk', 'a train conductor', 'a backpacker'],
    actions: ['follows', 'packs', 'checks', 'marks', 'crosses', 'studies'],
    items: ['a paper ticket', 'the blue route', 'a small suitcase', 'a city map', 'a hotel key', 'a ferry pass'],
    places: ['the rail platform', 'a quiet terminal', 'the harbor gate', 'a mountain road', 'the hostel desk', 'a narrow bridge'],
    details: ['the departure board changes', 'clouds cover the runway', 'the suitcase wheel squeaks', 'a passport stamp dries', 'the guidebook loses a page', 'the taxi meter resets'],
  },
  {
    topic: 'food',
    actors: ['a bakery owner', 'the lunch crew', 'a soup maker', 'a market vendor', 'the night chef', 'a picnic planner'],
    actions: ['stirs', 'slices', 'serves', 'tastes', 'wraps', 'labels'],
    items: ['tomato soup', 'fresh noodles', 'lemon rice', 'warm bread', 'green salad', 'apple pie'],
    places: ['a cafe table', 'the pantry shelf', 'a street cart', 'the breakfast counter', 'a picnic blanket', 'the spice drawer'],
    details: ['steam curls over the bowl', 'the recipe card bends', 'a spoon taps the glass', 'the oven light glows', 'salt lands on the counter', 'the menu gets rewritten'],
  },
  {
    topic: 'animals',
    actors: ['a calm zookeeper', 'the rescue volunteer', 'a bird watcher', 'a marine biologist', 'the farmhand', 'a pet sitter'],
    actions: ['feeds', 'observes', 'tracks', 'counts', 'guides', 'brushes'],
    items: ['sleepy pandas', 'bright parrots', 'harbor seals', 'gentle horses', 'tiny kittens', 'busy ants'],
    places: ['the shaded habitat', 'a quiet stable', 'the tide pool', 'a garden path', 'the adoption room', 'a forest hideout'],
    details: ['a tail flicks once', 'feathers shine after rain', 'paw prints cross the dust', 'the water ripples slowly', 'a collar tag jingles', 'the nest sits high'],
  },
  {
    topic: 'science',
    actors: ['a lab assistant', 'the astronomy club', 'a geology student', 'the weather team', 'a chemistry teacher', 'the microscope operator'],
    actions: ['measures', 'records', 'compares', 'tests', 'labels', 'calculates'],
    items: ['moon phases', 'crystal samples', 'rainfall totals', 'seed growth', 'clear beakers', 'magnetic fields'],
    places: ['the school lab', 'a rooftop observatory', 'the river bank', 'a clean workbench', 'the greenhouse shelf', 'the planetarium dome'],
    details: ['the sample changes color', 'a graph slopes upward', 'the lens needs cleaning', 'one reading looks unusual', 'the timer reaches zero', 'the notebook fills quickly'],
  },
  {
    topic: 'technology',
    actors: ['a patient coder', 'the support desk', 'a robotics team', 'the app designer', 'a network admin', 'the hardware tester'],
    actions: ['debugs', 'updates', 'connects', 'reviews', 'backs up', 'calibrates'],
    items: ['a login screen', 'new firmware', 'a tiny sensor', 'the server log', 'a broken cable', 'a dashboard widget'],
    places: ['the computer lab', 'a quiet office', 'the server room', 'a maker space', 'the help desk', 'a test bench'],
    details: ['the cursor blinks steadily', 'the fan spins faster', 'an error code appears', 'the battery reaches full', 'the cable clicks in', 'the graph refreshes'],
  },
  {
    topic: 'history',
    actors: ['a museum guide', 'the archive clerk', 'a history student', 'the city historian', 'a map conservator', 'the tour group'],
    actions: ['studies', 'restores', 'dates', 'compares', 'catalogs', 'explains'],
    items: ['old letters', 'stone bridges', 'ancient coins', 'a faded map', 'railway posters', 'family records'],
    places: ['the west gallery', 'a reading room', 'the town square', 'a stone courtyard', 'the archive basement', 'a restored station'],
    details: ['ink fades at the edge', 'the plaque lists three names', 'dust glows in sunlight', 'a date is hard to read', 'the frame hangs level', 'the guide lowers their voice'],
  },
  {
    topic: 'hobbies',
    actors: ['a weekend painter', 'the chess club', 'a guitar student', 'the knitting circle', 'a model builder', 'the dance class'],
    actions: ['practices', 'sketches', 'tunes', 'assembles', 'trades', 'collects'],
    items: ['watercolor clouds', 'silver strings', 'wooden pieces', 'soft yarn', 'paper stamps', 'tiny model parts'],
    places: ['the art table', 'a music room', 'the hobby shelf', 'a community hall', 'the craft fair', 'a sunny porch'],
    details: ['paint dries too quickly', 'a chord rings clearly', 'the pattern repeats neatly', 'glue sets overnight', 'the final move surprises everyone', 'a ribbon wins second place'],
  },
  {
    topic: 'nature',
    actors: ['a trail ranger', 'the garden club', 'a river guide', 'the forest path', 'a park volunteer', 'the morning tide'],
    actions: ['plants', 'clears', 'follows', 'protects', 'counts', 'watches'],
    items: ['young trees', 'river stones', 'wildflowers', 'tide marks', 'fallen leaves', 'fresh seedlings'],
    places: ['the pine trail', 'a quiet meadow', 'the canyon edge', 'a coastal path', 'the community garden', 'a rain garden'],
    details: ['mist lifts from the grass', 'sunlight catches the water', 'roots hold the hillside', 'a breeze cools the path', 'the soil smells fresh', 'clouds gather slowly'],
  },
  {
    topic: 'sports',
    actors: ['a soccer coach', 'the swim team', 'a tennis player', 'the cycling group', 'a track runner', 'the basketball captain'],
    actions: ['trains', 'passes', 'times', 'stretches', 'practices', 'celebrates'],
    items: ['a clean serve', 'lane markers', 'new cleats', 'a water bottle', 'practice cones', 'the final score'],
    places: ['the gym floor', 'a quiet court', 'the running track', 'a pool deck', 'the practice field', 'a bike lane'],
    details: ['the whistle sounds once', 'the scoreboard resets', 'a shoe lace comes loose', 'the crowd claps politely', 'the coach checks a clipboard', 'rain delays the drill'],
  },
  {
    topic: 'facts',
    actors: ['a trivia host', 'the fact checker', 'a curious reader', 'the library desk', 'a quiz writer', 'the science column'],
    actions: ['notes', 'explains', 'verifies', 'collects', 'shares', 'compares'],
    items: ['planet sizes', 'calendar quirks', 'ocean depths', 'language roots', 'city names', 'measurement units'],
    places: ['a reference shelf', 'the quiz board', 'a radio booth', 'the study table', 'a classroom wall', 'the newspaper office'],
    details: ['the answer sounds unlikely', 'one number changes everything', 'the source gets checked twice', 'a footnote saves time', 'the chart uses tiny print', 'the question starts a debate'],
  },
  {
    topic: 'storytelling',
    actors: ['a young narrator', 'the bookstore owner', 'a letter writer', 'the campfire circle', 'a comic artist', 'the page turner'],
    actions: ['begins', 'describes', 'imagines', 'revises', 'draws', 'reveals'],
    items: ['a secret door', 'lost postcards', 'a silver key', 'the last chapter', 'a brave promise', 'a hidden message'],
    places: ['a quiet attic', 'the final page', 'a moonlit lane', 'the old theater', 'a painted hallway', 'the village square'],
    details: ['the ending changes twice', 'a clue hides in plain sight', 'the title finally makes sense', 'the hero chooses kindness', 'the letter arrives late', 'the map points north'],
  },
  {
    topic: 'observations',
    actors: ['a window watcher', 'the street lamp', 'a careful listener', 'the notebook keeper', 'a balcony sitter', 'the train window'],
    actions: ['notices', 'counts', 'hears', 'sketches', 'follows', 'remembers'],
    items: ['passing umbrellas', 'distant bells', 'light on glass', 'quiet footsteps', 'shadows on brick', 'steam from vents'],
    places: ['a rainy corner', 'the second floor', 'a subway platform', 'the cafe window', 'a brick alley', 'the office lobby'],
    details: ['a reflection bends sideways', 'the same song plays again', 'colors look brighter after rain', 'a sign swings slowly', 'the room grows still', 'someone laughs downstairs'],
  },
  {
    topic: 'workplace',
    actors: ['a project manager', 'the design team', 'a new intern', 'the finance lead', 'a warehouse clerk', 'the meeting host'],
    actions: ['reviews', 'schedules', 'organizes', 'presents', 'updates', 'tracks'],
    items: ['quarterly goals', 'a shared calendar', 'shipping labels', 'meeting notes', 'budget lines', 'customer feedback'],
    places: ['the conference room', 'a loading dock', 'the office kitchen', 'a video call', 'the planning board', 'a quiet desk'],
    details: ['the agenda runs long', 'someone finds a shortcut', 'the chart needs context', 'the deadline moves closer', 'the printer jams again', 'a thank you note helps'],
  },
  {
    topic: 'school',
    actors: ['a math tutor', 'the debate team', 'a science class', 'the art teacher', 'a library helper', 'the school band'],
    actions: ['studies', 'practices', 'solves', 'prepares', 'reads', 'builds'],
    items: ['fraction puzzles', 'painted posters', 'lab notes', 'history cards', 'sheet music', 'a group project'],
    places: ['the classroom door', 'a study hall', 'the library desk', 'the music room', 'a science fair', 'the playground bench'],
    details: ['the bell rings early', 'a marker squeaks loudly', 'the answer needs units', 'the class votes twice', 'the poster dries overnight', 'the rubric asks for examples'],
  },
  {
    topic: 'fictional',
    actors: ['a clockwork courier', 'the lantern keeper', 'a sky bridge guard', 'the velvet inventor', 'a moon station cook', 'the glass city mayor'],
    actions: ['delivers', 'repairs', 'guards', 'brews', 'draws', 'unlocks'],
    items: ['a singing compass', 'glowing blueprints', 'midnight soup', 'a velvet engine', 'crystal tickets', 'a folded star map'],
    places: ['the glass city', 'a floating market', 'the clock tower', 'a silver tunnel', 'the moon kitchen', 'a lantern bridge'],
    details: ['the compass hums in circles', 'the bridge opens at dawn', 'three bells ring backward', 'the recipe uses starlight', 'the mayor loses a key', 'the tunnel remembers names'],
  },
];

const easyEntries = buildPromptEntries('easy', 36, formatEasyPrompt);
const mediumEntries = buildPromptEntries('medium', 36, formatMediumPrompt);
const hardEntries = buildPromptEntries('hard', 36, formatHardPrompt);
const demonEntries = buildPromptEntries('demon', 36, formatDemonPrompt);
const promptTopicByText = new Map(
  [...easyEntries, ...mediumEntries, ...hardEntries, ...demonEntries].map((entry) => [entry.text, entry.topic]),
);

export function getPromptEntries(difficulty: PromptDifficulty) {
  if (difficulty === 'easy') {
    return easyEntries;
  }

  if (difficulty === 'hard') {
    return hardEntries;
  }

  if (difficulty === 'demon') {
    return demonEntries;
  }

  return mediumEntries;
}

export function getPromptPool(difficulty: PromptDifficulty) {
  return getPromptEntries(difficulty).map((entry) => entry.text);
}

export function getPromptTopic(prompt: string) {
  return promptTopicByText.get(prompt);
}

export function createGeneratedPrompt(difficulty: PromptDifficulty) {
  return pick(getPromptPool(difficulty));
}

function buildPromptEntries(
  difficulty: PromptDifficulty,
  promptsPerTopic: number,
  format: (bank: TopicBank, index: number) => string,
) {
  const entries = promptTopics.flatMap((bank) =>
    Array.from({ length: promptsPerTopic }, (_, index) => ({
      text: format(bank, index),
      topic: bank.topic,
    })),
  );
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.text)) {
      return false;
    }

    seen.add(entry.text);
    return true;
  });
}

function formatEasyPrompt(bank: TopicBank, index: number) {
  const actor = pickAt(bank.actors, index);
  const action = pickAt(bank.actions, index + Math.floor(index / bank.actors.length));
  const item = pickAt(bank.items, index * 2 + Math.floor(index / bank.actions.length));
  const place = pickAt(bank.places, index * 3 + Math.floor(index / bank.items.length));
  const detail = pickAt(bank.details, index * 5 + Math.floor(index / bank.places.length));

  switch (index % 6) {
    case 0:
      return `${actor} ${action} ${item}`;
    case 1:
      return `${actor} visits ${place}`;
    case 2:
      return `${item} waits near ${place}`;
    case 3:
      return `${actor} finds ${detail}`;
    case 4:
      return `${place} feels calm today`;
    default:
      return `${actor} learns about ${item}`;
  }
}

function formatMediumPrompt(bank: TopicBank, index: number) {
  const actor = pickAt(bank.actors, index);
  const action = pickAt(bank.actions, index + Math.floor(index / bank.actors.length));
  const item = pickAt(bank.items, index * 2 + Math.floor(index / bank.actions.length));
  const place = pickAt(bank.places, index * 3 + Math.floor(index / bank.items.length));
  const detail = pickAt(bank.details, index * 5 + Math.floor(index / bank.places.length));
  const nextDetail = pickAt(bank.details, index * 7 + Math.floor(index / bank.details.length) + 1);

  switch (index % 6) {
    case 0:
      return `${capitalize(actor)} ${action} ${item} near ${place}, while ${detail}.`;
    case 1:
      return `At ${place}, ${actor} ${action} ${item} before ${nextDetail}.`;
    case 2:
      return `${capitalize(detail)}, so ${actor} pauses, checks ${item}, and keeps going.`;
    case 3:
      return `${capitalize(actor)} studies ${item}; the scene feels ordinary until ${nextDetail}.`;
    case 4:
      return `When ${detail}, ${actor} notices ${item} and writes down one useful clue.`;
    default:
      return `${capitalize(place)} becomes important after ${actor} ${action} ${item} with surprising care.`;
  }
}

function formatHardPrompt(bank: TopicBank, index: number) {
  const actor = pickAt(bank.actors, index);
  const action = pickAt(bank.actions, index + Math.floor(index / bank.actors.length));
  const item = pickAt(bank.items, index * 2 + Math.floor(index / bank.actions.length));
  const place = pickAt(bank.places, index * 3 + Math.floor(index / bank.items.length));
  const detail = pickAt(bank.details, index * 5 + Math.floor(index / bank.places.length));
  const nextDetail = pickAt(bank.details, index * 7 + Math.floor(index / bank.details.length) + 1);
  const time = pickAt(['07:15', '09:42', '12:08', '15:30', '18:45', '22:10'], index);
  const number = pickAt(['3', '5', '8', '13', '21', '34'], index);

  switch (index % 6) {
    case 0:
      return `At ${time}, ${actor} ${action} ${item} near ${place}; ${detail}, and ${number} notes changed the plan.`;
    case 1:
      return `${capitalize(actor)} wrote, "Check ${item} first," then returned to ${place}, where ${nextDetail}.`;
    case 2:
      return `The report listed ${item}, ${place}, and ${number} open questions; ${actor} answered them in reverse order.`;
    case 3:
      return `Because ${detail}, ${actor} had to compare ${item}, revise the schedule, and explain the result clearly.`;
    case 4:
      return `${capitalize(place)} looked quiet, but ${actor} found ${item}, a missing label, and ${number} careful corrections.`;
    default:
      return `"${capitalize(nextDetail)}," said ${actor}, before ${action} ${item} and marking page ${number}.`;
  }
}

function formatDemonPrompt(bank: TopicBank, index: number) {
  const actor = pickAt(bank.actors, index);
  const action = pickAt(bank.actions, index + Math.floor(index / bank.actors.length));
  const item = pickAt(bank.items, index * 2 + Math.floor(index / bank.actions.length));
  const place = pickAt(bank.places, index * 3 + Math.floor(index / bank.items.length));
  const detail = pickAt(bank.details, index * 5 + Math.floor(index / bank.places.length));
  const nextDetail = pickAt(bank.details, index * 7 + Math.floor(index / bank.details.length) + 1);
  const time = pickAt(['03:17', '06:06', '10:24', '14:59', '19:03', '23:41'], index);
  const code = pickAt(['A-17', 'Q4', 'Delta-9', '2048', 'v2.7', '#58'], index);
  const word = pickAt(['counterintuitive', 'kaleidoscopic', 'meticulous', 'asynchronous', 'cartographic', 'uncharacteristically'], index);

  switch (index % 6) {
    case 0:
      return `At ${time}, ${actor} whispered, "Verify ${code}," while ${action} ${item}; ${detail}, ${nextDetail}, and ${word} timing complicated everything.`;
    case 1:
      return `${capitalize(actor)} documented ${numberedList(index)} near ${place} (twice), then wrote: "${capitalize(detail)}"; no shortcut survived review.`;
    case 2:
      return `The ${word} checklist mentioned ${item}, ${place}, and ${code}; when ${nextDetail}, ${actor} revised 3 clauses, 2 labels, and 1 stubborn footnote.`;
    case 3:
      return `"${capitalize(nextDetail)}," ${actor} said; afterward, ${item} was sorted, ${place} was inspected, and ${code} finally matched the ledger.`;
    case 4:
      return `Before ${time}, ${actor} had to ${action} ${item}, explain why ${detail}, and preserve every comma, quote, semicolon, and parenthetical aside.`;
    default:
      return `In file ${code}, ${actor} found ${item}; the note read "Do not assume," which was wise, because ${nextDetail} at exactly ${time}.`;
  }
}

function numberedList(index: number) {
  const first = pickAt(['4 anomalies', '7 revisions', '12 samples', '19 signals', '23 receipts', '31 markers'], index);
  const second = pickAt(['2 quiet warnings', '5 disputed dates', '8 narrow margins', '3 altered names', '6 hidden totals', '9 backup notes'], index * 2);

  return `${first}, ${second}, and one final exception`;
}

function pickAt(values: string[], index: number) {
  return values[index % values.length];
}

function pick(values: string[]) {
  return values[Math.floor(Math.random() * values.length)];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
