import { useEffect, useMemo } from 'react';
import type { PlayerRaceState } from '../../features/race/raceTypes';
import { sortPlayers } from '../../features/race/raceUtils';
import { PixelAvatar } from '../profile/PixelAvatar';

type RaceTrackProps = {
  playersById: Record<string, PlayerRaceState>;
};

export function RaceTrack({ playersById }: RaceTrackProps) {
  const visiblePlayers = useMemo(() => sortPlayers(Object.values(playersById)), [playersById]);
  const renderedPlayerIds = visiblePlayers.map((player) => player.playerId).join(',');

  useEffect(() => {
    console.log('[type-race render] RaceTrack rendered playerIds', {
      playerIds: renderedPlayerIds ? renderedPlayerIds.split(',') : [],
    });
  }, [renderedPlayerIds]);

  return (
    <section className="race-track" aria-label="Live race progress">
      {visiblePlayers.map((player) => (
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
          <span className={player.disqualified ? 'race-lane__stat race-lane__stat--dq' : 'race-lane__stat'}>
            {player.disqualified ? 'DQ' : `${Math.round(player.progress * 100)}%`}
          </span>
        </div>
      ))}
    </section>
  );
}
