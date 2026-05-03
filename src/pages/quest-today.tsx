import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { FormField } from 'components/FormField';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/quest-today', {
  component: QuestTodayPage,
});

function QuestTodayPage() {
  const navigation = Route.useNavigation();
  const queryClient = useQueryClient();
  const { anonymousHash, selectedPetId } = useAppSession();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const questQuery = useQuery({
    queryKey: queryKeys.todayQuest(anonymousHash, selectedPetId),
    enabled: anonymousHash != null && selectedPetId != null,
    queryFn: () => everStarApi.getTodayQuest(anonymousHash ?? '', selectedPetId ?? ''),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      everStarApi.submitQuestAnswer(anonymousHash ?? '', {
        petId: selectedPetId ?? '',
        questId: questQuery.data?.quest.id ?? 1,
        content,
        imageUrl: imageUrl.trim().length > 0 ? imageUrl.trim() : null,
      }),
    onSuccess: async () => {
      setContent('');
      setImageUrl('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.todayQuest(anonymousHash, selectedPetId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.memorialBook(anonymousHash, selectedPetId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(anonymousHash) });
    },
  });

  if (selectedPetId == null) {
    return (
      <Screen title="오늘 퀘스트">
        <EmptyState title="선택된 별이 없어요" description="반려동물을 먼저 등록하거나 선택해주세요." actionLabel="별 선택" onAction={() => navigation.navigate(APP_ROUTES.pets)} />
      </Screen>
    );
  }

  if (questQuery.isLoading) {
    return <LoadingScreen label="오늘 퀘스트 확인 중" />;
  }

  if (questQuery.error != null) {
    return <ErrorScreen message={questQuery.error.message} onRetry={() => questQuery.refetch()} />;
  }

  const data = questQuery.data;

  if (data == null) {
    return <ErrorScreen message="오늘 퀘스트를 불러오지 못했습니다." />;
  }

  const answered = data.answer != null;

  return (
    <Screen
      title="오늘 퀘스트"
      subtitle={`${data.pet.name} · ${data.progress.day} / ${data.progress.total}일`}
      footer={
        <Button display="full" style="weak" onPress={() => navigation.navigate(APP_ROUTES.home)}>
          홈으로
        </Button>
      }
    >
      <Card title={`${data.quest.day}일차`} description={data.quest.content} right={<Pill tone={data.quest.type === 'TEXT_IMAGE' ? 'brand' : 'neutral'}>{data.quest.type}</Pill>} />

      {answered ? (
        <Card title="오늘의 기록" right={<Pill tone="success">완료</Pill>}>
          <Txt typography="t6" color="#333d4b" style={styles.paragraph}>
            {data.answer?.content}
          </Txt>
          {data.answer?.imageUrl != null ? <Image source={{ uri: data.answer.imageUrl }} style={styles.image} /> : null}
          <Txt typography="t7" color="#6b7684">
            {data.answer?.aiAnswer?.status === 'completed' ? 'AI 답장이 준비됐어요.' : 'AI 답장을 준비하고 있어요.'}
          </Txt>
        </Card>
      ) : (
        <Card title="답변 작성">
          <FormField label="내용" value={content} onChangeText={setContent} multiline placeholder="오늘의 마음을 적어주세요." />
          {data.quest.type === 'TEXT_IMAGE' ? (
            <FormField label="사진 링크" value={imageUrl} onChangeText={setImageUrl} placeholder="선택 입력" />
          ) : null}
          <Button
            display="full"
            loading={submitMutation.isPending}
            disabled={content.trim().length === 0}
            onPress={() => submitMutation.mutate()}
          >
            기록 저장
          </Button>
        </Card>
      )}

      {submitMutation.error != null ? <Card title="저장 실패" description={submitMutation.error.message} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    lineHeight: 24,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f2f4f6',
  },
});
