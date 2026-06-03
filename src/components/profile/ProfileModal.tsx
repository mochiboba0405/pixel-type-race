import { getSceneryTheme } from '../../data/sceneryThemes';
import type { PlayerRaceState } from '../../features/race/raceTypes';
import { PixelAvatar } from './PixelAvatar';

type ProfileModalProps = {
  player: PlayerRaceState | null;
  onClose: () => void;
};

export function ProfileModal({ player, onClose }: ProfileModalProps) {
  if (!player) {
    return null;
  }

  const stats = player.profileStats ?? {
    races: 0,
    wins: 0,
    bestWpm: 0,
    averageWpm: 0,
    averageAccuracy: 100,
  };
  const winRate = stats.races === 0 ? 0 : Math.round((stats.wins / stats.races) * 100);
  const favoriteScenery = getSceneryTheme(player.favoriteSceneryId);

  return (
    <div className="profile-modal" role="dialog" aria-modal="true" aria-label={`${player.displayName} profile`}>
      <button className="profile-modal__backdrop" type="button" onClick={onClose} aria-label="Close profile" />
      <section className="profile-modal__card">
        <button className="profile-modal__close" type="button" onClick={onClose}>
          Close
        </button>
        <div className="profile-modal__hero">
          <PixelAvatar avatar={player.avatar} size="hero" />
          <div>
            <p className="section-label">Player profile</p>
            <h2>{player.displayName}</h2>
            <p className="theme-label">Favorite: {favoriteScenery.name}</p>
          </div>
        </div>

        <div className="stats-grid stats-grid--profile" aria-label={`${player.displayName} stats`}>
          <div>
            <strong>{stats.wins}</strong>
            <span>Lifetime Wins</span>
          </div>
          <div>
            <strong>{stats.races}</strong>
            <span>Total Races</span>
          </div>
          <div>
            <strong>{stats.bestWpm}</strong>
            <span>Highest WPM</span>
          </div>
          <div>
            <strong>{stats.averageWpm}</strong>
            <span>Average WPM</span>
          </div>
          <div>
            <strong>{winRate}%</strong>
            <span>Win Rate</span>
          </div>
        </div>
      </section>
    </div>
  );
}
