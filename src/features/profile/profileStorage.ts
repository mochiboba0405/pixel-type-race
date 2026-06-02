import { avatarOptions, getAvatarById } from '../../data/avatarOptions';
import { createPlayerId } from '../../lib/ids';
import { readJson, writeJson } from '../../lib/storage';
import type { PlayerProfile, RaceResultForStats } from './profileTypes';

const PROFILE_KEY = 'pixel-type-race:profile';
const SESSION_PLAYER_KEY = 'pixel-type-race:session-player-id';

const defaultStats = {
  races: 0,
  wins: 0,
  bestWpm: 0,
  averageAccuracy: 100,
};

function getSessionPlayerId(savedId?: string) {
  try {
    const existing = sessionStorage.getItem(SESSION_PLAYER_KEY);

    if (existing) {
      return existing;
    }

    const next = createPlayerId();
    sessionStorage.setItem(SESSION_PLAYER_KEY, next);
    return next;
  } catch {
    return savedId ?? createPlayerId();
  }
}

function createDefaultProfile(): PlayerProfile {
  const avatar = avatarOptions[0];

  return {
    id: getSessionPlayerId(),
    displayName: `Racer ${Math.floor(100 + Math.random() * 900)}`,
    avatarId: avatar.id,
    avatar,
    stats: defaultStats,
  };
}

export function loadProfile(): PlayerProfile {
  const saved = readJson<PlayerProfile | null>(PROFILE_KEY, null);

  if (!saved) {
    const profile = createDefaultProfile();
    saveProfile(profile);
    return profile;
  }

  const avatar = getAvatarById(saved.avatarId);

  return {
    ...saved,
    id: getSessionPlayerId(saved.id),
    avatar,
    stats: {
      ...defaultStats,
      ...saved.stats,
    },
  };
}

export function saveProfile(profile: PlayerProfile) {
  writeJson(PROFILE_KEY, {
    ...profile,
    avatar: getAvatarById(profile.avatarId),
  });
}

export function updateStats(profile: PlayerProfile, result: RaceResultForStats): PlayerProfile {
  const races = profile.stats.races + 1;
  const wins = profile.stats.wins + (result.won ? 1 : 0);
  const bestWpm = Math.max(profile.stats.bestWpm, result.wpm);
  const previousAccuracyTotal = profile.stats.averageAccuracy * profile.stats.races;
  const averageAccuracy = Math.round((previousAccuracyTotal + result.accuracy) / races);

  return {
    ...profile,
    stats: {
      races,
      wins,
      bestWpm,
      averageAccuracy,
    },
  };
}
