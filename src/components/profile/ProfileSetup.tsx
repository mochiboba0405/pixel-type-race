import type { PlayerProfile } from '../../features/profile/profileTypes';
import { AvatarPicker } from './AvatarPicker';
import { PixelAvatar } from './PixelAvatar';

type ProfileSetupProps = {
  profile: PlayerProfile;
  onChange: (updates: Partial<Pick<PlayerProfile, 'displayName' | 'avatarId'>>) => void;
  compact?: boolean;
};

export function ProfileSetup({ profile, onChange, compact = false }: ProfileSetupProps) {
  return (
    <section className={`panel profile-setup ${compact ? 'profile-setup--compact' : ''}`}>
      <div className="profile-setup__header">
        <PixelAvatar avatar={profile.avatar} size={compact ? 'medium' : 'large'} />
        <div>
          <p className="section-label">Profile</p>
          <h2>{profile.displayName}</h2>
        </div>
      </div>

      <label className="field">
        <span>Display name</span>
        <input
          type="text"
          value={profile.displayName}
          maxLength={20}
          onChange={(event) => onChange({ displayName: event.target.value || 'New Racer' })}
        />
      </label>

      <AvatarPicker selectedAvatarId={profile.avatarId} onSelect={(avatarId) => onChange({ avatarId })} />

      {!compact ? (
        <div className="stats-grid" aria-label="Local stats">
          <div>
            <strong>{profile.stats.races}</strong>
            <span>Races</span>
          </div>
          <div>
            <strong>{profile.stats.wins}</strong>
            <span>Wins</span>
          </div>
          <div>
            <strong>{profile.stats.bestWpm}</strong>
            <span>Best WPM</span>
          </div>
          <div>
            <strong>{profile.stats.averageAccuracy}%</strong>
            <span>Avg Acc.</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
