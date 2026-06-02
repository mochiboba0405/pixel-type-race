import type { CSSProperties } from 'react';
import type { AvatarOption } from '../../features/profile/profileTypes';

type PixelAvatarProps = {
  avatar: AvatarOption;
  size?: 'small' | 'medium' | 'large';
  label?: string;
};

export function PixelAvatar({ avatar, size = 'medium', label }: PixelAvatarProps) {
  const style = {
    '--hair': avatar.colors.hair,
    '--skin': avatar.colors.skin,
    '--shirt': avatar.colors.shirt,
    '--accent': avatar.colors.accent,
  } as CSSProperties;

  return (
    <div
      className={`pixel-avatar pixel-avatar--${size}`}
      style={style}
      role="img"
      aria-label={label ?? `${avatar.name} pixel avatar`}
    >
      <span className="pixel-avatar__hair" />
      <span className="pixel-avatar__face" />
      <span className="pixel-avatar__eye pixel-avatar__eye--left" />
      <span className="pixel-avatar__eye pixel-avatar__eye--right" />
      <span className="pixel-avatar__smile" />
      <span className="pixel-avatar__shirt" />
      <span className="pixel-avatar__spark" />
    </div>
  );
}
