import type { CSSProperties } from 'react';
import { getSceneryTheme } from '../../data/sceneryThemes';

type ParallaxBackgroundProps = {
  sceneryId?: string;
};

const buildingHeights = [172, 116, 204, 148, 228, 132, 184, 104, 214, 154, 126];
const people = [
  { left: '12%', shirt: '#fca5a5', hair: '#78350f' },
  { left: '18%', shirt: '#7dd3fc', hair: '#4c1d95' },
  { left: '68%', shirt: '#f9a8d4', hair: '#422006' },
  { left: '78%', shirt: '#86efac', hair: '#111827' },
  { left: '88%', shirt: '#fde68a', hair: '#7f1d1d' },
];

export function ParallaxBackground({ sceneryId }: ParallaxBackgroundProps) {
  const theme = getSceneryTheme(sceneryId);
  const style = {
    '--sky-top': theme.colors.skyTop,
    '--sky-mid': theme.colors.skyMid,
    '--sky-bottom': theme.colors.skyBottom,
    '--sky-glow': theme.colors.glow,
    '--moon': theme.colors.moon,
    '--building-a': theme.colors.buildingA,
    '--building-b': theme.colors.buildingB,
    '--building-c': theme.colors.buildingC,
    '--window': theme.colors.window,
    '--scene-accent': theme.colors.accent,
    '--scene-accent-soft': theme.colors.accentSoft,
    '--ground': theme.colors.ground,
    '--road': theme.colors.road,
  } as CSSProperties;

  return (
    <div className={`parallax parallax--${theme.scene}`} style={style} aria-hidden="true">
      <div className="parallax__sky" />
      <div className="parallax__moon" />
      <div className="parallax__aurora" />
      <div className="parallax__layer parallax__layer--sparkles" />
      <div className="parallax__layer parallax__layer--clouds" />
      <div className="parallax__scene">
        {buildingHeights.map((height, index) => (
          <div
            className={`scene-building scene-building--${(index % 3) + 1}`}
            key={`${height}-${index}`}
            style={{
              height,
              left: `${index * 9 - 3}%`,
              width: `${58 + (index % 4) * 10}px`,
            }}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <div className="parallax__trees">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="parallax__ground" />
      <div className="parallax__street">
        <div className="street-lamp street-lamp--left" />
        <div className="street-lamp street-lamp--right" />
        {people.map((person) => (
          <div
            className="tiny-human"
            key={person.left}
            style={{
              left: person.left,
              '--human-shirt': person.shirt,
              '--human-hair': person.hair,
            } as CSSProperties}
          >
            <span className="tiny-human__hair" />
            <span className="tiny-human__head" />
            <span className="tiny-human__body" />
            <span className="tiny-human__leg tiny-human__leg--left" />
            <span className="tiny-human__leg tiny-human__leg--right" />
          </div>
        ))}
      </div>
    </div>
  );
}
