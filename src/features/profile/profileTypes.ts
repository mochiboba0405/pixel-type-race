export type AvatarOption = {
  id: string;
  name: string;
  colors: {
    hair: string;
    skin: string;
    shirt: string;
    accent: string;
  };
};

export type LocalStats = {
  races: number;
  wins: number;
  bestWpm: number;
  averageAccuracy: number;
};

export type PlayerProfile = {
  id: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  stats: LocalStats;
};

export type RaceResultForStats = {
  won: boolean;
  wpm: number;
  accuracy: number;
};
