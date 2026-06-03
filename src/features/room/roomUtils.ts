import { createRoomId } from '../../lib/ids';

const HOST_KEY_PREFIX = 'pixel-type-race:host:';
const SCENERY_KEY_PREFIX = 'pixel-type-race:scenery:';

export function createNewRoomForHost(playerId: string, sceneryId: string) {
  const roomId = createRoomId();
  markRoomHost(roomId, playerId);
  saveRoomScenery(roomId, sceneryId);
  return roomId;
}

export function markRoomHost(roomId: string, playerId: string) {
  localStorage.setItem(`${HOST_KEY_PREFIX}${roomId}`, playerId);
}

export function isRoomHost(roomId: string, playerId: string) {
  return localStorage.getItem(`${HOST_KEY_PREFIX}${roomId}`) === playerId;
}

export function saveRoomScenery(roomId: string, sceneryId: string) {
  localStorage.setItem(`${SCENERY_KEY_PREFIX}${normalizeRoomId(roomId)}`, sceneryId);
}

export function loadRoomScenery(roomId: string) {
  return localStorage.getItem(`${SCENERY_KEY_PREFIX}${normalizeRoomId(roomId)}`);
}

export function normalizeRoomId(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function getRoomPath(roomId: string) {
  return `/room/${normalizeRoomId(roomId)}`;
}

export function getRoomChannelName(roomId: string) {
  return `typing-race-room:${normalizeRoomId(roomId)}`;
}

export function getRoomUrl(roomId: string) {
  return `${window.location.origin}${getRoomPath(roomId)}`;
}
