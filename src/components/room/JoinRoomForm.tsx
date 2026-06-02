import { useState } from 'react';
import type { FormEvent } from 'react';
import { getRoomPath, normalizeRoomId } from '../../features/room/roomUtils';

type JoinRoomFormProps = {
  navigate: (path: string) => void;
};

export function JoinRoomForm({ navigate }: JoinRoomFormProps) {
  const [roomId, setRoomId] = useState('');

  const normalizedRoomId = normalizeRoomId(roomId);
  const canJoin = normalizedRoomId.length >= 4;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (canJoin) {
      navigate(getRoomPath(normalizedRoomId));
    }
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Room code</span>
        <input
          type="text"
          value={roomId}
          placeholder="ABCD12"
          onChange={(event) => setRoomId(normalizeRoomId(event.target.value))}
        />
      </label>
      <button className="button button--secondary" type="submit" disabled={!canJoin}>
        Join Room
      </button>
    </form>
  );
}
