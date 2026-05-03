import React from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, Pill } from 'components/Card';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

const paramsSchema = z.object({
  letterId: z.string(),
});

export const Route = createRoute('/letter-detail', {
  validateParams: paramsSchema,
  component: LetterDetailPage,
});

function LetterDetailPage() {
  const navigation = Route.useNavigation();
  const params = Route.useParams();
  const { anonymousHash } = useAppSession();
  const letterQuery = useQuery({
    queryKey: queryKeys.letter(anonymousHash, params.letterId),
    enabled: anonymousHash != null,
    queryFn: () => everStarApi.getLetter(anonymousHash ?? '', params.letterId),
  });

  if (letterQuery.isLoading) {
    return <LoadingScreen label="편지 여는 중" />;
  }

  if (letterQuery.error != null) {
    return <ErrorScreen message={letterQuery.error.message} onRetry={() => letterQuery.refetch()} />;
  }

  const letter = letterQuery.data;

  if (letter == null) {
    return <ErrorScreen message="편지를 찾을 수 없습니다." />;
  }

  return (
    <Screen
      title="편지"
      subtitle={new Date(letter.createdAt).toLocaleString('ko-KR')}
      footer={
        <Button display="full" style="weak" onPress={() => navigation.navigate(APP_ROUTES.letters)}>
          편지함으로
        </Button>
      }
    >
      <Card title="보낸 편지">
        <Txt typography="t6" color="#333d4b" style={{ lineHeight: 24 }}>
          {letter.content}
        </Txt>
      </Card>

      <Card
        title="AI 답장"
        right={<Pill tone={letter.aiAnswer?.status === 'completed' ? 'success' : 'neutral'}>{letter.aiAnswer?.status ?? 'pending'}</Pill>}
      >
        <Txt typography="t6" color="#333d4b" style={{ lineHeight: 24 }}>
          {letter.aiAnswer?.content ?? '답장을 준비하고 있어요.'}
        </Txt>
      </Card>
    </Screen>
  );
}
