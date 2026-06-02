import { useCallback, useEffect, useMemo, useState } from 'react';
import { HomePage } from '../pages/HomePage';
import { RoomPage } from '../pages/RoomPage';
import { normalizeRoomId } from '../features/room/roomUtils';

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }, []);

  const roomId = useMemo(() => {
    const match = path.match(/^\/room\/([^/]+)$/);
    return match ? normalizeRoomId(match[1]) : null;
  }, [path]);

  if (roomId) {
    return <RoomPage roomId={roomId} navigate={navigate} />;
  }

  return <HomePage navigate={navigate} />;
}
