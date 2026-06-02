import type { MatchScore, RoundResult } from '../../features/race/raceTypes';
import { formatDuration } from '../../features/race/typingMetrics';
import { PixelAvatar } from '../profile/PixelAvatar';

type MatchResultsScreenProps = {
  winner: MatchScore | null;
  scores: MatchScore[];
  roundResults: RoundResult[];
};

export function MatchResultsScreen({ winner, scores, roundResults }: MatchResultsScreenProps) {
  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {winner ? <PixelAvatar avatar={winner.avatar} size="large" /> : null}
        <p className="section-label">Match winner</p>
        <h2>{winner?.displayName ?? 'Match complete'}</h2>
        {winner ? (
          <p>
            {winner.roundWins} round wins, {winner.averageWpm} avg WPM
          </p>
        ) : null}
      </div>

      <div className="results-table">
        {scores.map((score) => (
          <article className="result-row result-row--wide" key={score.playerId}>
            <div>
              <strong>{score.displayName}</strong>
              <span>{score.roundWins} wins</span>
            </div>
            <div>
              <strong>{score.averageWpm}</strong>
              <span>Avg WPM</span>
            </div>
            <div>
              <strong>{score.averageAccuracy}%</strong>
              <span>Avg Acc.</span>
            </div>
            <div>
              <strong>{score.roundsPlayed}</strong>
              <span>Rounds</span>
            </div>
          </article>
        ))}

        <div className="round-history">
          {roundResults.map((result) => (
            <p key={result.roundId}>
              Round {result.roundNumber}: {result.winner.displayName} in {formatDuration(result.winner.finishMs)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
