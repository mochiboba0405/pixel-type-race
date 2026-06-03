export type AvatarCategory = 'Girl' | 'Boy' | 'Neutral';

export type HairStyle =
  | 'classic'
  | 'long'
  | 'short'
  | 'ponytail'
  | 'twin-tails'
  | 'bun'
  | 'messy';

export type AvatarAccessory = 'glasses' | 'hoodie';

export type AvatarOption = {
  id: string;
  name: string;
  category: AvatarCategory;
  hairStyle: HairStyle;
  accessory?: AvatarAccessory;
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
  averageWpm: number;
  averageAccuracy: number;
};

export type PlayerProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  avatar: AvatarOption;
  favoriteSceneryId: string;
  stats: LocalStats;
};

export type RaceResultForStats = {
  won: boolean;
  wpm: number;
  accuracy: number;
};
