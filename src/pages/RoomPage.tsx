import { useEffect, useMemo, useRef, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ProfileModal } from '../components/profile/ProfileModal';
import { ProfileSetup } from '../components/profile/ProfileSetup';
import { HostControls } from '../components/room/HostControls';
import { PlayerList } from '../components/room/PlayerList';
import { RoomChat } from '../components/room/RoomChat';
import { RoomInvite } from '../components/room/RoomInvite';
import { MatchResultsScreen } from '../components/race/MatchResultsScreen';
import { MatchScoreboard } from '../components/race/MatchScoreboard';
import { RaceTrack } from '../components/race/RaceTrack';
import { RoundResultsScreen } from '../components/race/RoundResultsScreen';
import { StatsBar } from '../components/race/StatsBar';
import { TypingInput } from '../components/race/TypingInput';
import { TypingPrompt } from '../components/race/TypingPrompt';
import { SceneryPicker } from '../components/scenery/SceneryPicker';
import { getRandomSceneryId, getSceneryTheme } from '../data/sceneryThemes';
import { difficultyLabels } from '../data/prompts';
import { useLocalProfile } from '../features/profile/useLocalProfile';
import { isRoomHost, loadRoomScenery } from '../features/room/roomUtils';
import { useRaceRoom } from '../features/race/useRaceRoom';
import { calculateTypingMetrics } from '../features/race/typingMetrics';
import type { PlayerRaceState } from '../features/race/raceTypes';

type RoomPageProps = {
  roomId: string;
  navigate: (path: string) => void;
};

export function RoomPage({ roomId, navigate }: RoomPageProps) {
  const { profile, updateProfile, recordRace } = useLocalProfile();
  const host = isRoomHost(roomId, profile.id);
  const [typed, setTyped] = useState('');
  const [clock, setClock] = useState(0);
  const [selectedProfilePlayer, setSelectedProfilePlayer] = useState<PlayerRaceState | null>(null);
  const lastRoundRef = useRef<string | null>(null);
  const recordedMatchRef = useRef<string | null>(null);
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
    if (!race.matchId || race.phase !== 'match-results' || !race.matchWinner || recordedMatchRef.current === race.matchId) {
      return;
    }

    recordedMatchRef.current = race.matchId;

    const myScore = race.matchScores.find((score) => score.playerId === profile.id);

    recordRace({
      won: race.matchWinner.playerId === profile.id,
      wpm: myScore?.averageWpm ?? me?.wpm ?? metrics.wpm,
      accuracy: myScore?.averageAccuracy ?? me?.accuracy ?? metrics.accuracy,
    });
  }, [
    me?.accuracy,
    me?.wpm,
    metrics.accuracy,
    metrics.wpm,
    profile.id,
    race.matchId,
    race.matchScores,
    race.matchWinner,
    race.phase,
    recordRace,
  ]);

  const countdown = race.startedAt ? Math.max(0, Math.ceil((race.startedAt - Date.now()) / 1000)) : 0;
  const inputDisabled = race.phase !== 'racing';
  const scenery = getSceneryTheme(race.sceneryId);
  const canEditScenery = host && race.phase === 'lobby';
  const roundLabel = `Round ${race.currentRound} of ${race.totalRounds}`;

  return (
    <PageShell
      eyebrow={`Room ${roomId}`}
      title={race.phase === 'match-results' ? 'Match results' : 'Ready, steady, type'}
      subtitle="Live progress updates as each player moves across the track."
      sceneryId={race.sceneryId}
    >
      <div className="room-topbar">
        <button className="button button--ghost" type="button" onClick={() => navigate('/')}>
          Home
        </button>
        <div className="room-topbar__pills">
          {race.phase !== 'lobby' ? <span className="round-pill">{roundLabel}</span> : null}
          <span className="theme-label">Scenery: {scenery.name}</span>
          <span className="theme-label">Difficulty: {difficultyLabels[race.promptDifficulty]}</span>
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
        <aside className="room-left-sidebar">
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
        </aside>

        <section className="race-panel">
          {race.phase === 'lobby' ? (
            <div className="lobby-state">
              <HostControls
                isHost={host}
                phase={race.phase}
                playerCount={race.playerCount}
                connectionStatus={race.connectionStatus}
                currentRound={race.currentRound}
                totalRounds={race.totalRounds}
                promptDifficulty={race.promptDifficulty}
                onTotalRoundsChange={race.changeTotalRounds}
                onDifficultyChange={race.changeDifficulty}
                onStartMatch={race.startMatch}
                onNextRound={race.nextRound}
                onPlayAgain={race.playAgain}
              />
              <RaceTrack playersById={race.playersById} />
            </div>
          ) : null}

          {race.phase === 'countdown' ? (
            <div className="countdown-state" aria-live="polite">
              <p className="round-pill">{roundLabel}</p>
              <p className="section-label">Starting in</p>
              <strong>{countdown}</strong>
            </div>
          ) : null}

          {race.phase === 'racing' ? (
            <div className="active-race">
              <div className="round-banner">
                <span>{roundLabel}</span>
              </div>
              <RaceTrack playersById={race.playersById} />
              <StatsBar metrics={metrics} />
              <TypingPrompt prompt={race.prompt} typed={typed} />
              <TypingInput value={typed} disabled={inputDisabled} onChange={setTyped} />
            </div>
          ) : null}

          {race.phase === 'round-results' && race.roundResult && race.winner ? (
            <div className="finished-race">
              <RoundResultsScreen
                roundNumber={race.currentRound}
                totalRounds={race.totalRounds}
                winner={race.winner}
                resultsByPlayerId={race.currentRoundResultsByPlayerId}
              />
              <RaceTrack playersById={race.playersById} />
              <HostControls
                isHost={host}
                phase={race.phase}
                playerCount={race.playerCount}
                connectionStatus={race.connectionStatus}
                currentRound={race.currentRound}
                totalRounds={race.totalRounds}
                promptDifficulty={race.promptDifficulty}
                onTotalRoundsChange={race.changeTotalRounds}
                onDifficultyChange={race.changeDifficulty}
                onStartMatch={race.startMatch}
                onNextRound={race.nextRound}
                onPlayAgain={race.playAgain}
              />
            </div>
          ) : null}

          {race.phase === 'match-results' ? (
            <div className="finished-race">
              <MatchResultsScreen
                winner={race.matchWinner}
                scores={race.matchScores}
                roundResults={race.roundResults}
              />
              <HostControls
                isHost={host}
                phase={race.phase}
                playerCount={race.playerCount}
                connectionStatus={race.connectionStatus}
                currentRound={race.currentRound}
                totalRounds={race.totalRounds}
                promptDifficulty={race.promptDifficulty}
                onTotalRoundsChange={race.changeTotalRounds}
                onDifficultyChange={race.changeDifficulty}
                onStartMatch={race.startMatch}
                onNextRound={race.nextRound}
                onPlayAgain={race.playAgain}
              />
            </div>
          ) : null}
        </section>

        <aside className="room-right-sidebar">
          <PlayerList playersById={race.playersById} onPlayerProfileClick={setSelectedProfilePlayer} />
          <MatchScoreboard playersById={race.playersById} scores={race.matchScores} />
          <RoomChat messages={race.chatMessages} onSendMessage={race.sendChatMessage} />
        </aside>
      </div>
      <ProfileModal player={selectedProfilePlayer} onClose={() => setSelectedProfilePlayer(null)} />
    </PageShell>
  );
}
