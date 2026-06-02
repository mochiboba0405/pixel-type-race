import type { ConnectionStatus, RacePhase } from '../../features/race/raceTypes';

type HostControlsProps = {
  isHost: boolean;
  phase: RacePhase;
  playerCount: number;
  connectionStatus: ConnectionStatus;
  onStart: () => void;
};

export function HostControls({ isHost, phase, playerCount, connectionStatus, onStart }: HostControlsProps) {
  const canStart = isHost && (phase === 'lobby' || phase === 'finished');

  if (!isHost) {
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
      <h2>{phase === 'finished' ? 'Race again' : 'Ready room'}</h2>
      <p className="muted">
        {connectionStatus === 'demo'
          ? 'Demo mode is active until Supabase env vars are added.'
          : `${playerCount} player${playerCount === 1 ? '' : 's'} connected.`}
      </p>
      <button className="button button--primary" type="button" onClick={onStart} disabled={!canStart}>
        Start Race
      </button>
    </section>
  );
}
