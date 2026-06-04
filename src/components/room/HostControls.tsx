import { difficultyLabels, difficultyOptions } from '../../data/prompts';
import type { ConnectionStatus, PromptDifficulty, RacePhase } from '../../features/race/raceTypes';
import type { RoundCount } from '../../features/race/raceTypes';
import { ROUND_COUNT_OPTIONS } from '../../features/race/raceUtils';

type HostControlsProps = {
  isHost: boolean;
  phase: RacePhase;
  playerCount: number;
  connectionStatus: ConnectionStatus;
  currentRound: number;
  totalRounds: RoundCount;
  promptDifficulty: PromptDifficulty;
  onTotalRoundsChange: (rounds: RoundCount) => void;
  onDifficultyChange: (difficulty: PromptDifficulty) => void;
  onStartMatch: () => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
};

export function HostControls({
  isHost,
  phase,
  playerCount,
  connectionStatus,
  currentRound,
  totalRounds,
  promptDifficulty,
  onTotalRoundsChange,
  onDifficultyChange,
  onStartMatch,
  onNextRound,
  onPlayAgain,
}: HostControlsProps) {
  const connectionText =
    connectionStatus === 'demo'
      ? 'Demo mode is active until Supabase env vars are added.'
      : connectionStatus === 'offline'
        ? 'Realtime is offline. Check Supabase env vars and reload.'
      : `${playerCount} player${playerCount === 1 ? '' : 's'} connected.`;
  const canBroadcast = connectionStatus === 'online' || connectionStatus === 'demo';

  if (!isHost) {
    if (phase === 'round-results') {
      return (
        <section className="panel host-controls">
          <p className="section-label">Round complete</p>
          <h2>Waiting for host</h2>
          <p className="muted">Waiting for host to start next round.</p>
        </section>
      );
    }

    if (phase === 'match-results') {
      return (
        <section className="panel host-controls">
          <p className="section-label">Match complete</p>
          <h2>Waiting for host</h2>
          <p className="muted">Waiting for host to play again.</p>
        </section>
      );
    }

    return (
      <section className="panel host-controls">
        <p className="section-label">Status</p>
        <h2>Waiting for host</h2>
        <p className="muted">The room creator starts the next race.</p>
      </section>
    );
  }

  return (
    <section className="panel host-controls">
      <p className="section-label">Host controls</p>

      {phase === 'lobby' ? (
        <>
          <h2>Match setup</h2>
          <p className="muted">{connectionText}</p>
          <label className="field">
            <span>Rounds</span>
            <select
              value={totalRounds}
              onChange={(event) => onTotalRoundsChange(Number(event.target.value) as RoundCount)}
            >
              {ROUND_COUNT_OPTIONS.map((rounds) => (
                <option key={rounds} value={rounds}>
                  {rounds} round{rounds === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Difficulty</span>
            <select
              value={promptDifficulty}
              onChange={(event) => onDifficultyChange(event.target.value as PromptDifficulty)}
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficultyLabels[difficulty]}
                </option>
              ))}
            </select>
          </label>
          <button className="button button--primary" type="button" onClick={onStartMatch} disabled={!canBroadcast}>
            Start Match
          </button>
        </>
      ) : null}

      {phase === 'round-results' ? (
        <>
          <h2>
            Round {currentRound} of {totalRounds}
          </h2>
          <p className="muted">Start the next round when everyone is ready.</p>
          <button className="button button--primary" type="button" onClick={onNextRound} disabled={!canBroadcast}>
            Next Round
          </button>
        </>
      ) : null}

      {phase === 'match-results' ? (
        <>
          <h2>Match complete</h2>
          <p className="muted">Play again keeps everyone in this room.</p>
          <button className="button button--primary" type="button" onClick={onPlayAgain} disabled={!canBroadcast}>
            Play Again
          </button>
        </>
      ) : null}

      {phase === 'countdown' || phase === 'racing' ? (
        <>
          <h2>
            Round {currentRound} of {totalRounds}
          </h2>
          <p className="muted">Race in progress.</p>
        </>
      ) : null}
    </section>
  );
}
