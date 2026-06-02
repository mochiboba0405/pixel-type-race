import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { DEFAULT_SCENERY_ID } from '../../data/sceneryThemes';
import { hasSupabaseConfig, supabase } from '../../lib/supabaseClient';
import type { PlayerProfile } from '../profile/profileTypes';
import { saveRoomScenery } from '../room/roomUtils';
import { DEFAULT_PROMPT, createRoundId, getRandomPrompt, sortPlayers } from './raceUtils';
import type {
  ConnectionStatus,
  PlayerRaceState,
  RaceFinishPayload,
  RacePhase,
  RaceStartPayload,
  SceneryChangePayload,
  TypingMetrics,
} from './raceTypes';

type UseRaceRoomArgs = {
  roomId: string;
  profile: PlayerProfile;
  isHost: boolean;
  initialSceneryId?: string | null;
};

export function useRaceRoom({ roomId, profile, isHost, initialSceneryId }: UseRaceRoomArgs) {
  const [phase, setPhase] = useState<RacePhase>('lobby');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sceneryId, setSceneryId] = useState(initialSceneryId ?? DEFAULT_SCENERY_ID);
  const [winner, setWinner] = useState<RaceFinishPayload | null>(null);
  const [players, setPlayers] = useState<PlayerRaceState[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    hasSupabaseConfig ? 'connecting' : 'demo',
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const roundIdRef = useRef<string | null>(roundId);
  const sceneryIdRef = useRef(sceneryId);
  const myPlayerRef = useRef<PlayerRaceState | null>(null);
  const finishSentForRoundRef = useRef<string | null>(null);

  useEffect(() => {
    roundIdRef.current = roundId;
  }, [roundId]);

  useEffect(() => {
    sceneryIdRef.current = sceneryId;
  }, [sceneryId]);

  const makeMyPlayer = useCallback(
    (overrides: Partial<PlayerRaceState> = {}): PlayerRaceState => {
      const previous = myPlayerRef.current;

      return {
        ...(previous ?? {}),
        progress: previous?.progress ?? 0,
        wpm: previous?.wpm ?? 0,
        accuracy: previous?.accuracy ?? 100,
        finished: previous?.finished ?? false,
        ...overrides,
        playerId: profile.id,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
        avatar: profile.avatar,
        isHost,
        sceneryId,
        lastSeen: Date.now(),
      };
    },
    [isHost, profile.avatar, profile.avatarId, profile.displayName, profile.id, sceneryId],
  );

  const updateMyPresence = useCallback(
    (overrides: Partial<PlayerRaceState> = {}) => {
      const next = makeMyPlayer(overrides);
      myPlayerRef.current = next;

      setPlayers((current) =>
        sortPlayers([next, ...current.filter((player) => player.playerId !== profile.id)]),
      );

      if (channelRef.current) {
        void channelRef.current.track(next);
      }
    },
    [makeMyPlayer, profile.id],
  );

  const beginRace = useCallback(
    (payload: RaceStartPayload) => {
      finishSentForRoundRef.current = null;
      setSceneryId(payload.sceneryId);
      saveRoomScenery(roomId, payload.sceneryId);
      setPrompt(payload.prompt);
      setRoundId(payload.roundId);
      setStartedAt(payload.startedAt);
      setWinner(null);
      setPhase('countdown');
      updateMyPresence({
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishMs: undefined,
        sceneryId: payload.sceneryId,
      });
    },
    [roomId, updateMyPresence],
  );

  useEffect(() => {
    if (phase !== 'countdown' || !startedAt) {
      return undefined;
    }

    const delay = Math.max(0, startedAt - Date.now());
    const timeoutId = window.setTimeout(() => {
      setPhase('racing');
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [phase, startedAt]);

  useEffect(() => {
    updateMyPresence();
  }, [updateMyPresence]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setConnectionStatus('demo');
      updateMyPresence();
      return undefined;
    }

    setConnectionStatus('connecting');

    const client = supabase;
    const channel = client.channel(`typing-race:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: profile.id },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, PlayerRaceState[]>;
        const nextPlayers = Object.values(state).flat();
        setPlayers(sortPlayers(nextPlayers));

        const hostPlayer = nextPlayers.find((player) => player.isHost && player.sceneryId);

        if (hostPlayer && !isHost && hostPlayer.sceneryId !== sceneryIdRef.current) {
          setSceneryId(hostPlayer.sceneryId);
          saveRoomScenery(roomId, hostPlayer.sceneryId);
        }
      })
      .on('broadcast', { event: 'race-start' }, ({ payload }) => {
        beginRace(payload as RaceStartPayload);
      })
      .on('broadcast', { event: 'scenery-change' }, ({ payload }) => {
        const nextScenery = (payload as SceneryChangePayload).sceneryId;
        setSceneryId(nextScenery);
        saveRoomScenery(roomId, nextScenery);
        updateMyPresence({ sceneryId: nextScenery });
      })
      .on('broadcast', { event: 'race-finish' }, ({ payload }) => {
        const nextWinner = payload as RaceFinishPayload;

        setWinner((current) => current ?? nextWinner);
        setPhase('finished');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('online');
          updateMyPresence();
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('offline');
        }
      });

    channelRef.current = channel;

    return () => {
      void channel.untrack();
      void client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [beginRace, isHost, profile.id, roomId, updateMyPresence]);

  const changeScenery = useCallback(
    (nextSceneryId: string) => {
      setSceneryId(nextSceneryId);
      saveRoomScenery(roomId, nextSceneryId);
      updateMyPresence({ sceneryId: nextSceneryId });

      if (channelRef.current) {
        void channelRef.current.send({
          type: 'broadcast',
          event: 'scenery-change',
          payload: { sceneryId: nextSceneryId } satisfies SceneryChangePayload,
        });
      }
    },
    [roomId, updateMyPresence],
  );

  const startRace = useCallback(() => {
    const payload: RaceStartPayload = {
      prompt: getRandomPrompt(),
      roundId: createRoundId(),
      startedAt: Date.now() + 3000,
      sceneryId: sceneryIdRef.current,
    };

    if (channelRef.current) {
      void channelRef.current.send({
        type: 'broadcast',
        event: 'race-start',
        payload,
      });
    }

    beginRace(payload);
  }, [beginRace]);

  const updateMyProgress = useCallback(
    (metrics: TypingMetrics) => {
      const currentRoundId = roundIdRef.current;

      updateMyPresence({
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: metrics.finished,
        finishMs: metrics.finished ? metrics.elapsedMs : undefined,
      });

      if (!metrics.finished || !currentRoundId || finishSentForRoundRef.current === currentRoundId) {
        return;
      }

      finishSentForRoundRef.current = currentRoundId;

      const payload: RaceFinishPayload = {
        playerId: profile.id,
        displayName: profile.displayName,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finishMs: metrics.elapsedMs,
        roundId: currentRoundId,
      };

      setWinner((current) => current ?? payload);
      setPhase('finished');

      if (channelRef.current) {
        void channelRef.current.send({
          type: 'broadcast',
          event: 'race-finish',
          payload,
        });
      }
    },
    [profile.displayName, profile.id, updateMyPresence],
  );

  return {
    connectionStatus,
    phase,
    prompt,
    roundId,
    startedAt,
    winner,
    players,
    sceneryId,
    startRace,
    changeScenery,
    updateMyProgress,
  };
}
