import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  dedupePlayers,
  dedupeRoundResult,
  dedupeRoundResults,
  dedupeRoundPlayers,
  getMatchWinner,
  getRandomPrompt,
  sortPlayers,
} from './raceUtils';
import type {
  ConnectionStatus,
  MatchConfigPayload,
  MatchResultsPayload,
  MatchScore,
  NextRoundPayload,
  PlayerProgressPayload,
  PlayerRaceState,
  RaceFinishPayload,
  RacePhase,
  RaceStartPayload,
  ResetRoundProgressPayload,
  RoundCount,
  RoundPlayerResult,
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

type PlayersById = Record<string, PlayerRaceState>;
type ProgressByPlayerId = Record<
  string,
  Pick<PlayerRaceState, 'progress' | 'wpm' | 'accuracy' | 'finished' | 'finishMs' | 'lastSeen'>
>;
type ResultsByRound = Record<number, Record<string, RoundPlayerResult>>;
type RoundWinnersByRound = Record<number, RoundWinner>;
type RoundMetaByRound = Record<
  number,
  {
    matchId: string;
    roundId: string;
    roundNumber: number;
    totalRounds: RoundCount;
  }
>;

function getCanonicalPlayerId(player: Pick<PlayerRaceState, 'playerId'>) {
  return player.playerId;
}

function getRoundResultKey(result: Pick<RoundResult, 'roundNumber'>) {
  return result.roundNumber;
}

function getProgressPlayer(player: PlayerRaceState, progress?: ProgressByPlayerId[string]): PlayerRaceState {
  return {
    ...player,
    progress: progress?.progress ?? player.progress,
    wpm: progress?.wpm ?? player.wpm,
    accuracy: progress?.accuracy ?? player.accuracy,
    finished: progress?.finished ?? player.finished,
    finishMs: progress?.finishMs ?? player.finishMs,
    lastSeen: Math.max(player.lastSeen, progress?.lastSeen ?? 0),
  };
}

function getPlayersWithProgress(playersById: PlayersById, progressByPlayerId: ProgressByPlayerId) {
  return sortPlayers(
    Object.values(playersById).map((player) => getProgressPlayer(player, progressByPlayerId[getCanonicalPlayerId(player)])),
  );
}

function getPlayersByIdWithProgress(playersById: PlayersById, progressByPlayerId: ProgressByPlayerId): PlayersById {
  return getPlayersWithProgress(playersById, progressByPlayerId).reduce<PlayersById>((nextPlayersById, player) => {
    nextPlayersById[getCanonicalPlayerId(player)] = player;
    return nextPlayersById;
  }, {});
}

function getRoundMeta(result: RoundResult): RoundMetaByRound[number] {
  return {
    matchId: result.matchId,
    roundId: result.roundId,
    roundNumber: result.roundNumber,
    totalRounds: result.totalRounds,
  };
}

function getRoundPlayersById(result: RoundResult, activePlayersById: PlayersById = {}) {
  const activePlayerIds = new Set(Object.keys(activePlayersById));
  const shouldFilterToActivePlayers = activePlayerIds.size > 0;

  return dedupeRoundPlayers(result.players).reduce<Record<string, RoundPlayerResult>>((playersById, player) => {
    if (!shouldFilterToActivePlayers || activePlayerIds.has(player.playerId)) {
      playersById[player.playerId] = player;
    }

    return playersById;
  }, {});
}

function mergeRoundPlayerResult(
  currentPlayer: RoundPlayerResult | undefined,
  nextPlayer: RoundPlayerResult,
): RoundPlayerResult {
  if (!currentPlayer) {
    return nextPlayer;
  }

  if (nextPlayer.finished && !currentPlayer.finished) {
    return nextPlayer;
  }

  if (
    nextPlayer.finished === currentPlayer.finished &&
    (nextPlayer.finishMs ?? Number.MAX_SAFE_INTEGER) < (currentPlayer.finishMs ?? Number.MAX_SAFE_INTEGER)
  ) {
    return nextPlayer;
  }

  return currentPlayer;
}

function mergeResultPlayersById(
  currentPlayersById: Record<string, RoundPlayerResult> = {},
  nextPlayersById: Record<string, RoundPlayerResult>,
) {
  return Object.entries(nextPlayersById).reduce<Record<string, RoundPlayerResult>>(
    (playersById, [playerId, nextPlayer]) => {
      playersById[playerId] = mergeRoundPlayerResult(playersById[playerId], nextPlayer);
      return playersById;
    },
    { ...currentPlayersById },
  );
}

function mergeResultsByRound(
  current: ResultsByRound,
  result: RoundResult,
  activePlayersById: PlayersById,
): ResultsByRound {
  const roundNumber = getRoundResultKey(result);
  const nextPlayersById = getRoundPlayersById(dedupeRoundResult(result), activePlayersById);

  return {
    ...current,
    [roundNumber]: mergeResultPlayersById(current[roundNumber], nextPlayersById),
  };
}

function getRoundResultFromMaps(
  roundNumber: number,
  resultsByRound: ResultsByRound,
  winnersByRound: RoundWinnersByRound,
  metaByRound: RoundMetaByRound,
): RoundResult | null {
  const winner = winnersByRound[roundNumber];
  const meta = metaByRound[roundNumber];
  const playersById = resultsByRound[roundNumber];

  if (!winner || !meta || !playersById) {
    return null;
  }

  return dedupeRoundResult({
    ...meta,
    winner,
    players: Object.values(playersById),
  });
}

function getRoundResultsFromMaps(
  resultsByRound: ResultsByRound,
  winnersByRound: RoundWinnersByRound,
  metaByRound: RoundMetaByRound,
) {
  return Object.keys(resultsByRound)
    .map((roundNumber) =>
      getRoundResultFromMaps(Number(roundNumber), resultsByRound, winnersByRound, metaByRound),
    )
    .filter((result): result is RoundResult => Boolean(result))
    .sort((first, second) => first.roundNumber - second.roundNumber);
}

function getResultsByRoundFromResults(results: RoundResult[], activePlayersById: PlayersById = {}) {
  return dedupeRoundResults(results).reduce<{
    resultsByRound: ResultsByRound;
    winnersByRound: RoundWinnersByRound;
    metaByRound: RoundMetaByRound;
  }>(
    (state, result) => {
      const roundNumber = getRoundResultKey(result);

      return {
        resultsByRound: mergeResultsByRound(state.resultsByRound, result, activePlayersById),
        winnersByRound: {
          ...state.winnersByRound,
          [roundNumber]: state.winnersByRound[roundNumber] ?? result.winner,
        },
        metaByRound: {
          ...state.metaByRound,
          [roundNumber]: state.metaByRound[roundNumber] ?? getRoundMeta(result),
        },
      };
    },
    { resultsByRound: {}, winnersByRound: {}, metaByRound: {} },
  );
}

function getRoundResultWithActivePlayers(result: RoundResult, activePlayersById: PlayersById): RoundResult {
  const activePlayers = Object.values(activePlayersById);
  const cleanResult = dedupeRoundResult(result);
  const resultPlayersById = getRoundPlayersById(cleanResult, activePlayersById);

  return dedupeRoundResult({
    ...cleanResult,
    players: activePlayers.map((player) => {
      const resultPlayer = resultPlayersById[player.playerId];

      return (
        resultPlayer ?? {
          playerId: player.playerId,
          displayName: player.displayName,
          avatarId: player.avatarId,
          avatar: player.avatar,
          wpm: player.wpm,
          accuracy: player.accuracy,
          finished: player.finished,
          finishMs: player.finishMs,
        }
      );
    }),
  });
}

function logResultsByRoundKeys(roomCode: string, channelName: string, resultsByRound: ResultsByRound) {
  console.log('[type-race realtime] resultsByRound keys', {
    roomCode,
    channelName,
    rounds: Object.fromEntries(
      Object.entries(resultsByRound).map(([roundNumber, playersById]) => [roundNumber, Object.keys(playersById)]),
    ),
  });
}

function getPlayerProgress(player: PlayerRaceState): ProgressByPlayerId[string] {
  return {
    progress: player.progress,
    wpm: player.wpm,
    accuracy: player.accuracy,
    finished: player.finished,
    finishMs: player.finishMs,
    lastSeen: player.lastSeen,
  };
}

function getPlayersById(players: PlayerRaceState[], currentPlayersById: PlayersById = {}): PlayersById {
  return dedupePlayers(players).reduce<PlayersById>((playersById, player) => {
    const currentPlayer = currentPlayersById[player.playerId];

    playersById[player.playerId] = {
      ...player,
      progress: currentPlayer?.progress ?? player.progress,
      wpm: currentPlayer?.wpm ?? player.wpm,
      accuracy: currentPlayer?.accuracy ?? player.accuracy,
      finished: currentPlayer?.finished ?? player.finished,
      finishMs: currentPlayer?.finishMs ?? player.finishMs,
    };

    return playersById;
  }, {});
}

function mergePlayerById(playersById: PlayersById, player: PlayerRaceState): PlayersById {
  const currentPlayer = playersById[player.playerId];

  return {
    ...playersById,
    [player.playerId]: {
      ...currentPlayer,
      ...player,
      lastSeen: Math.max(currentPlayer?.lastSeen ?? 0, player.lastSeen),
    },
  };
}

export function useRaceRoom({ roomId, profile, isHost, initialSceneryId }: UseRaceRoomArgs) {
  const roomCode = normalizeRoomId(roomId);
  const channelName = getRoomChannelName(roomCode);
  const channelKey = `${channelName}:${profile.id}`;
  const [phase, setPhase] = useState<RacePhase>('lobby');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState<RoundCount>(DEFAULT_ROUND_COUNT);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sceneryId, setSceneryId] = useState(initialSceneryId ?? DEFAULT_SCENERY_ID);
  const [resultsByRound, setResultsByRound] = useState<ResultsByRound>({});
  const [roundWinnersByRound, setRoundWinnersByRound] = useState<RoundWinnersByRound>({});
  const [roundMetaByRound, setRoundMetaByRound] = useState<RoundMetaByRound>({});
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [matchWinner, setMatchWinner] = useState<MatchScore | null>(null);
  const [playersById, setPlayersById] = useState<PlayersById>({});
  const [progressByPlayerId, setProgressByPlayerId] = useState<ProgressByPlayerId>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    hasSupabaseConfig ? 'connecting' : canUseLocalDemoMode ? 'demo' : 'offline',
  );
  const players = useMemo(() => getPlayersWithProgress(playersById, progressByPlayerId), [playersById, progressByPlayerId]);
  const renderedPlayersById = useMemo(
    () => getPlayersByIdWithProgress(playersById, progressByPlayerId),
    [playersById, progressByPlayerId],
  );
  const roundResults = useMemo(
    () => getRoundResultsFromMaps(resultsByRound, roundWinnersByRound, roundMetaByRound),
    [resultsByRound, roundMetaByRound, roundWinnersByRound],
  );
  const roundResult = useMemo(
    () => getRoundResultFromMaps(currentRound, resultsByRound, roundWinnersByRound, roundMetaByRound),
    [currentRound, resultsByRound, roundMetaByRound, roundWinnersByRound],
  );
  const winner = roundResult?.winner ?? null;
  const playerCount = useMemo(() => Object.keys(playersById).length, [playersById]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const activeChannelKeyRef = useRef<string | null>(null);
  const matchIdRef = useRef<string | null>(matchId);
  const roundIdRef = useRef<string | null>(roundId);
  const currentRoundRef = useRef(currentRound);
  const totalRoundsRef = useRef(totalRounds);
  const sceneryIdRef = useRef(sceneryId);
  const playersByIdRef = useRef<PlayersById>(playersById);
  const progressByPlayerIdRef = useRef<ProgressByPlayerId>(progressByPlayerId);
  const resultsByRoundRef = useRef<ResultsByRound>(resultsByRound);
  const roundWinnersByRoundRef = useRef<RoundWinnersByRound>(roundWinnersByRound);
  const roundMetaByRoundRef = useRef<RoundMetaByRound>(roundMetaByRound);
  const myPlayerRef = useRef<PlayerRaceState | null>(null);
  const promptHistoryRef = useRef<string[]>([]);
  const finishSentForRoundRef = useRef<string | null>(null);
  const lastProgressBroadcastAtRef = useRef(0);
  const connectionStatusRef = useRef<ConnectionStatus>(connectionStatus);
  const isHostRef = useRef(isHost);
  const roomIdRef = useRef(roomId);

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
    playersByIdRef.current = playersById;
  }, [playersById]);

  useEffect(() => {
    progressByPlayerIdRef.current = progressByPlayerId;
  }, [progressByPlayerId]);

  useEffect(() => {
    resultsByRoundRef.current = resultsByRound;
  }, [resultsByRound]);

  useEffect(() => {
    roundWinnersByRoundRef.current = roundWinnersByRound;
  }, [roundWinnersByRound]);

  useEffect(() => {
    roundMetaByRoundRef.current = roundMetaByRound;
  }, [roundMetaByRound]);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const setLoggedConnectionStatus = useCallback(
    (nextStatus: ConnectionStatus, reason: string) => {
      if (connectionStatusRef.current !== nextStatus) {
        console.log('[type-race realtime] status change', {
          roomCode,
          channelName,
          playerId: profile.id,
          from: connectionStatusRef.current,
          to: nextStatus,
          reason,
        });
      }

      connectionStatusRef.current = nextStatus;
      setConnectionStatus(nextStatus);
    },
    [channelName, profile.id, roomCode],
  );

  const logActiveChannelStatus = useCallback(
    (label: string) => {
      console.log('[type-race realtime] active channel status', {
        roomCode,
        channelName,
        channelKey,
        activeChannelKey: activeChannelKeyRef.current,
        hasActiveChannel: Boolean(channelRef.current),
        connectionStatus: connectionStatusRef.current,
        label,
      });
    },
    [channelKey, channelName, roomCode],
  );

  const resetRoundProgress = useCallback(
    (payload: ResetRoundProgressPayload) => {
      console.log('[type-race realtime] reset_round_progress applied', {
        roomCode,
        channelName,
        currentRoundBefore: currentRoundRef.current,
        currentRoundAfter: payload.roundNumber,
        payload,
      });

      setPlayersById((current) =>
        Object.fromEntries(
          Object.entries(current).map(([playerId, player]) => [
            playerId,
            {
              ...player,
              progress: 0,
              wpm: 0,
              accuracy: 100,
              finished: false,
              finishMs: undefined,
              totalRounds: payload.totalRounds,
            },
          ]),
        ),
      );
      setProgressByPlayerId((current) => {
        const nextProgressByPlayerId = Object.fromEntries(
          Object.entries(current).map(([playerId, progress]) => [
            playerId,
            {
              ...progress,
              progress: 0,
              wpm: 0,
              accuracy: 100,
              finished: false,
              finishMs: undefined,
              lastSeen: Date.now(),
            },
          ]),
        ) as ProgressByPlayerId;

        console.log('[type-race realtime] progressByPlayerId keys', {
          roomCode,
          channelName,
          keys: Object.keys(nextProgressByPlayerId),
        });

        return nextProgressByPlayerId;
      });
    },
    [channelName, roomCode],
  );

  const makeMyPlayer = useCallback(
    (overrides: Partial<PlayerRaceState> = {}): PlayerRaceState => {
      const previous = myPlayerRef.current;

      const nextPlayer = {
        ...(previous ?? {}),
        progress: previous?.progress ?? 0,
        wpm: previous?.wpm ?? 0,
        accuracy: previous?.accuracy ?? 100,
        finished: previous?.finished ?? false,
        sceneryId,
        totalRounds,
        ...overrides,
      };

      return {
        ...nextPlayer,
        playerId: profile.id,
        displayName: profile.username,
        avatarId: profile.avatarId,
        avatar: profile.avatar,
        favoriteSceneryId: profile.favoriteSceneryId,
        profileStats: profile.stats,
        isHost,
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

  const updateLocalPlayer = useCallback(
    (overrides: Partial<PlayerRaceState> = {}) => {
      const next = makeMyPlayer(overrides);
      myPlayerRef.current = next;

      setPlayersById((current) => mergePlayerById(current, next));
      setProgressByPlayerId((current) => {
        const nextProgressByPlayerId = {
          ...current,
          [next.playerId]: getPlayerProgress(next),
        };

        console.log('[type-race realtime] progressByPlayerId keys', {
          roomCode,
          channelName,
          keys: Object.keys(nextProgressByPlayerId),
        });

        return nextProgressByPlayerId;
      });

      return next;
    },
    [channelName, makeMyPlayer, roomCode],
  );

  const updateMyPresence = useCallback(
    (overrides: Partial<PlayerRaceState> = {}) => {
      const next = updateLocalPlayer(overrides);

      if (channelRef.current) {
        console.log('[type-race realtime] tracking presence', {
          roomCode,
          channelName,
          playerId: next.playerId,
          displayName: next.displayName,
        });
        void channelRef.current.track(next);
      }

      return next;
    },
    [channelName, roomCode, updateLocalPlayer],
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
      console.log(`[type-race realtime] broadcast sent: ${event}`, {
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
      const activePlayersById = getPlayersByIdWithProgress(
        mergePlayerById(playersByIdRef.current, currentPlayer),
        {
          ...progressByPlayerIdRef.current,
          [currentPlayer.playerId]: getPlayerProgress(currentPlayer),
        },
      );
      const knownPlayers = sortPlayers(Object.values(activePlayersById));

      return dedupeRoundResult({
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
      });
    },
    [makeMyPlayer],
  );

  const applyRoundResult = useCallback((result: RoundResult) => {
    const activePlayersById = playersByIdRef.current;
    const cleanResult = getRoundResultWithActivePlayers(result, activePlayersById);
    const roundNumber = getRoundResultKey(cleanResult);

    setRoundWinnersByRound((current) => ({
      ...current,
      [roundNumber]: current[roundNumber] ?? cleanResult.winner,
    }));
    setRoundMetaByRound((current) => ({
      ...current,
      [roundNumber]: current[roundNumber] ?? getRoundMeta(cleanResult),
    }));
    setPhase(cleanResult.roundNumber >= cleanResult.totalRounds ? 'match-results' : 'round-results');

    setResultsByRound((current) => {
      const next = mergeResultsByRound(current, cleanResult, activePlayersById);
      const nextWinnersByRound = {
        ...roundWinnersByRoundRef.current,
        [roundNumber]: roundWinnersByRoundRef.current[roundNumber] ?? cleanResult.winner,
      };
      const nextMetaByRound = {
        ...roundMetaByRoundRef.current,
        [roundNumber]: roundMetaByRoundRef.current[roundNumber] ?? getRoundMeta(cleanResult),
      };
      const nextRoundResults = getRoundResultsFromMaps(next, nextWinnersByRound, nextMetaByRound);
      const scores = buildMatchScores(nextRoundResults);

      logResultsByRoundKeys(roomCode, channelName, next);
      setMatchScores(scores);
      setMatchWinner(cleanResult.roundNumber >= cleanResult.totalRounds ? getMatchWinner(scores) : null);

      return next;
    });
  }, [channelName, roomCode]);

  const applyMatchResults = useCallback((payload: MatchResultsPayload) => {
    const {
      resultsByRound: nextResultsByRound,
      winnersByRound: nextWinnersByRound,
      metaByRound: nextMetaByRound,
    } = getResultsByRoundFromResults(payload.roundResults, playersByIdRef.current);
    const cleanRoundResults = getRoundResultsFromMaps(nextResultsByRound, nextWinnersByRound, nextMetaByRound);
    const cleanScores = buildMatchScores(cleanRoundResults);
    const finalRound = cleanRoundResults[cleanRoundResults.length - 1] ?? null;

    logResultsByRoundKeys(roomCode, channelName, nextResultsByRound);
    setResultsByRound(nextResultsByRound);
    setRoundWinnersByRound(nextWinnersByRound);
    setRoundMetaByRound(nextMetaByRound);
    setMatchScores(cleanScores);
    setMatchWinner(getMatchWinner(cleanScores));

    if (finalRound) {
      setCurrentRound(finalRound.roundNumber);
      setTotalRounds(finalRound.totalRounds);
    }

    setMatchId(payload.matchId);
    setPhase('match-results');
  }, [channelName, roomCode]);

  const beginRace = useCallback(
    (payload: RaceStartPayload) => {
      console.log('[type-race realtime] start_round applying', {
        roomCode,
        channelName,
        currentRoundBefore: currentRoundRef.current,
        currentRoundAfter: payload.roundNumber,
        payload,
      });
      finishSentForRoundRef.current = null;
      setMatchId(payload.matchId);
      setCurrentRound(payload.roundNumber);
      setTotalRounds(payload.totalRounds);
      setSceneryId(payload.sceneryId);
      saveRoomScenery(roomId, payload.sceneryId);
      setPrompt(payload.prompt);
      setRoundId(payload.roundId);
      setStartedAt(payload.startedAt);
      setMatchWinner(null);

      if (payload.roundNumber === 1) {
        setResultsByRound({});
        setRoundWinnersByRound({});
        setRoundMetaByRound({});
        setMatchScores([]);
      }

      resetRoundProgress(payload);

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
      logActiveChannelStatus('after start_round applied');
    },
    [channelName, logActiveChannelStatus, resetRoundProgress, roomCode, roomId, updateMyPresence],
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

  const updateMyPresenceRef = useRef(updateMyPresence);
  const beginRaceRef = useRef(beginRace);
  const resetRoundProgressRef = useRef(resetRoundProgress);
  const applyRoundResultRef = useRef(applyRoundResult);
  const applyMatchResultsRef = useRef(applyMatchResults);
  const logActiveChannelStatusRef = useRef(logActiveChannelStatus);

  useEffect(() => {
    updateMyPresenceRef.current = updateMyPresence;
  }, [updateMyPresence]);

  useEffect(() => {
    beginRaceRef.current = beginRace;
  }, [beginRace]);

  useEffect(() => {
    resetRoundProgressRef.current = resetRoundProgress;
  }, [resetRoundProgress]);

  useEffect(() => {
    applyRoundResultRef.current = applyRoundResult;
  }, [applyRoundResult]);

  useEffect(() => {
    applyMatchResultsRef.current = applyMatchResults;
  }, [applyMatchResults]);

  useEffect(() => {
    logActiveChannelStatusRef.current = logActiveChannelStatus;
  }, [logActiveChannelStatus]);

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
      setLoggedConnectionStatus(canUseLocalDemoMode ? 'demo' : 'offline', 'missing Supabase config');

      if (canUseLocalDemoMode) {
        updateMyPresenceRef.current();
      } else {
        setPlayersById({});
        setProgressByPlayerId({});
      }

      return undefined;
    }

    setLoggedConnectionStatus('connecting', 'creating room channel');

    if (channelRef.current && activeChannelKeyRef.current === channelKey) {
      console.warn('[type-race realtime] active room channel already exists, skipping duplicate subscribe', {
        roomCode,
        channelName,
        channelKey,
      });
      logActiveChannelStatusRef.current('duplicate subscribe skipped');
      return undefined;
    }

    if (channelRef.current) {
      console.warn('[type-race realtime] removing existing room channel before subscribing', {
        roomCode,
        channelName,
        playerId: profile.id,
        previousChannelKey: activeChannelKeyRef.current,
        nextChannelKey: channelKey,
      });
      const previousChannel = channelRef.current;
      channelRef.current = null;
      activeChannelKeyRef.current = null;
      void previousChannel.untrack();
      void supabase.removeChannel(previousChannel);
    }

    console.log('[type-race realtime] subscribe requested', {
      roomCode,
      channelName,
      channelKey,
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
    activeChannelKeyRef.current = channelKey;
    logActiveChannelStatusRef.current('channel created');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, PlayerRaceState[]>;
        const presencePlayers = Object.values(state)
          .flat()
          .filter((player): player is PlayerRaceState => Boolean(player?.playerId));
        const nextPlayers = sortPlayers(dedupePlayers(presencePlayers));
        console.log('[type-race realtime] presence sync', {
          roomCode,
          channelName,
          rawPresenceMetasCount: presencePlayers.length,
          uniquePlayerCount: nextPlayers.length,
          players: nextPlayers.map((player) => `${player.displayName} (${player.playerId})`),
        });
        setPlayersById((current) => getPlayersById(nextPlayers, current));
        setProgressByPlayerId((current) => {
          const nextProgressByPlayerId = nextPlayers.reduce<ProgressByPlayerId>((progressById, player) => {
            progressById[player.playerId] = current[player.playerId] ?? getPlayerProgress(player);
            return progressById;
          }, {});

          console.log('[type-race realtime] progressByPlayerId keys', {
            roomCode,
            channelName,
            keys: Object.keys(nextProgressByPlayerId),
          });

          return nextProgressByPlayerId;
        });

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
        console.log('[type-race realtime] broadcast received: race-start', {
          roomCode,
          channelName,
          currentRoundBefore: currentRoundRef.current,
          currentRoundAfter: (payload as RaceStartPayload).roundNumber,
          payload,
        });
        beginRaceRef.current(payload as RaceStartPayload);
      })
      .on('broadcast', { event: 'next_round' }, ({ payload }) => {
        const nextPayload = payload as NextRoundPayload;
        console.log('[type-race realtime] broadcast received: next_round', {
          roomCode,
          channelName,
          currentRoundBefore: currentRoundRef.current,
          currentRoundAfter: nextPayload.roundNumber,
          payload,
        });
        setMatchId(nextPayload.matchId);
        setCurrentRound(nextPayload.roundNumber);
        setTotalRounds(nextPayload.totalRounds);
        logActiveChannelStatusRef.current('after next_round received');
      })
      .on('broadcast', { event: 'reset_round_progress' }, ({ payload }) => {
        console.log('[type-race realtime] broadcast received: reset_round_progress', {
          roomCode,
          channelName,
          currentRoundBefore: currentRoundRef.current,
          currentRoundAfter: (payload as ResetRoundProgressPayload).roundNumber,
          payload,
        });
        resetRoundProgressRef.current(payload as ResetRoundProgressPayload);
      })
      .on('broadcast', { event: 'start_round' }, ({ payload }) => {
        console.log('[type-race realtime] broadcast received: start_round', {
          roomCode,
          channelName,
          currentRoundBefore: currentRoundRef.current,
          currentRoundAfter: (payload as RaceStartPayload).roundNumber,
          payload,
        });
        beginRaceRef.current(payload as RaceStartPayload);
      })
      .on('broadcast', { event: 'player-progress' }, ({ payload }) => {
        const nextPlayer = (payload as PlayerProgressPayload).player;
        const playerId = getCanonicalPlayerId(nextPlayer);
        console.log('[type-race realtime] progress event received', {
          roomCode,
          channelName,
          playerId,
          progress: nextPlayer.progress,
        });
        setProgressByPlayerId((current) => {
          const nextProgressByPlayerId = {
            ...current,
            [playerId]: getPlayerProgress(nextPlayer),
          };

          console.log('[type-race realtime] progressByPlayerId keys', {
            roomCode,
            channelName,
            keys: Object.keys(nextProgressByPlayerId),
          });

          return nextProgressByPlayerId;
        });
      })
      .on('broadcast', { event: 'match-config' }, ({ payload }) => {
        console.log('[type-race realtime] match config event received', {
          roomCode,
          channelName,
          payload,
        });
        const nextTotalRounds = (payload as MatchConfigPayload).totalRounds;
        setTotalRounds(nextTotalRounds);
        updateMyPresenceRef.current({ totalRounds: nextTotalRounds });
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
        updateMyPresenceRef.current({ sceneryId: nextScenery });
      })
      .on('broadcast', { event: 'race-finish' }, ({ payload }) => {
        console.log('[type-race realtime] race finish event received', {
          roomCode,
          channelName,
          payload,
        });
        applyRoundResultRef.current((payload as RaceFinishPayload).result);
      })
      .on('broadcast', { event: 'match-results' }, ({ payload }) => {
        console.log('[type-race realtime] broadcast received: match-results', {
          roomCode,
          channelName,
          payload,
        });
        applyMatchResultsRef.current(payload as MatchResultsPayload);
      })
      .on('broadcast', { event: 'match_complete' }, ({ payload }) => {
        console.log('[type-race realtime] broadcast received: match_complete', {
          roomCode,
          channelName,
          payload,
        });
        applyMatchResultsRef.current(payload as MatchResultsPayload);
      })
      .subscribe((status) => {
        if (channelRef.current !== channel || activeChannelKeyRef.current !== channelKey) {
          console.log('[type-race realtime] ignored stale subscription status', {
            roomCode,
            channelName,
            channelKey,
            activeChannelKey: activeChannelKeyRef.current,
            status,
          });
          return;
        }

        console.log('[type-race realtime] subscription status', {
          roomCode,
          channelName,
          channelKey,
          activeChannelKey: activeChannelKeyRef.current,
          status,
        });
        logActiveChannelStatusRef.current(`subscription status ${status}`);

        if (status === 'SUBSCRIBED') {
          setLoggedConnectionStatus('online', 'channel subscribed');
          updateMyPresenceRef.current();
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setLoggedConnectionStatus('offline', `channel status ${status}`);
        }
      });

    return () => {
      console.log('[type-race realtime] unsubscribe requested', {
        roomCode,
        channelName,
        channelKey,
        playerId: profile.id,
      });

      if (channelRef.current === channel) {
        channelRef.current = null;
        activeChannelKeyRef.current = null;
      }

      void channel.untrack();
      void client
        .removeChannel(channel)
        .then((response) => {
          console.log('[type-race realtime] unsubscribe complete', {
            roomCode,
            channelName,
            channelKey,
            playerId: profile.id,
            response,
          });
        })
        .catch((error: unknown) => {
          console.error('[type-race realtime] unsubscribe failed', {
            roomCode,
            channelName,
            channelKey,
            playerId: profile.id,
            error,
          });
        });
    };
  }, [
    channelKey,
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
        currentRoundBefore: currentRoundRef.current,
        currentRoundAfter: payload.roundNumber,
      });

      if (roundNumber > 1) {
        sendRoomEvent('next_round', {
          matchId: nextMatchId,
          roundNumber,
          totalRounds: nextTotalRounds,
        } satisfies NextRoundPayload);
      }

      sendRoomEvent('reset_round_progress', {
        matchId: nextMatchId,
        roundId: payload.roundId,
        roundNumber,
        totalRounds: nextTotalRounds,
      } satisfies ResetRoundProgressPayload);

      const sentThroughRealtime = sendRoomEvent('start_round', payload);

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

      const nextPlayer = makeMyPlayer({
        progress: metrics.progress,
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        finished: metrics.finished,
        finishMs: metrics.finished ? metrics.elapsedMs : undefined,
      });
      myPlayerRef.current = nextPlayer;

      setProgressByPlayerId((current) => {
        const nextProgressByPlayerId = {
          ...current,
          [nextPlayer.playerId]: getPlayerProgress(nextPlayer),
        };

        console.log('[type-race realtime] progressByPlayerId keys', {
          roomCode,
          channelName,
          keys: Object.keys(nextProgressByPlayerId),
        });

        return nextProgressByPlayerId;
      });

      const now = Date.now();
      const shouldBroadcastProgress = metrics.finished || now - lastProgressBroadcastAtRef.current >= 200;

      if (channelRef.current && shouldBroadcastProgress) {
        lastProgressBroadcastAtRef.current = now;
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
          const finalResultsByRound = mergeResultsByRound(
            resultsByRoundRef.current,
            result,
            playersByIdRef.current,
          );
          const finalWinnersByRound = {
            ...roundWinnersByRoundRef.current,
            [result.roundNumber]: roundWinnersByRoundRef.current[result.roundNumber] ?? result.winner,
          };
          const finalMetaByRound = {
            ...roundMetaByRoundRef.current,
            [result.roundNumber]: roundMetaByRoundRef.current[result.roundNumber] ?? getRoundMeta(result),
          };
          const finalRoundResults = getRoundResultsFromMaps(
            finalResultsByRound,
            finalWinnersByRound,
            finalMetaByRound,
          );
          const finalScores = buildMatchScores(finalRoundResults);
          const matchResultsPayload: MatchResultsPayload = {
            matchId: currentMatchId,
            totalRounds: result.totalRounds,
            roundResults: finalRoundResults,
            scores: finalScores,
            winner: getMatchWinner(finalScores),
          };

          sendRoomEvent('match_complete', matchResultsPayload);
        }
      }
    },
    [applyRoundResult, channelName, createRoundResult, makeMyPlayer, profile.id, profile.username, roomCode, sendRoomEvent],
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
    playersById: renderedPlayersById,
    progressByPlayerId,
    resultsByRound,
    roundWinnersByRound,
    currentRoundResultsByPlayerId: resultsByRound[currentRound] ?? {},
    playerCount,
    sceneryId,
    startMatch,
    nextRound,
    playAgain,
    changeScenery,
    changeTotalRounds,
    updateMyProgress,
  };
}
