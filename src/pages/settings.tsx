import React from 'react';
import { createRoute } from '@granite-js/react-native';
import { Card, Pill } from 'components/Card';
import { Screen } from 'components/Screen';
import { DEEP_LINKS } from 'config/routes';
import { env, isSupabaseConfigured } from 'config/env';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/settings', {
  component: SettingsPage,
});

function SettingsPage() {
  const { anonymousHash, identitySource } = useAppSession();

  return (
    <Screen title="설정" subtitle="앱인토스 출시 전 점검 값">
      <Card title="앱 이름" description="EVER-STAR" right={<Pill tone="brand">ever-star</Pill>} />
      <Card title="식별 방식" description={identitySource === 'apps_in_toss' ? 'getAnonymousKey hash 사용 중' : '로컬 fallback hash 사용 중'} />
      <Card title="Supabase" description={isSupabaseConfigured() ? 'Edge Functions 연결' : 'Mock API 모드'} />
      <Card title="토스 푸시" description={env.tossPushEnabled ? '활성화됨' : '비활성화됨'} right={<Pill>{env.tossPushEnabled ? 'ON' : 'OFF'}</Pill>} />
      <Card title="사용자 해시" description={anonymousHash ?? '준비 중'} />
      <Card title="딥링크" description={`${DEEP_LINKS.home}\n${DEEP_LINKS.questToday}\n${DEEP_LINKS.letters}`} />
    </Screen>
  );
}
