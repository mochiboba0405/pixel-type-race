import type { PlayerRaceState } from '../../features/race/raceTypes';
import { PixelAvatar } from '../profile/PixelAvatar';

type RaceTrackProps = {
  players: PlayerRaceState[];
};

export function RaceTrack({ players }: RaceTrackProps) {
  return (
    <section className="race-track" aria-label="Live race progress">
      {players.map((player) => (
        <div className="race-lane" key={player.playerId}>
          <span className="race-lane__name">{player.displayName}</span>
          <div className="race-lane__road">
            <div
              className="race-lane__racer"
              style={{ left: `calc(${Math.round(player.progress * 100)}% - 20px)` }}
            >
              <PixelAvatar avatar={player.avatar} size="small" label={`${player.displayName} racer`} />
            </div>
            <span className="race-lane__finish" />
          </div>
          <span className="race-lane__stat">{Math.round(player.progress * 100)}%</span>
        </div>
      ))}
    </section>
  );
}
