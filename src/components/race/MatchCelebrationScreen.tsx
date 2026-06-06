import type { CSSProperties } from 'react';
import type { MatchScore, RoundResult } from '../../features/race/raceTypes';
import { buildMatchScores, dedupeMatchScores, dedupeRoundResults, getMatchWinner } from '../../features/race/raceUtils';
import { PixelAvatar } from '../profile/PixelAvatar';

type MatchCelebrationScreenProps = {
  winner: MatchScore | null;
  scores: MatchScore[];
  roundResults: RoundResult[];
  onContinue: () => void;
};

const confettiColors = ['#fef3c7', '#7dd3fc', '#f9a8d4', '#86efac', '#fca5a5', '#c4b5fd'];

export function MatchCelebrationScreen({
  winner,
  scores,
  roundResults,
  onContinue,
}: MatchCelebrationScreenProps) {
  const cleanRoundResults = dedupeRoundResults(roundResults);
  const cleanScores = cleanRoundResults.length > 0 ? buildMatchScores(cleanRoundResults) : dedupeMatchScores(scores);
  const cleanWinner = cleanScores.length > 0 ? getMatchWinner(cleanScores) : winner;
  const totalRoundWins = cleanWinner?.roundWins ?? 0;
  const roundsPlayed = cleanWinner?.roundsPlayed ?? cleanRoundResults.length;

  return (
    <section className="celebration-screen" aria-label="Match celebration">
      <div className="confetti-layer" aria-hidden="true">
        {Array.from({ length: 36 }, (_, index) => (
          <span
            className="confetti-piece"
            key={index}
            style={getConfettiStyle(index)}
          />
        ))}
      </div>

      <div className="winner-card winner-card--celebration">
        {cleanWinner ? <PixelAvatar avatar={cleanWinner.avatar} size="large" /> : null}
        <p className="section-label">Match winner</p>
        <h2>{cleanWinner?.displayName ?? 'Match complete'}</h2>
        <div className="celebration-stats">
          <div>
            <strong>
              {totalRoundWins}/{roundsPlayed || 0}
            </strong>
            <span>Final score</span>
          </div>
          <div>
            <strong>{cleanWinner?.averageAccuracy ?? 0}%</strong>
            <span>Avg accuracy</span>
          </div>
          <div>
            <strong>{cleanWinner?.averageWpm ?? 0}</strong>
            <span>Avg WPM</span>
          </div>
        </div>
        <button className="button button--primary" type="button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </section>
  );
}

function getConfettiStyle(index: number): CSSProperties {
  return {
    left: `${(index * 17) % 100}%`,
    animationDelay: `${(index % 12) * -0.32}s`,
    animationDuration: `${2.8 + (index % 7) * 0.22}s`,
    backgroundColor: confettiColors[index % confettiColors.length],
  };
}
