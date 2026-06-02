const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createRoomId(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length])
    .join('');
}

export function createPlayerId() {
  if ('randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
