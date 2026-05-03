import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { useQuery } from '@tanstack/react-query';
import { BrandScene } from 'components/BrandScene';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { illustrations } from 'design/illustrations';
import { colors, radius, spacing } from 'design/tokens';
import { everStarApi } from 'lib/api';
import { getQuestProgress } from 'lib/quest';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/', {
  component: HomePage,
});

function HomePage() {
  const navigation = Route.useNavigation();
  const { anonymousHash, selectedPetId, selectPet, isBootstrapping, bootstrapError, identitySource } = useAppSession();
  const petsQuery = useQuery({
    queryKey: queryKeys.pets(anonymousHash),
    enabled: anonymousHash != null,
    queryFn: () => everStarApi.listPets(anonymousHash ?? ''),
  });

  useEffect(() => {
    const firstPetId = petsQuery.data?.[0]?.id;
    if (selectedPetId == null && firstPetId != null) {
      selectPet(firstPetId);
    }
  }, [petsQuery.data, selectPet, selectedPetId]);

  if (isBootstrapping || petsQuery.isLoading) {
    return <LoadingScreen label="EVER-STAR 준비 중" />;
  }

  if (bootstrapError != null) {
    return <ErrorScreen message={bootstrapError} />;
  }

  if (petsQuery.error != null) {
    return <ErrorScreen message={petsQuery.error.message} onRetry={() => petsQuery.refetch()} />;
  }

  const pets = petsQuery.data ?? [];
  const selectedPet = pets.find(pet => pet.id === selectedPetId) ?? pets[0] ?? null;
  const unreadLabel = identitySource === 'apps_in_toss' ? '앱인토스 식별 완료' : '로컬 모드';

  if (selectedPet == null) {
    return (
      <Screen>
        <BrandScene title="EVER-STAR" subtitle="첫 기록을 시작할 별을 등록해주세요." />
        <EmptyState
          title="아직 등록된 별이 없어요"
          description="반려동물 정보를 남기면 49일 기록과 편지를 시작할 수 있어요."
          actionLabel="등록하기"
          illustration={illustrations.memorialBook}
          onAction={() => navigation.navigate(APP_ROUTES.petCreate)}
        />
      </Screen>
    );
  }

  const progress = getQuestProgress(selectedPet.questStartedAt);

  return (
    <Screen>
      <BrandScene title="EVER-STAR" subtitle={`${selectedPet.name}의 ${progress.day}일차 기록을 영원별에 남겨요.`} />
      <Card
        title={selectedPet.name}
        description={`${selectedPet.species} · ${selectedPet.relationship}`}
        right={<Pill tone="brand">{unreadLabel}</Pill>}
        onPress={() => navigation.navigate(APP_ROUTES.pets)}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress.ratio * 100)}%` }]} />
        </View>
        <Txt typography="t7" color={colors.textSecondary}>
          {progress.day} / {progress.total}일
        </Txt>
      </Card>

      <View style={styles.grid}>
        <Card title="오늘 퀘스트" description="하루 한 개의 마음 기록" onPress={() => navigation.navigate(APP_ROUTES.questToday)}>
          <Button size="medium" display="full" onPress={() => navigation.navigate(APP_ROUTES.questToday)}>
            열기
          </Button>
        </Card>
        <Card title="편지함" description="쓰고 받은 편지" onPress={() => navigation.navigate(APP_ROUTES.letters)}>
          <Button size="medium" display="full" style="weak" onPress={() => navigation.navigate(APP_ROUTES.letters)}>
            보기
          </Button>
        </Card>
      </View>

      <Card title="메모리얼북" description="퀘스트와 편지를 한곳에 모아요" onPress={() => navigation.navigate(APP_ROUTES.memorialBook)}>
        <Button size="medium" display="full" style="weak" onPress={() => navigation.navigate(APP_ROUTES.memorialBook)}>
          열람하기
        </Button>
      </Card>

      <View style={styles.navRow}>
        <Button size="medium" style="weak" onPress={() => navigation.navigate(APP_ROUTES.notifications)}>
          알림
        </Button>
        <Button size="medium" style="weak" onPress={() => navigation.navigate(APP_ROUTES.settings)}>
          설정
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfacePressed,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  grid: {
    gap: spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
