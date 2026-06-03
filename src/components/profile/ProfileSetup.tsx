import { sceneryThemes } from '../../data/sceneryThemes';
import type { PlayerProfile } from '../../features/profile/profileTypes';
import { AvatarPicker } from './AvatarPicker';
import { PixelAvatar } from './PixelAvatar';

type ProfileSetupProps = {
  profile: PlayerProfile;
  onChange: (updates: Partial<Pick<PlayerProfile, 'username' | 'displayName' | 'avatarId' | 'favoriteSceneryId'>>) => void;
  compact?: boolean;
};

export function ProfileSetup({ profile, onChange, compact = false }: ProfileSetupProps) {
  const winRate = profile.stats.races === 0 ? 0 : Math.round((profile.stats.wins / profile.stats.races) * 100);

  return (
    <section className={`panel profile-setup ${compact ? 'profile-setup--compact' : ''}`}>
      <div className="profile-setup__header">
        <PixelAvatar avatar={profile.avatar} size={compact ? 'large' : 'hero'} />
        <div>
          <p className="section-label">Profile</p>
          <h2>{profile.username}</h2>
        </div>
      </div>

      <label className="field">
        <span>Username</span>
        <input
          type="text"
          value={profile.username}
          maxLength={20}
          onChange={(event) => onChange({ username: event.target.value || 'New Racer' })}
        />
      </label>

      <label className="field">
        <span>Favorite scenery</span>
        <select
          value={profile.favoriteSceneryId}
          onChange={(event) => onChange({ favoriteSceneryId: event.target.value })}
        >
          {sceneryThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>

      <AvatarPicker selectedAvatarId={profile.avatarId} onSelect={(avatarId) => onChange({ avatarId })} />

      {!compact ? (
        <div className="stats-grid" aria-label="Local stats">
          <div>
            <strong>{profile.stats.wins}</strong>
            <span>Lifetime Wins</span>
          </div>
          <div>
            <strong>{profile.stats.races}</strong>
            <span>Total Races</span>
          </div>
          <div>
            <strong>{profile.stats.bestWpm}</strong>
            <span>Highest WPM</span>
          </div>
          <div>
            <strong>{profile.stats.averageWpm}</strong>
            <span>Average WPM</span>
          </div>
          <div>
            <strong>{winRate}%</strong>
            <span>Win Rate</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
