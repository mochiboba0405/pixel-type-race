import { useEffect, useMemo, useRef, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ProfileSetup } from '../components/profile/ProfileSetup';
import { HostControls } from '../components/room/HostControls';
import { PlayerList } from '../components/room/PlayerList';
import { RoomInvite } from '../components/room/RoomInvite';
import { RaceTrack } from '../components/race/RaceTrack';
import { StatsBar } from '../components/race/StatsBar';
import { TypingInput } from '../components/race/TypingInput';
import { TypingPrompt } from '../components/race/TypingPrompt';
import { WinnerScreen } from '../components/race/WinnerScreen';
import { SceneryPicker } from '../components/scenery/SceneryPicker';
import { getRandomSceneryId, getSceneryTheme } from '../data/sceneryThemes';
import { useLocalProfile } from '../features/profile/useLocalProfile';
import { isRoomHost, loadRoomScenery } from '../features/room/roomUtils';
import { useRaceRoom } from '../features/race/useRaceRoom';
import { calculateTypingMetrics } from '../features/race/typingMetrics';

type RoomPageProps = {
  roomId: string;
  navigate: (path: string) => void;
};

export function RoomPage({ roomId, navigate }: RoomPageProps) {
  const { profile, updateProfile, recordRace } = useLocalProfile();
  const host = isRoomHost(roomId, profile.id);
  const [typed, setTyped] = useState('');
  const [clock, setClock] = useState(0);
  const lastRoundRef = useRef<string | null>(null);
  const recordedRoundRef = useRef<string | null>(null);
  const initialSceneryId = useMemo(() => loadRoomScenery(roomId), [roomId]);

  const race = useRaceRoom({
    roomId,
    profile,
    isHost: host,
    initialSceneryId,
  });

  useEffect(() => {
    if (race.phase !== 'countdown' && race.phase !== 'racing') {
      return undefined;
    }

    const intervalId = window.setInterval(() => setClock((value) => value + 1), 500);
    return () => window.clearInterval(intervalId);
  }, [race.phase]);

  useEffect(() => {
    if (race.roundId && race.roundId !== lastRoundRef.current) {
      setTyped('');
      lastRoundRef.current = race.roundId;
    }
  }, [race.roundId]);

  const metrics = useMemo(
    () => calculateTypingMetrics(race.prompt, typed, race.startedAt),
    [clock, race.prompt, race.startedAt, typed],
  );

  useEffect(() => {
    if (race.phase === 'racing') {
      race.updateMyProgress(metrics);
    }
  }, [metrics, race.phase, race.updateMyProgress]);

  const me = race.players.find((player) => player.playerId === profile.id);

  useEffect(() => {
    if (!race.roundId || race.phase !== 'finished' || !race.winner || recordedRoundRef.current === race.roundId) {
      return;
    }

    recordedRoundRef.current = race.roundId;

    recordRace({
      won: race.winner.playerId === profile.id,
      wpm: me?.wpm ?? metrics.wpm,
      accuracy: me?.accuracy ?? metrics.accuracy,
    });
  }, [me?.accuracy, me?.wpm, metrics.accuracy, metrics.wpm, profile.id, race.phase, race.roundId, race.winner, recordRace]);

  const countdown = race.startedAt ? Math.max(0, Math.ceil((race.startedAt - Date.now()) / 1000)) : 0;
  const inputDisabled = race.phase !== 'racing';
  const scenery = getSceneryTheme(race.sceneryId);
  const canEditScenery = host && (race.phase === 'lobby' || race.phase === 'finished');

  return (
    <PageShell
      eyebrow={`Room ${roomId}`}
      title={race.phase === 'finished' ? 'Race results' : 'Ready, steady, type'}
      subtitle="Live progress updates as each player moves across the track."
      sceneryId={race.sceneryId}
    >
      <div className="room-topbar">
        <button className="button button--ghost" type="button" onClick={() => navigate('/')}>
          Home
        </button>
        <div className="room-topbar__pills">
          <span className="theme-label">Scenery: {scenery.name}</span>
          <span className={`connection-pill connection-pill--${race.connectionStatus}`}>
            {race.connectionStatus === 'demo'
              ? 'Demo mode'
              : race.connectionStatus === 'online'
                ? 'Realtime online'
                : race.connectionStatus}
          </span>
        </div>
      </div>

      <div className="room-grid">
        <aside className="room-sidebar">
          <ProfileSetup profile={profile} onChange={updateProfile} compact />
          <RoomInvite roomId={roomId} />
          <section className="panel scenery-card">
            <p className="section-label">Scenery</p>
            <h2>{scenery.name}</h2>
            <p className="muted">{scenery.mood}</p>
            {host ? (
              <SceneryPicker
                selectedSceneryId={race.sceneryId}
                disabled={!canEditScenery}
                onChange={race.changeScenery}
                onRandomize={() => race.changeScenery(getRandomSceneryId(race.sceneryId))}
              />
            ) : (
              <p className="muted">The host controls the shared scenery.</p>
            )}
          </section>
          <PlayerList players={race.players} />
        </aside>

        <section className="race-panel">
          {race.phase === 'lobby' ? (
            <div className="lobby-state">
              <HostControls
                isHost={host}
                phase={race.phase}
                playerCount={race.players.length}
                connectionStatus={race.connectionStatus}
                onStart={race.startRace}
              />
              <RaceTrack players={race.players} />
            </div>
          ) : null}

          {race.phase === 'countdown' ? (
            <div className="countdown-state" aria-live="polite">
              <p className="section-label">Starting in</p>
              <strong>{countdown}</strong>
            </div>
          ) : null}

          {race.phase === 'racing' ? (
            <div className="active-race">
              <RaceTrack players={race.players} />
              <StatsBar metrics={metrics} />
              <TypingPrompt prompt={race.prompt} typed={typed} />
              <TypingInput value={typed} disabled={inputDisabled} onChange={setTyped} />
            </div>
          ) : null}

          {race.phase === 'finished' ? (
            <div className="finished-race">
              <WinnerScreen winner={race.winner} players={race.players} />
              <RaceTrack players={race.players} />
              <HostControls
                isHost={host}
                phase={race.phase}
                playerCount={race.players.length}
                connectionStatus={race.connectionStatus}
                onStart={race.startRace}
              />
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
