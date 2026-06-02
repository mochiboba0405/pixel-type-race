import { useCallback, useState } from 'react';
import { getAvatarById } from '../../data/avatarOptions';
import { loadProfile, saveProfile, updateStats } from './profileStorage';
import type { PlayerProfile, RaceResultForStats } from './profileTypes';

export function useLocalProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());

  const updateProfile = useCallback((updates: Partial<Pick<PlayerProfile, 'displayName' | 'avatarId'>>) => {
    setProfile((current) => {
      const next = {
        ...current,
        ...updates,
        avatar: getAvatarById(updates.avatarId ?? current.avatarId),
      };

      saveProfile(next);
      return next;
    });
  }, []);

  const recordRace = useCallback((result: RaceResultForStats) => {
    setProfile((current) => {
      const next = updateStats(current, result);
      saveProfile(next);
      return next;
    });
  }, []);

  return {
    profile,
    updateProfile,
    recordRace,
  };
}
