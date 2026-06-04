import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { ChatMessage } from '../../features/race/raceTypes';
import { PixelAvatar } from '../profile/PixelAvatar';

type RoomChatProps = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => boolean;
};

export function RoomChat({ messages, onSendMessage }: RoomChatProps) {
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();
  const canSend = trimmedDraft.length > 0 && trimmedDraft.length <= 200;
  const visibleMessages = useMemo(() => messages.slice(-50), [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    if (onSendMessage(trimmedDraft)) {
      setDraft('');
    }
  }

  return (
    <section className="panel room-chat">
      <div className="panel__title-row">
        <div>
          <p className="section-label">Room chat</p>
          <h2>Messages</h2>
        </div>
      </div>

      <div className="room-chat__messages" aria-live="polite">
        {visibleMessages.length === 0 ? <p className="muted">No messages yet.</p> : null}
        {visibleMessages.map((message) => (
          <article className="room-chat__message" key={message.id}>
            <PixelAvatar avatar={message.avatar} size="small" label={`${message.displayName} avatar`} />
            <div>
              <div className="room-chat__meta">
                <strong>{message.displayName}</strong>
                <span>{formatChatTime(message.timestamp)}</span>
              </div>
              <p>{message.text}</p>
            </div>
          </article>
        ))}
      </div>

      <form className="room-chat__form" onSubmit={handleSubmit}>
        <input
          maxLength={200}
          value={draft}
          placeholder="Send a message..."
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="button button--secondary" type="submit" disabled={!canSend}>
          Send
        </button>
      </form>
    </section>
  );
}

function formatChatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}
