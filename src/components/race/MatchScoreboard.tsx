import type { MatchScore, PlayerRaceState } from '../../features/race/raceTypes';
import { sortMatchScores } from '../../features/race/raceUtils';
import { PixelAvatar } from '../profile/PixelAvatar';

type MatchScoreboardProps = {
  players: PlayerRaceState[];
  scores: MatchScore[];
};

export function MatchScoreboard({ players, scores }: MatchScoreboardProps) {
  const scoreRows = sortMatchScores([
    ...scores,
    ...players
      .filter((player) => !scores.some((score) => score.playerId === player.playerId))
      .map((player) => ({
        playerId: player.playerId,
        displayName: player.displayName,
        avatarId: player.avatarId,
        avatar: player.avatar,
        roundWins: 0,
        roundsPlayed: 0,
        totalWpm: 0,
        totalAccuracy: 0,
        averageWpm: 0,
        averageAccuracy: 100,
      })),
  ]);

  return (
    <section className="panel match-scoreboard">
      <p className="section-label">Match score</p>
      <div className="match-scoreboard__rows">
        {scoreRows.map((score) => (
          <article className="score-row" key={score.playerId}>
            <PixelAvatar avatar={score.avatar} size="small" />
            <div>
              <strong>{score.displayName}</strong>
              <span>
                {score.roundWins} wins / {score.averageWpm} avg WPM
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
