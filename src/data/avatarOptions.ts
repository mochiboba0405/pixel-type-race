import type { AvatarOption } from '../features/profile/profileTypes';

export const avatarOptions: AvatarOption[] = [
  {
    id: 'berry',
    name: 'Berry',
    colors: {
      hair: '#7c3aed',
      skin: '#ffd7a8',
      shirt: '#ff6b6b',
      accent: '#fef3c7',
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    colors: {
      hair: '#065f46',
      skin: '#f8c8a8',
      shirt: '#34d399',
      accent: '#ecfeff',
    },
  },
  {
    id: 'sunny',
    name: 'Sunny',
    colors: {
      hair: '#b45309',
      skin: '#f6bd60',
      shirt: '#facc15',
      accent: '#fff7ed',
    },
  },
  {
    id: 'bubble',
    name: 'Bubble',
    colors: {
      hair: '#1d4ed8',
      skin: '#ffd6e0',
      shirt: '#60a5fa',
      accent: '#eff6ff',
    },
  },
  {
    id: 'sprout',
    name: 'Sprout',
    colors: {
      hair: '#166534',
      skin: '#f1c27d',
      shirt: '#84cc16',
      accent: '#f7fee7',
    },
  },
  {
    id: 'peach',
    name: 'Peach',
    colors: {
      hair: '#be123c',
      skin: '#ffc9a9',
      shirt: '#fb7185',
      accent: '#fff1f2',
    },
  },
];

export function getAvatarById(id: string) {
  return avatarOptions.find((avatar) => avatar.id === id) ?? avatarOptions[0];
}
