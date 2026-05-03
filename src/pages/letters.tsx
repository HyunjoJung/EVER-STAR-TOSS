import React, { useState } from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button } from '@toss/tds-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArtworkPanel } from 'components/ArtworkPanel';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { FormField } from 'components/FormField';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { illustrations } from 'design/illustrations';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/letters', {
  component: LettersPage,
});

function LettersPage() {
  const navigation = Route.useNavigation();
  const queryClient = useQueryClient();
  const { anonymousHash, selectedPetId } = useAppSession();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const lettersQuery = useQuery({
    queryKey: queryKeys.letters(anonymousHash, selectedPetId),
    enabled: anonymousHash != null && selectedPetId != null,
    queryFn: () => everStarApi.listLetters(anonymousHash ?? '', selectedPetId ?? ''),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      everStarApi.sendLetter(anonymousHash ?? '', {
        petId: selectedPetId ?? '',
        content,
        imageUrl: imageUrl.trim().length > 0 ? imageUrl.trim() : null,
      }),
    onSuccess: async letter => {
      setContent('');
      setImageUrl('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.letters(anonymousHash, selectedPetId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(anonymousHash) });
      navigation.navigate(APP_ROUTES.letterDetail, { letterId: letter.id });
    },
  });

  if (selectedPetId == null) {
    return (
      <Screen title="편지함">
        <EmptyState title="선택된 별이 없어요" description="반려동물을 먼저 등록하거나 선택해주세요." actionLabel="별 선택" illustration={illustrations.letterbox} onAction={() => navigation.navigate(APP_ROUTES.pets)} />
      </Screen>
    );
  }

  if (lettersQuery.isLoading) {
    return <LoadingScreen label="편지함 확인 중" />;
  }

  if (lettersQuery.error != null) {
    return <ErrorScreen message={lettersQuery.error.message} onRetry={() => lettersQuery.refetch()} />;
  }

  const letters = lettersQuery.data ?? [];

  return (
    <Screen title="편지함" subtitle="하고 싶었던 말을 차분히 남겨요.">
      <ArtworkPanel source={illustrations.letterbox} title="영원별 우체통" description="마음이 도착하면 답장이 천천히 준비돼요." />

      <Card title="새 편지">
        <FormField label="내용" value={content} onChangeText={setContent} multiline placeholder="오늘 전하고 싶은 말을 적어주세요." />
        <FormField label="사진 링크" value={imageUrl} onChangeText={setImageUrl} placeholder="선택 입력" />
        <Button
          display="full"
          loading={sendMutation.isPending}
          disabled={content.trim().length === 0}
          onPress={() => sendMutation.mutate()}
        >
          보내기
        </Button>
      </Card>

      {sendMutation.error != null ? <Card title="전송 실패" description={sendMutation.error.message} /> : null}

      {letters.length === 0 ? (
        <EmptyState title="아직 편지가 없어요" description="첫 편지를 남기면 답장을 기다릴 수 있어요." illustration={illustrations.letterbox} />
      ) : (
        letters.map(letter => (
          <Card
            key={letter.id}
            title={new Date(letter.createdAt).toLocaleDateString('ko-KR')}
            description={letter.content}
            right={<Pill tone={letter.aiAnswer?.status === 'completed' ? 'success' : 'neutral'}>{letter.aiAnswer?.status === 'completed' ? '답장' : '대기'}</Pill>}
            onPress={() => navigation.navigate(APP_ROUTES.letterDetail, { letterId: letter.id })}
          />
        ))
      )}
    </Screen>
  );
}
