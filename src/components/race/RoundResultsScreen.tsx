import type { RoundResult } from '../../features/race/raceTypes';
import { formatDuration } from '../../features/race/typingMetrics';
import { PixelAvatar } from '../profile/PixelAvatar';

type RoundResultsScreenProps = {
  result: RoundResult;
};

export function RoundResultsScreen({ result }: RoundResultsScreenProps) {
  const winningPlayer = result.players.find((player) => player.playerId === result.winner.playerId);

  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {winningPlayer ? <PixelAvatar avatar={winningPlayer.avatar} size="large" /> : null}
        <p className="section-label">
          Round {result.roundNumber} of {result.totalRounds}
        </p>
        <h2>{result.winner.displayName}</h2>
        <p>
          {result.winner.wpm} WPM, {result.winner.accuracy}% accuracy, {formatDuration(result.winner.finishMs)}
        </p>
      </div>

      <div className="results-table">
        {result.players.map((player) => (
          <article className="result-row result-row--wide" key={player.playerId}>
            <div>
              <strong>{player.displayName}</strong>
              <span>{player.playerId === result.winner.playerId ? 'Round winner' : 'Round result'}</span>
            </div>
            <div>
              <strong>{player.wpm}</strong>
              <span>WPM</span>
            </div>
            <div>
              <strong>{player.accuracy}%</strong>
              <span>Acc.</span>
            </div>
            <div>
              <strong>{player.finishMs === undefined ? 'DNF' : formatDuration(player.finishMs)}</strong>
              <span>Time</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
