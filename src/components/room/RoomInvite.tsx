import { useMemo, useState } from 'react';
import { getRoomUrl } from '../../features/room/roomUtils';

type RoomInviteProps = {
  roomId: string;
};

export function RoomInvite({ roomId }: RoomInviteProps) {
  const [copied, setCopied] = useState(false);
  const roomUrl = useMemo(() => getRoomUrl(roomId), [roomId]);

  async function copyLink() {
    await navigator.clipboard?.writeText(roomUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="panel room-invite">
      <p className="section-label">Room</p>
      <h2>{roomId}</h2>
      <div className="copy-row">
        <input value={roomUrl} readOnly aria-label="Room link" />
        <button className="button button--secondary" type="button" onClick={copyLink}>
          {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </section>
  );
}
