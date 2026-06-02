export type SceneryTheme = {
  id: string;
  name: string;
  shortName: string;
  mood: string;
  scene: 'city' | 'hills' | 'park' | 'cafe' | 'arcade' | 'rooftop' | 'alley' | 'harbor' | 'garden' | 'suburb';
  colors: {
    skyTop: string;
    skyMid: string;
    skyBottom: string;
    glow: string;
    moon: string;
    buildingA: string;
    buildingB: string;
    buildingC: string;
    window: string;
    accent: string;
    accentSoft: string;
    ground: string;
    road: string;
  };
};

export const sceneryThemes: SceneryTheme[] = [
  {
    id: 'night-city',
    name: 'Night City',
    shortName: 'Night City',
    mood: 'soft skyline lights',
    scene: 'city',
    colors: {
      skyTop: '#101945',
      skyMid: '#243f9f',
      skyBottom: '#5b7bda',
      glow: 'rgba(124, 199, 255, 0.24)',
      moon: '#fef3c7',
      buildingA: '#162350',
      buildingB: '#263a78',
      buildingC: '#314c9b',
      window: '#ffe9a8',
      accent: '#7dd3fc',
      accentSoft: '#c4b5fd',
      ground: '#18223d',
      road: '#27355f',
    },
  },
  {
    id: 'sunset-hills',
    name: 'Sunset Hills',
    shortName: 'Sunset Hills',
    mood: 'warm horizon glow',
    scene: 'hills',
    colors: {
      skyTop: '#30164d',
      skyMid: '#b45384',
      skyBottom: '#f59f6c',
      glow: 'rgba(251, 191, 36, 0.28)',
      moon: '#fed7aa',
      buildingA: '#3b1d58',
      buildingB: '#6d2b68',
      buildingC: '#a24a6f',
      window: '#fff1b8',
      accent: '#fb7185',
      accentSoft: '#fde68a',
      ground: '#253b2f',
      road: '#3f3154',
    },
  },
  {
    id: 'starry-park',
    name: 'Starry Park',
    shortName: 'Starry Park',
    mood: 'trees and tiny stars',
    scene: 'park',
    colors: {
      skyTop: '#10172f',
      skyMid: '#172554',
      skyBottom: '#24537d',
      glow: 'rgba(134, 239, 172, 0.18)',
      moon: '#dcfce7',
      buildingA: '#18392f',
      buildingB: '#22543d',
      buildingC: '#2f6b4f',
      window: '#bbf7d0',
      accent: '#86efac',
      accentSoft: '#bae6fd',
      ground: '#123524',
      road: '#1d3d4f',
    },
  },
  {
    id: 'cozy-cafe',
    name: 'Cozy Cafe Street',
    shortName: 'Cozy Cafe',
    mood: 'lamps and window warmth',
    scene: 'cafe',
    colors: {
      skyTop: '#16132f',
      skyMid: '#33235f',
      skyBottom: '#6f4d79',
      glow: 'rgba(251, 191, 36, 0.2)',
      moon: '#fde68a',
      buildingA: '#2f244d',
      buildingB: '#4f315f',
      buildingC: '#704461',
      window: '#ffdca8',
      accent: '#fbbf24',
      accentSoft: '#f9a8d4',
      ground: '#2f2438',
      road: '#3b2f4d',
    },
  },
  {
    id: 'moonlit-arcade',
    name: 'Moonlit Arcade',
    shortName: 'Arcade',
    mood: 'coin-op neon',
    scene: 'arcade',
    colors: {
      skyTop: '#0f1335',
      skyMid: '#1d1f66',
      skyBottom: '#4c1d95',
      glow: 'rgba(217, 70, 239, 0.23)',
      moon: '#e0e7ff',
      buildingA: '#16123f',
      buildingB: '#2b1b68',
      buildingC: '#412889',
      window: '#67e8f9',
      accent: '#f0abfc',
      accentSoft: '#93c5fd',
      ground: '#17162f',
      road: '#292552',
    },
  },
  {
    id: 'rainy-rooftop',
    name: 'Rainy Rooftop',
    shortName: 'Rooftop',
    mood: 'blue rain shimmer',
    scene: 'rooftop',
    colors: {
      skyTop: '#111827',
      skyMid: '#1e3a5f',
      skyBottom: '#31577d',
      glow: 'rgba(147, 197, 253, 0.2)',
      moon: '#bfdbfe',
      buildingA: '#172033',
      buildingB: '#253952',
      buildingC: '#335672',
      window: '#bae6fd',
      accent: '#60a5fa',
      accentSoft: '#a7f3d0',
      ground: '#172033',
      road: '#223047',
    },
  },
  {
    id: 'lantern-alley',
    name: 'Lantern Alley',
    shortName: 'Lantern Alley',
    mood: 'paper lantern glow',
    scene: 'alley',
    colors: {
      skyTop: '#1f1029',
      skyMid: '#3b1f4f',
      skyBottom: '#65345f',
      glow: 'rgba(248, 113, 113, 0.18)',
      moon: '#fecaca',
      buildingA: '#271c38',
      buildingB: '#463052',
      buildingC: '#65405b',
      window: '#fed7aa',
      accent: '#fb7185',
      accentSoft: '#fef08a',
      ground: '#21192d',
      road: '#352942',
    },
  },
  {
    id: 'aurora-harbor',
    name: 'Aurora Harbor',
    shortName: 'Harbor',
    mood: 'waterfront aurora',
    scene: 'harbor',
    colors: {
      skyTop: '#071827',
      skyMid: '#12395f',
      skyBottom: '#136f7a',
      glow: 'rgba(45, 212, 191, 0.2)',
      moon: '#cffafe',
      buildingA: '#0f2e42',
      buildingB: '#15566b',
      buildingC: '#1e777b',
      window: '#ccfbf1',
      accent: '#2dd4bf',
      accentSoft: '#a7f3d0',
      ground: '#0f2a3a',
      road: '#163c4d',
    },
  },
  {
    id: 'neon-garden',
    name: 'Neon Garden',
    shortName: 'Garden',
    mood: 'glowing flowers',
    scene: 'garden',
    colors: {
      skyTop: '#111633',
      skyMid: '#24316d',
      skyBottom: '#315d7a',
      glow: 'rgba(190, 242, 100, 0.18)',
      moon: '#ecfccb',
      buildingA: '#183a35',
      buildingB: '#28564a',
      buildingC: '#3b715b',
      window: '#d9f99d',
      accent: '#bef264',
      accentSoft: '#f0abfc',
      ground: '#16362d',
      road: '#263f51',
    },
  },
  {
    id: 'sleepy-suburb',
    name: 'Sleepy Suburb',
    shortName: 'Suburb',
    mood: 'quiet porch lights',
    scene: 'suburb',
    colors: {
      skyTop: '#111b3d',
      skyMid: '#293f78',
      skyBottom: '#586fa8',
      glow: 'rgba(253, 230, 138, 0.2)',
      moon: '#fef9c3',
      buildingA: '#243254',
      buildingB: '#3a4e77',
      buildingC: '#526a94',
      window: '#fde68a',
      accent: '#f9a8d4',
      accentSoft: '#bfdbfe',
      ground: '#1f3147',
      road: '#293a59',
    },
  },
];

export const DEFAULT_SCENERY_ID = 'night-city';

export function getSceneryTheme(id?: string | null) {
  return sceneryThemes.find((theme) => theme.id === id) ?? sceneryThemes[0];
}

export function getRandomSceneryId(currentId?: string) {
  const choices = sceneryThemes.filter((theme) => theme.id !== currentId);
  const pool = choices.length > 0 ? choices : sceneryThemes;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
