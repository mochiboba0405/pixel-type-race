import type { MatchScore, PlayerRaceState } from '../../features/race/raceTypes';
import { dedupeMatchScores, sortPlayers } from '../../features/race/raceUtils';
import { PixelAvatar } from '../profile/PixelAvatar';

type MatchScoreboardProps = {
  playersById: Record<string, PlayerRaceState>;
  scores: MatchScore[];
};

export function MatchScoreboard({ playersById, scores }: MatchScoreboardProps) {
  const cleanScores = dedupeMatchScores(scores);
  const visiblePlayers = sortPlayers(Object.values(playersById));
  const scoreRows = dedupeMatchScores([
    ...cleanScores,
    ...visiblePlayers
      .filter((player) => !cleanScores.some((score) => score.playerId === player.playerId))
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
