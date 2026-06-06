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
  const winnerAdjustedFinishMs = winner.adjustedFinishMs ?? winner.finishMs;
  const winnerPenaltyMs = winner.accuracyPenaltyMs ?? 0;

  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {winningPlayer ? <PixelAvatar avatar={winningPlayer.avatar} size="large" /> : null}
        <p className="section-label">
          Round {roundNumber} of {totalRounds}
        </p>
        <h2>{winner.displayName}</h2>
        <p>
          {winner.wpm} WPM, {winner.accuracy}% accuracy, {formatDuration(winnerAdjustedFinishMs)}
          {winnerPenaltyMs > 0 ? ` adjusted (+${winnerPenaltyMs / 1000}s)` : ''}
        </p>
      </div>

      <div className="results-table">
        {players.map((player) => (
          <article className="result-row result-row--wide" key={player.playerId}>
            <div>
              <strong>{player.displayName}</strong>
              <span>
                {player.disqualified
                  ? 'Disqualified'
                  : player.playerId === winner.playerId
                    ? 'Round winner'
                    : 'Round result'}
              </span>
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
              <strong>
                {player.disqualified
                  ? 'DQ'
                  : player.finishMs === undefined
                    ? 'DNF'
                    : formatDuration(player.adjustedFinishMs ?? player.finishMs)}
              </strong>
              <span>{getResultTimeLabel(player)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getResultTimeLabel(player: RoundPlayerResult) {
  if (player.disqualified) {
    return player.disqualificationReason ?? 'Disqualified';
  }

  if ((player.accuracyPenaltyMs ?? 0) > 0) {
    return `+${(player.accuracyPenaltyMs ?? 0) / 1000}s penalty`;
  }

  return 'Time';
}
