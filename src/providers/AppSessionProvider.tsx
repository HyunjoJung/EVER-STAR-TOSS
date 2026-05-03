import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { everStarApi } from 'lib/api';
import { resolveAnonymousIdentity } from 'lib/tossIdentity';
import type { AppUser } from 'types/domain';

interface AppSessionContextValue {
  anonymousHash: string | null;
  user: AppUser | null;
  selectedPetId: string | null;
  identitySource: 'apps_in_toss' | 'dev_fallback' | null;
  isBootstrapping: boolean;
  bootstrapError: string | null;
  selectPet: (petId: string) => void;
}

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const [anonymousHash, setAnonymousHash] = useState<string | null>(null);
  const [identitySource, setIdentitySource] = useState<AppSessionContextValue['identitySource']>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const identity = await resolveAnonymousIdentity();
        const bootstrappedUser = await everStarApi.bootstrapUser(identity.hash);

        if (mounted) {
          setAnonymousHash(identity.hash);
          setIdentitySource(identity.source);
          setUser(bootstrappedUser);
        }
      } catch (error) {
        if (mounted) {
          setBootstrapError(error instanceof Error ? error.message : '앱을 시작하지 못했습니다.');
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AppSessionContextValue>(
    () => ({
      anonymousHash,
      user,
      selectedPetId,
      identitySource,
      isBootstrapping,
      bootstrapError,
      selectPet: setSelectedPetId,
    }),
    [anonymousHash, bootstrapError, identitySource, isBootstrapping, selectedPetId, user],
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);

  if (context == null) {
    throw new Error('useAppSession must be used within AppSessionProvider.');
  }

  return context;
}
