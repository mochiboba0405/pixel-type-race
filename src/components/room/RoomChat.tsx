import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { ChatMessage } from '../../features/race/raceTypes';
import { PixelAvatar } from '../profile/PixelAvatar';

const MAX_CHAT_LENGTH = 200;
const CHAT_GROUP_WINDOW_MS = 2 * 60 * 1000;
const NEAR_BOTTOM_PX = 48;

type RoomChatProps = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => boolean;
};

export function RoomChat({ messages, onSendMessage }: RoomChatProps) {
  const [draft, setDraft] = useState('');
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const trimmedDraft = draft.trim();
  const canSend = trimmedDraft.length > 0 && trimmedDraft.length <= MAX_CHAT_LENGTH;
  const visibleMessages = useMemo(() => messages.slice(-50), [messages]);
  const messageGroups = useMemo(() => groupMessages(visibleMessages), [visibleMessages]);
  const latestMessageId = visibleMessages[visibleMessages.length - 1]?.id ?? null;
  const characterCountLabel = `${draft.length}/${MAX_CHAT_LENGTH}`;

  useEffect(() => {
    const messagesElement = messagesRef.current;

    if (!messagesElement || !latestMessageId || latestMessageId === lastSeenMessageIdRef.current) {
      return;
    }

    lastSeenMessageIdRef.current = latestMessageId;

    if (isNearBottom) {
      messagesElement.scrollTo({
        top: messagesElement.scrollHeight,
        behavior: 'smooth',
      });
      setUnreadCount(0);
      return;
    }

    setUnreadCount((count) => count + 1);
  }, [isNearBottom, latestMessageId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendDraft();
  }

  function sendDraft() {
    if (!canSend) {
      return;
    }

    if (onSendMessage(trimmedDraft)) {
      setDraft('');
      scrollToLatestMessage();
    }
  }

  function handleMessagesScroll() {
    const messagesElement = messagesRef.current;

    if (!messagesElement) {
      return;
    }

    const nextIsNearBottom =
      messagesElement.scrollHeight - messagesElement.scrollTop - messagesElement.clientHeight < NEAR_BOTTOM_PX;

    setIsNearBottom(nextIsNearBottom);

    if (nextIsNearBottom) {
      setUnreadCount(0);
    }
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    sendDraft();
  }

  function scrollToLatestMessage() {
    window.requestAnimationFrame(() => {
      const messagesElement = messagesRef.current;

      if (!messagesElement) {
        return;
      }

      messagesElement.scrollTo({
        top: messagesElement.scrollHeight,
        behavior: 'smooth',
      });
      setIsNearBottom(true);
      setUnreadCount(0);
    });
  }

  return (
    <section className="panel room-chat">
      <div className="panel__title-row">
        <div>
          <p className="section-label">Room chat</p>
          <h2>Messages</h2>
        </div>
        <span className="room-chat__limit">{visibleMessages.length}/50</span>
      </div>

      <div className="room-chat__messages" ref={messagesRef} aria-live="polite" onScroll={handleMessagesScroll}>
        {visibleMessages.length === 0 ? <p className="muted">No messages yet.</p> : null}
        {messageGroups.map((group) => (
          <article className="room-chat__group" key={group.id}>
            <PixelAvatar avatar={group.avatar} size="small" label={`${group.displayName} avatar`} />
            <div className="room-chat__group-body">
              <div className="room-chat__meta">
                <strong>{group.displayName}</strong>
                <span>{formatChatTime(group.firstTimestamp)}</span>
              </div>
              {group.messages.map((message) => (
                <p className="room-chat__message" key={message.id}>
                  {message.text}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <form className="room-chat__form" onSubmit={handleSubmit}>
        {unreadCount > 0 ? (
          <button className="room-chat__new-messages" type="button" onClick={scrollToLatestMessage}>
            {unreadCount} New Message{unreadCount === 1 ? '' : 's'}
          </button>
        ) : null}
        <div className="room-chat__composer">
          <textarea
            maxLength={MAX_CHAT_LENGTH}
            rows={2}
            value={draft}
            placeholder="Send a message..."
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
          />
          <button className="button button--secondary" type="submit" disabled={!canSend}>
            Send
          </button>
        </div>
        <p className={`room-chat__hint ${draft.length >= MAX_CHAT_LENGTH ? 'room-chat__hint--limit' : ''}`}>
          Enter to send. Shift+Enter for newline. {characterCountLabel}
        </p>
      </form>
    </section>
  );
}

function groupMessages(messages: ChatMessage[]) {
  return messages.reduce<
    Array<{
      id: string;
      playerId: string;
      displayName: string;
      avatar: ChatMessage['avatar'];
      firstTimestamp: number;
      lastTimestamp: number;
      messages: ChatMessage[];
    }>
  >((groups, message) => {
    const previousGroup = groups[groups.length - 1];

    if (
      previousGroup &&
      previousGroup.playerId === message.playerId &&
      message.timestamp - previousGroup.lastTimestamp <= CHAT_GROUP_WINDOW_MS
    ) {
      previousGroup.lastTimestamp = message.timestamp;
      previousGroup.messages.push(message);
      return groups;
    }

    groups.push({
      id: message.id,
      playerId: message.playerId,
      displayName: message.displayName,
      avatar: message.avatar,
      firstTimestamp: message.timestamp,
      lastTimestamp: message.timestamp,
      messages: [message],
    });

    return groups;
  }, []);
}

function formatChatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}
