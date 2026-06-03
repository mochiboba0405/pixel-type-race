import { useEffect, useState } from 'react';
import { avatarCategories, avatarOptions, getAvatarById } from '../../data/avatarOptions';
import type { AvatarCategory } from '../../features/profile/profileTypes';
import { PixelAvatar } from './PixelAvatar';

type AvatarPickerProps = {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
};

export function AvatarPicker({ selectedAvatarId, onSelect }: AvatarPickerProps) {
  const selectedAvatar = getAvatarById(selectedAvatarId);
  const [category, setCategory] = useState<AvatarCategory>(selectedAvatar.category);
  const visibleAvatars = avatarOptions.filter((avatar) => avatar.category === category);

  useEffect(() => {
    setCategory(selectedAvatar.category);
  }, [selectedAvatar.category]);

  return (
    <div className="avatar-picker-wrap">
      <div className="avatar-category-tabs" aria-label="Avatar categories">
        {avatarCategories.map((avatarCategory) => (
          <button
            className={`avatar-category-tab ${avatarCategory === category ? 'avatar-category-tab--active' : ''}`}
            key={avatarCategory}
            type="button"
            onClick={() => setCategory(avatarCategory)}
            aria-pressed={avatarCategory === category}
          >
            {avatarCategory}
          </button>
        ))}
      </div>

      <div className="avatar-picker" aria-label="Choose avatar">
        {visibleAvatars.map((avatar) => (
          <button
            className={`avatar-choice ${avatar.id === selectedAvatarId ? 'avatar-choice--selected' : ''}`}
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            aria-pressed={avatar.id === selectedAvatarId}
            title={avatar.name}
          >
            <PixelAvatar avatar={avatar} size="medium" />
            <span>{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
