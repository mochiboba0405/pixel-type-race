import { avatarOptions } from '../../data/avatarOptions';
import { PixelAvatar } from './PixelAvatar';

type AvatarPickerProps = {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
};

export function AvatarPicker({ selectedAvatarId, onSelect }: AvatarPickerProps) {
  return (
    <div className="avatar-picker" aria-label="Choose avatar">
      {avatarOptions.map((avatar) => (
        <button
          className={`avatar-choice ${avatar.id === selectedAvatarId ? 'avatar-choice--selected' : ''}`}
          key={avatar.id}
          type="button"
          onClick={() => onSelect(avatar.id)}
          aria-pressed={avatar.id === selectedAvatarId}
          title={avatar.name}
        >
          <PixelAvatar avatar={avatar} size="small" />
          <span>{avatar.name}</span>
        </button>
      ))}
    </div>
  );
}
