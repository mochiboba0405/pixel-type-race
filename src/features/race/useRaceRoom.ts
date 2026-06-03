import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { DEFAULT_SCENERY_ID } from '../../data/sceneryThemes';
import { canUseLocalDemoMode, hasSupabaseConfig, supabase } from '../../lib/supabaseClient';
import type { PlayerProfile } from '../profile/profileTypes';
import { getRoomChannelName, normalizeRoomId, saveRoomScenery } from '../room/roomUtils';
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
  MatchResultsPayload,
  MatchScore,
  PlayerProgressPayload,
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
  const roomCode = normalizeRoomId(roomId);
  const channelName = getRoomChannelName(roomCode);
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
    hasSupabaseConfig ? 'connecting' : canUseLocalDemoMode ? 'demo' : 'offline',
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const matchIdRef = useRef<string | null>(matchId);
  const roundIdRef = useRef<string | null>(roundId);
  const currentRoundRef = useRef(currentRound);
  const totalRoundsRef = useRef(totalRounds);
  const sceneryIdRef = useRef(sceneryId);
  const playersRef = useRef<PlayerRaceState[]>(players);
  const roundResultsRef = useRef<RoundResult[]>(roundResults);
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

  useEffect(() => {
    roundResultsRef.current = roundResults;
  }, [roundResults]);

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
        displayName: profile.username,
        avatarId: profile.avatarId,
        avatar: profile.avatar,
        favoriteSceneryId: profile.favoriteSceneryId,
        profileStats: profile.stats,
        isHost,
        sceneryId,
        lastSeen: Date.now(),
      };
    },
    [
      isHost,
      profile.avatar,
      profile.avatarId,
      profile.favoriteSceneryId,
      profile.id,
      profile.stats,
      profile.username,
      sceneryId,
      totalRounds,
    ],
  );

  const updateMyPresence = useCallback(
    (overrides: Partial<PlayerRaceState> = {}) => {
      const next = makeMyPlayer(overrides);
      myPlayerRef.current = next;

      setPlayers((current) => sortPlayers([next, ...current.filter((player) => player.playerId !== profile.id)]));

      if (channelRef.current) {
        void channelRef.current.track(next);
      }

      return next;
    },
    [makeMyPlayer, profile.id],
  );

  const sendRoomEvent = useCallback(
    (event: string, payload: unknown) => {
      const channel = channelRef.current;

      if (!channel) {
        console.warn('[type-race realtime] cannot send event without channel', {
          roomCode,
          channelName,
          event,
          payload,
        });
        return false;
      }

      console.log('[type-race realtime] sending event', {
        roomCode,
        channelName,
        event,
        payload,
      });

      void channel
        .send({
          type: 'broadcast',
          event,
          payload,
        })
        .then((response) => {
          console.log('[type-race realtime] event send result', {
            roomCode,
            channelName,
            event,
            response,
          });
        })
        .catch((error: unknown) => {
          console.error('[type-race realtime] event send failed', {
            roomCode,
            channelName,
            event,
            error,
          });
        });

      return true;
    },
    [channelName, roomCode],
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

  const applyMatchResults = useCallback((payload: MatchResultsPayload) => {
    const finalRound = payload.roundResults[payload.roundResults.length - 1] ?? null;

    setRoundResults(payload.roundResults);
    setMatchScores(payload.scores);
    setMatchWinner(payload.winner);

    if (finalRound) {
      setWinner(finalRound.winner);
      setRoundResult(finalRound);
      setCurrentRound(finalRound.roundNumber);
      setTotalRounds(finalRound.totalRounds);
    }

    setMatchId(payload.matchId);
    setPhase('match-results');
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
      console.warn('[type-race realtime] Missing Supabase config. Multiplayer is disabled.', {
        roomCode,
        channelName,
        canUseLocalDemoMode,
      });
      setConnectionStatus(canUseLocalDemoMode ? 'demo' : 'offline');

      if (canUseLocalDemoMode) {
        updateMyPresence();
      } else {
        setPlayers([]);
      }

      return undefined;
    }

    setConnectionStatus('connecting');

    console.log('[type-race realtime] joining room channel', {
      roomCode,
      channelName,
      playerId: profile.id,
      isHost,
    });

    const client = supabase;
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: profile.id },
      },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, PlayerRaceState[]>;
        const nextPlayers = Object.values(state).flat();
        console.log('[type-race realtime] presence sync', {
          roomCode,
          channelName,
          playerCount: nextPlayers.length,
          players: nextPlayers.map((player) => player.displayName),
        });
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
      .on('presence', { event: 'join' }, (payload) => {
        console.log('[type-race realtime] player join', {
          roomCode,
          channelName,
          payload,
        });
      })
      .on('presence', { event: 'leave' }, (payload) => {
        console.log('[type-race realtime] player leave', {
          roomCode,
          channelName,
          payload,
        });
      })
      .on('broadcast', { event: 'race-start' }, ({ payload }) => {
        console.log('[type-race realtime] race start event received', {
          roomCode,
          channelName,
          payload,
        });
        beginRace(payload as RaceStartPayload);
      })
      .on('broadcast', { event: 'player-progress' }, ({ payload }) => {
        const nextPlayer = (payload as PlayerProgressPayload).player;
        console.log('[type-race realtime] progress event received', {
          roomCode,
          channelName,
          playerId: nextPlayer.playerId,
          progress: nextPlayer.progress,
        });
        setPlayers((current) =>
          sortPlayers([nextPlayer, ...current.filter((player) => player.playerId !== nextPlayer.playerId)]),
        );
      })
      .on('broadcast', { event: 'match-config' }, ({ payload }) => {
        console.log('[type-race realtime] match config event received', {
          roomCode,
          channelName,
          payload,
        });
        const nextTotalRounds = (payload as MatchConfigPayload).totalRounds;
        setTotalRounds(nextTotalRounds);
        updateMyPresence({ totalRounds: nextTotalRounds });
      })
      .on('broadcast', { event: 'scenery-change' }, ({ payload }) => {
        console.log('[type-race realtime] scenery event received', {
          roomCode,
          channelName,
          payload,
        });
        const nextScenery = (payload as SceneryChangePayload).sceneryId;
        setSceneryId(nextScenery);
        saveRoomScenery(roomId, nextScenery);
        updateMyPresence({ sceneryId: nextScenery });
      })
      .on('broadcast', { event: 'race-finish' }, ({ payload }) => {
        console.log('[type-race realtime] race finish event received', {
          roomCode,
          channelName,
          payload,
        });
        applyRoundResult((payload as RaceFinishPayload).result);
      })
      .on('broadcast', { event: 'match-results' }, ({ payload }) => {
        console.log('[type-race realtime] match results event received', {
          roomCode,
          channelName,
          payload,
        });
        applyMatchResults(payload as MatchResultsPayload);
      })
      .subscribe((status) => {
        console.log('[type-race realtime] subscription status', {
          roomCode,
          channelName,
          status,
        });

        if (status === 'SUBSCRIBED') {
          setConnectionStatus('online');
          updateMyPresence();
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('offline');
        }
      });

    return () => {
      console.log('[type-race realtime] leaving room channel', {
        roomCode,
        channelName,
        playerId: profile.id,
      });
      void channel.untrack();
      void client.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    applyRoundResult,
    applyMatchResults,
    beginRace,
    canUseLocalDemoMode,
    channelName,
    isHost,
    profile.id,
    roomCode,
    roomId,
    updateMyPresence,
  ]);

  const changeScenery = useCallback(
    (nextSceneryId: string) => {
      setSceneryId(nextSceneryId);
      saveRoomScenery(roomId, nextSceneryId);
      updateMyPresence({ sceneryId: nextSceneryId });

      if (channelRef.current) {
        sendRoomEvent('scenery-change', { sceneryId: nextSceneryId } satisfies SceneryChangePayload);
      }
    },
    [roomId, sendRoomEvent, updateMyPresence],
  );

  const changeTotalRounds = useCallback(
    (nextTotalRounds: RoundCount) => {
      setTotalRounds(nextTotalRounds);
      updateMyPresence({ totalRounds: nextTotalRounds });

      if (channelRef.current) {
        sendRoomEvent('match-config', { totalRounds: nextTotalRounds } satisfies MatchConfigPayload);
      }
    },
    [sendRoomEvent, updateMyPresence],
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

      console.log('[type-race realtime] sending race start event', {
        roomCode,
        channelName,
        matchId: payload.matchId,
        roundNumber: payload.roundNumber,
        totalRounds: payload.totalRounds,
      });

      const sentThroughRealtime = sendRoomEvent('race-start', payload);

      if (!sentThroughRealtime) {
        beginRace(payload);
      }
    },
    [beginRace, channelName, roomCode, sendRoomEvent],
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

      const nextPlayer = updateMyPresence({
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: metrics.finished,
        finishMs: metrics.finished ? metrics.elapsedMs : undefined,
      });

      if (channelRef.current) {
        sendRoomEvent('player-progress', { player: nextPlayer } satisfies PlayerProgressPayload);
      }

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
        displayName: profile.username,
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
        sendRoomEvent('race-finish', payload);

        if (result.roundNumber >= result.totalRounds) {
          const finalRoundResults = [
            ...roundResultsRef.current.filter((savedResult) => savedResult.roundId !== result.roundId),
            result,
          ].sort((first, second) => first.roundNumber - second.roundNumber);
          const finalScores = buildMatchScores(finalRoundResults);
          const matchResultsPayload: MatchResultsPayload = {
            matchId: currentMatchId,
            totalRounds: result.totalRounds,
            roundResults: finalRoundResults,
            scores: finalScores,
            winner: getMatchWinner(finalScores),
          };

          sendRoomEvent('match-results', matchResultsPayload);
        }
      }
    },
    [applyRoundResult, createRoundResult, profile.id, profile.username, sendRoomEvent, updateMyPresence],
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
