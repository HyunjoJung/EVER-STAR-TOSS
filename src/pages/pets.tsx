import React from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button } from '@toss/tds-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { everStarApi } from 'lib/api';
import { getQuestProgress } from 'lib/quest';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/pets', {
  component: PetsPage,
});

function PetsPage() {
  const navigation = Route.useNavigation();
  const { anonymousHash, selectedPetId, selectPet } = useAppSession();
  const petsQuery = useQuery({
    queryKey: queryKeys.pets(anonymousHash),
    enabled: anonymousHash != null,
    queryFn: () => everStarApi.listPets(anonymousHash ?? ''),
  });

  if (petsQuery.isLoading) {
    return <LoadingScreen label="별 목록 확인 중" />;
  }

  if (petsQuery.error != null) {
    return <ErrorScreen message={petsQuery.error.message} onRetry={() => petsQuery.refetch()} />;
  }

  const pets = petsQuery.data ?? [];

  return (
    <Screen
      title="반려동물"
      subtitle="기록할 별을 선택하거나 새로 등록할 수 있어요."
      footer={
        <Button display="full" onPress={() => navigation.navigate(APP_ROUTES.petCreate)}>
          새 별 등록
        </Button>
      }
    >
      {pets.length === 0 ? (
        <EmptyState
          title="등록된 반려동물이 없어요"
          description="첫 반려동물을 등록하면 49일 기록이 시작돼요."
          actionLabel="등록하기"
          onAction={() => navigation.navigate(APP_ROUTES.petCreate)}
        />
      ) : (
        pets.map(pet => {
          const progress = getQuestProgress(pet.questStartedAt);
          const selected = pet.id === selectedPetId;

          return (
            <Card
              key={pet.id}
              title={pet.name}
              description={`${pet.species} · ${pet.relationship} · ${progress.day}일차`}
              right={selected ? <Pill tone="success">선택됨</Pill> : undefined}
              onPress={() => {
                selectPet(pet.id);
                navigation.navigate(APP_ROUTES.home);
              }}
            />
          );
        })
      )}
    </Screen>
  );
}
