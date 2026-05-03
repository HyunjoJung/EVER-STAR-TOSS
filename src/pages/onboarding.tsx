import React from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button } from '@toss/tds-react-native';
import { Card } from 'components/Card';
import { Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';

export const Route = createRoute('/onboarding', {
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigation = Route.useNavigation();

  return (
    <Screen title="EVER-STAR" subtitle="반려동물과의 기억을 조용히 기록하는 49일 공간">
      <Card title="편지" description="하고 싶었던 말을 남기고 AI 답장을 기다려요." />
      <Card title="퀘스트" description="매일 하나씩 열리는 질문으로 마음을 정리해요." />
      <Card title="메모리얼북" description="기록이 쌓이면 하나의 책처럼 모아 볼 수 있어요." />
      <Button display="full" onPress={() => navigation.navigate(APP_ROUTES.petCreate)}>
        시작하기
      </Button>
    </Screen>
  );
}
