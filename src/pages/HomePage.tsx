import { useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { ProfileSetup } from '../components/profile/ProfileSetup';
import { JoinRoomForm } from '../components/room/JoinRoomForm';
import { SceneryPicker } from '../components/scenery/SceneryPicker';
import { getRandomSceneryId, getSceneryTheme } from '../data/sceneryThemes';
import { createNewRoomForHost, getRoomPath } from '../features/room/roomUtils';
import { useLocalProfile } from '../features/profile/useLocalProfile';

type HomePageProps = {
  navigate: (path: string) => void;
};

export function HomePage({ navigate }: HomePageProps) {
  const { profile, updateProfile } = useLocalProfile();
  const [selectedSceneryId, setSelectedSceneryId] = useState(() => getRandomSceneryId());
  const selectedScenery = getSceneryTheme(selectedSceneryId);

  function createRoom() {
    const roomId = createNewRoomForHost(profile.id, selectedSceneryId);
    navigate(getRoomPath(roomId));
  }

  return (
    <PageShell
      eyebrow="Pixel Type Race"
      title="Race your friends across the keyboard"
      subtitle="Make a cute profile, create a room, share the link, and start typing together."
      sceneryId={selectedSceneryId}
    >
      <div className="home-grid">
        <ProfileSetup profile={profile} onChange={updateProfile} />

        <section className="panel action-panel">
          <p className="section-label">Play</p>
          <h2>Start a multiplayer room</h2>
          <p className="muted">
            Room creators become hosts. Hosts can start the race when everyone is ready.
          </p>
          <p className="theme-label">Scenery: {selectedScenery.name}</p>
          <SceneryPicker
            selectedSceneryId={selectedSceneryId}
            onChange={setSelectedSceneryId}
            onRandomize={() => setSelectedSceneryId((current) => getRandomSceneryId(current))}
          />
          <button className="button button--primary" type="button" onClick={createRoom}>
            Create Room
          </button>

          <div className="divider" />

          <h3>Join with a code</h3>
          <JoinRoomForm navigate={navigate} />
        </section>
      </div>
    </PageShell>
  );
}
