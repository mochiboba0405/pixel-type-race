import type { PlayerRaceState, RaceFinishPayload } from '../../features/race/raceTypes';
import { formatDuration } from '../../features/race/typingMetrics';
import { PixelAvatar } from '../profile/PixelAvatar';

type WinnerScreenProps = {
  winner: RaceFinishPayload | null;
  players: PlayerRaceState[];
};

export function WinnerScreen({ winner, players }: WinnerScreenProps) {
  const winningPlayer = players.find((player) => player.playerId === winner?.playerId);

  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {winningPlayer ? <PixelAvatar avatar={winningPlayer.avatar} size="large" /> : null}
        <p className="section-label">Winner</p>
        <h2>{winner?.displayName ?? 'Race complete'}</h2>
        {winner ? (
          <p>
            {winner.wpm} WPM, {winner.accuracy}% accuracy, {formatDuration(winner.finishMs)}
          </p>
        ) : null}
      </div>

      <div className="results-table">
        {players.map((player) => (
          <article className="result-row" key={player.playerId}>
            <div>
              <strong>{player.displayName}</strong>
              <span>{player.finished ? 'Finished' : 'In progress'}</span>
            </div>
            <div>
              <strong>{player.wpm}</strong>
              <span>WPM</span>
            </div>
            <div>
              <strong>{player.accuracy}%</strong>
              <span>Acc.</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
