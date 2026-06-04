import type { PlayerRaceState } from '../../features/race/raceTypes';
import { sortPlayers } from '../../features/race/raceUtils';
import { PixelAvatar } from '../profile/PixelAvatar';

type PlayerListProps = {
  playersById: Record<string, PlayerRaceState>;
  onPlayerProfileClick?: (player: PlayerRaceState) => void;
};

export function PlayerList({ playersById, onPlayerProfileClick }: PlayerListProps) {
  const visiblePlayers = sortPlayers(Object.values(playersById));

  return (
    <section className="panel player-list">
      <div className="panel__title-row">
        <div>
          <p className="section-label">Players</p>
          <h2>{visiblePlayers.length}</h2>
        </div>
      </div>

      <div className="player-list__items">
        {visiblePlayers.map((player) => (
          <article className="player-card" key={player.playerId}>
            <button
              className="avatar-profile-button"
              type="button"
              onClick={() => onPlayerProfileClick?.(player)}
              title={`View ${player.displayName} profile`}
            >
              <PixelAvatar avatar={player.avatar} size="small" label={`${player.displayName} avatar`} />
            </button>
            <div className="player-card__main">
              <div className="player-card__name">
                <strong>{player.displayName}</strong>
                {player.isHost ? <span>Host</span> : null}
              </div>
              <div className="mini-meter" aria-label={`${player.displayName} progress`}>
                <span style={{ width: `${Math.round(player.progress * 100)}%` }} />
              </div>
            </div>
            <div className="player-card__stats">
              <strong>{player.wpm}</strong>
              <span>WPM</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
