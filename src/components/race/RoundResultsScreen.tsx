import type { RoundPlayerResult, RoundWinner } from '../../features/race/raceTypes';
import { dedupeRoundPlayers } from '../../features/race/raceUtils';
import { formatDuration } from '../../features/race/typingMetrics';
import { PixelAvatar } from '../profile/PixelAvatar';

type RoundResultsScreenProps = {
  roundNumber: number;
  totalRounds: number;
  winner: RoundWinner;
  resultsByPlayerId: Record<string, RoundPlayerResult>;
};

export function RoundResultsScreen({
  roundNumber,
  totalRounds,
  winner,
  resultsByPlayerId,
}: RoundResultsScreenProps) {
  const players = dedupeRoundPlayers(Object.values(resultsByPlayerId));
  const winningPlayer = resultsByPlayerId[winner.playerId];

  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {winningPlayer ? <PixelAvatar avatar={winningPlayer.avatar} size="large" /> : null}
        <p className="section-label">
          Round {roundNumber} of {totalRounds}
        </p>
        <h2>{winner.displayName}</h2>
        <p>
          {winner.wpm} WPM, {winner.accuracy}% accuracy, {formatDuration(winner.finishMs)}
        </p>
      </div>

      <div className="results-table">
        {players.map((player) => (
          <article className="result-row result-row--wide" key={player.playerId}>
            <div>
              <strong>{player.displayName}</strong>
              <span>{player.playerId === winner.playerId ? 'Round winner' : 'Round result'}</span>
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
