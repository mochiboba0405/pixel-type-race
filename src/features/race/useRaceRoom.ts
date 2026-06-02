import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { DEFAULT_SCENERY_ID } from '../../data/sceneryThemes';
import { hasSupabaseConfig, supabase } from '../../lib/supabaseClient';
import type { PlayerProfile } from '../profile/profileTypes';
import { saveRoomScenery } from '../room/roomUtils';
import {
  DEFAULT_PROMPT,
  DEFAULT_ROUND_COUNT,
  buildMatchScores,
  createMatchId,
  createRoundId,
  getMatchWinner,
  getRandomPrompt,
  sortPlayers,
} from './raceUtils';
import type {
  ConnectionStatus,
  MatchConfigPayload,
  MatchScore,
  PlayerRaceState,
  RaceFinishPayload,
  RacePhase,
  RaceStartPayload,
  RoundCount,
  RoundResult,
  RoundWinner,
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
  const [matchId, setMatchId] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState<RoundCount>(DEFAULT_ROUND_COUNT);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sceneryId, setSceneryId] = useState(initialSceneryId ?? DEFAULT_SCENERY_ID);
  const [winner, setWinner] = useState<RoundWinner | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [matchWinner, setMatchWinner] = useState<MatchScore | null>(null);
  const [players, setPlayers] = useState<PlayerRaceState[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    hasSupabaseConfig ? 'connecting' : 'demo',
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const matchIdRef = useRef<string | null>(matchId);
  const roundIdRef = useRef<string | null>(roundId);
  const currentRoundRef = useRef(currentRound);
  const totalRoundsRef = useRef(totalRounds);
  const sceneryIdRef = useRef(sceneryId);
  const playersRef = useRef<PlayerRaceState[]>(players);
  const myPlayerRef = useRef<PlayerRaceState | null>(null);
  const promptHistoryRef = useRef<string[]>([]);
  const finishSentForRoundRef = useRef<string | null>(null);

  useEffect(() => {
    matchIdRef.current = matchId;
  }, [matchId]);

  useEffect(() => {
    roundIdRef.current = roundId;
  }, [roundId]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    totalRoundsRef.current = totalRounds;
  }, [totalRounds]);

  useEffect(() => {
    sceneryIdRef.current = sceneryId;
  }, [sceneryId]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const makeMyPlayer = useCallback(
    (overrides: Partial<PlayerRaceState> = {}): PlayerRaceState => {
      const previous = myPlayerRef.current;

      return {
        ...(previous ?? {}),
        progress: previous?.progress ?? 0,
        wpm: previous?.wpm ?? 0,
        accuracy: previous?.accuracy ?? 100,
        finished: previous?.finished ?? false,
        totalRounds,
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
    [isHost, profile.avatar, profile.avatarId, profile.displayName, profile.id, sceneryId, totalRounds],
  );

  const updateMyPresence = useCallback(
    (overrides: Partial<PlayerRaceState> = {}) => {
      const next = makeMyPlayer(overrides);
      myPlayerRef.current = next;

      setPlayers((current) => sortPlayers([next, ...current.filter((player) => player.playerId !== profile.id)]));

      if (channelRef.current) {
        void channelRef.current.track(next);
      }
    },
    [makeMyPlayer, profile.id],
  );

  const createRoundResult = useCallback(
    (roundWinner: RoundWinner, metrics: TypingMetrics): RoundResult => {
      const currentPlayer = makeMyPlayer({
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: true,
        finishMs: metrics.elapsedMs,
      });
      const knownPlayers = sortPlayers([
        currentPlayer,
        ...playersRef.current.filter((player) => player.playerId !== currentPlayer.playerId),
      ]);

      return {
        matchId: matchIdRef.current ?? createMatchId(),
        roundId: roundIdRef.current ?? createRoundId(),
        roundNumber: currentRoundRef.current,
        totalRounds: totalRoundsRef.current,
        winner: roundWinner,
        players: knownPlayers.map((player) => {
          const isWinner = player.playerId === roundWinner.playerId;

          return {
            playerId: player.playerId,
            displayName: player.displayName,
            avatarId: player.avatarId,
            avatar: player.avatar,
            wpm: isWinner ? roundWinner.wpm : player.wpm,
            accuracy: isWinner ? roundWinner.accuracy : player.accuracy,
            finished: isWinner || player.finished,
            finishMs: isWinner ? roundWinner.finishMs : player.finishMs,
          };
        }),
      };
    },
    [makeMyPlayer],
  );

  const applyRoundResult = useCallback((result: RoundResult) => {
    setWinner(result.winner);
    setRoundResult(result);
    setPhase(result.roundNumber >= result.totalRounds ? 'match-results' : 'round-results');

    setRoundResults((current) => {
      const alreadySaved = current.some((savedResult) => savedResult.roundId === result.roundId);
      const next = alreadySaved
        ? current
        : [...current, result].sort((first, second) => first.roundNumber - second.roundNumber);
      const scores = buildMatchScores(next);

      setMatchScores(scores);
      setMatchWinner(result.roundNumber >= result.totalRounds ? getMatchWinner(scores) : null);

      return next;
    });
  }, []);

  const beginRace = useCallback(
    (payload: RaceStartPayload) => {
      finishSentForRoundRef.current = null;
      setMatchId(payload.matchId);
      setCurrentRound(payload.roundNumber);
      setTotalRounds(payload.totalRounds);
      setSceneryId(payload.sceneryId);
      saveRoomScenery(roomId, payload.sceneryId);
      setPrompt(payload.prompt);
      setRoundId(payload.roundId);
      setStartedAt(payload.startedAt);
      setWinner(null);
      setRoundResult(null);
      setMatchWinner(null);

      if (payload.roundNumber === 1) {
        setRoundResults([]);
        setMatchScores([]);
      }

      setPhase('countdown');
      updateMyPresence({
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishMs: undefined,
        sceneryId: payload.sceneryId,
        totalRounds: payload.totalRounds,
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

        if (hostPlayer && !isHost) {
          if (hostPlayer.sceneryId !== sceneryIdRef.current) {
            setSceneryId(hostPlayer.sceneryId);
            saveRoomScenery(roomId, hostPlayer.sceneryId);
          }

          if (hostPlayer.totalRounds && hostPlayer.totalRounds !== totalRoundsRef.current) {
            setTotalRounds(hostPlayer.totalRounds);
          }
        }
      })
      .on('broadcast', { event: 'race-start' }, ({ payload }) => {
        beginRace(payload as RaceStartPayload);
      })
      .on('broadcast', { event: 'match-config' }, ({ payload }) => {
        const nextTotalRounds = (payload as MatchConfigPayload).totalRounds;
        setTotalRounds(nextTotalRounds);
        updateMyPresence({ totalRounds: nextTotalRounds });
      })
      .on('broadcast', { event: 'scenery-change' }, ({ payload }) => {
        const nextScenery = (payload as SceneryChangePayload).sceneryId;
        setSceneryId(nextScenery);
        saveRoomScenery(roomId, nextScenery);
        updateMyPresence({ sceneryId: nextScenery });
      })
      .on('broadcast', { event: 'race-finish' }, ({ payload }) => {
        applyRoundResult((payload as RaceFinishPayload).result);
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
  }, [applyRoundResult, beginRace, isHost, profile.id, roomId, updateMyPresence]);

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

  const changeTotalRounds = useCallback(
    (nextTotalRounds: RoundCount) => {
      setTotalRounds(nextTotalRounds);
      updateMyPresence({ totalRounds: nextTotalRounds });

      if (channelRef.current) {
        void channelRef.current.send({
          type: 'broadcast',
          event: 'match-config',
          payload: { totalRounds: nextTotalRounds } satisfies MatchConfigPayload,
        });
      }
    },
    [updateMyPresence],
  );

  const startRound = useCallback(
    (nextMatchId: string, roundNumber: number, nextTotalRounds: RoundCount) => {
      const nextPrompt = getRandomPrompt(promptHistoryRef.current);
      promptHistoryRef.current = [...promptHistoryRef.current, nextPrompt];

      const payload: RaceStartPayload = {
        matchId: nextMatchId,
        prompt: nextPrompt,
        roundId: createRoundId(),
        roundNumber,
        totalRounds: nextTotalRounds,
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
    },
    [beginRace],
  );

  const startMatch = useCallback(() => {
    const nextMatchId = createMatchId();
    promptHistoryRef.current = [];
    startRound(nextMatchId, 1, totalRoundsRef.current);
  }, [startRound]);

  const nextRound = useCallback(() => {
    const nextMatchId = matchIdRef.current ?? createMatchId();
    const roundNumber = Math.min(currentRoundRef.current + 1, totalRoundsRef.current);
    startRound(nextMatchId, roundNumber, totalRoundsRef.current);
  }, [startRound]);

  const playAgain = useCallback(() => {
    const nextMatchId = createMatchId();
    promptHistoryRef.current = [];
    startRound(nextMatchId, 1, totalRoundsRef.current);
  }, [startRound]);

  const updateMyProgress = useCallback(
    (metrics: TypingMetrics) => {
      const currentRoundId = roundIdRef.current;
      const currentMatchId = matchIdRef.current;

      updateMyPresence({
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: metrics.finished,
        finishMs: metrics.finished ? metrics.elapsedMs : undefined,
      });

      if (
        !metrics.finished ||
        !currentRoundId ||
        !currentMatchId ||
        finishSentForRoundRef.current === currentRoundId
      ) {
        return;
      }

      finishSentForRoundRef.current = currentRoundId;

      const roundWinner: RoundWinner = {
        playerId: profile.id,
        displayName: profile.displayName,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finishMs: metrics.elapsedMs,
      };
      const result = createRoundResult(roundWinner, metrics);
      const payload: RaceFinishPayload = {
        matchId: currentMatchId,
        roundId: currentRoundId,
        roundNumber: result.roundNumber,
        totalRounds: result.totalRounds,
        winner: roundWinner,
        result,
      };

      applyRoundResult(result);

      if (channelRef.current) {
        void channelRef.current.send({
          type: 'broadcast',
          event: 'race-finish',
          payload,
        });
      }
    },
    [applyRoundResult, createRoundResult, profile.displayName, profile.id, updateMyPresence],
  );

  return {
    connectionStatus,
    phase,
    prompt,
    matchId,
    roundId,
    currentRound,
    totalRounds,
    startedAt,
    winner,
    roundResult,
    roundResults,
    matchScores,
    matchWinner,
    players,
    sceneryId,
    startMatch,
    nextRound,
    playAgain,
    changeScenery,
    changeTotalRounds,
    updateMyProgress,
  };
}
