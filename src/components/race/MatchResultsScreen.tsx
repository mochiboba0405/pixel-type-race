import type { MatchScore, RoundResult } from '../../features/race/raceTypes';
import { buildMatchScores, dedupeMatchScores, dedupeRoundResults, getMatchWinner } from '../../features/race/raceUtils';
import { formatDuration } from '../../features/race/typingMetrics';
import { PixelAvatar } from '../profile/PixelAvatar';

type MatchResultsScreenProps = {
  winner: MatchScore | null;
  scores: MatchScore[];
  roundResults: RoundResult[];
};

export function MatchResultsScreen({ winner, scores, roundResults }: MatchResultsScreenProps) {
  const cleanRoundResults = dedupeRoundResults(roundResults);
  const cleanScores = cleanRoundResults.length > 0 ? buildMatchScores(cleanRoundResults) : dedupeMatchScores(scores);
  const cleanWinner = cleanScores.length > 0 ? getMatchWinner(cleanScores) : winner;

  return (
    <section className="winner-screen">
      <div className="winner-screen__main">
        {cleanWinner ? <PixelAvatar avatar={cleanWinner.avatar} size="large" /> : null}
        <p className="section-label">Match winner</p>
        <h2>{cleanWinner?.displayName ?? 'Match complete'}</h2>
        {cleanWinner ? (
          <p>
            {cleanWinner.roundWins} round wins, {cleanWinner.averageWpm} avg WPM
          </p>
        ) : null}
      </div>

      <div className="results-table">
        {cleanScores.map((score) => (
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
          {cleanRoundResults.map((result) => (
            <p key={result.roundId}>
              Round {result.roundNumber}: {result.winner.displayName} in {formatDuration(result.winner.finishMs)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
