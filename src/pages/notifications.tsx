import React from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button } from '@toss/tds-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/notifications', {
  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();
  const { anonymousHash } = useAppSession();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(anonymousHash),
    enabled: anonymousHash != null,
    queryFn: () => everStarApi.listNotifications(anonymousHash ?? ''),
  });
  const readMutation = useMutation({
    mutationFn: () => everStarApi.markNotificationsRead(anonymousHash ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications(anonymousHash) });
    },
  });

  if (notificationsQuery.isLoading) {
    return <LoadingScreen label="알림 확인 중" />;
  }

  if (notificationsQuery.error != null) {
    return <ErrorScreen message={notificationsQuery.error.message} onRetry={() => notificationsQuery.refetch()} />;
  }

  const notifications = notificationsQuery.data ?? [];

  return (
    <Screen
      title="알림"
      subtitle="인앱 알림은 v1에서 완료했고, 토스 푸시는 feature flag 뒤에 준비되어 있어요."
      footer={
        <Button display="full" style="weak" loading={readMutation.isPending} onPress={() => readMutation.mutate()}>
          모두 읽음
        </Button>
      }
    >
      {notifications.length === 0 ? (
        <EmptyState title="새 알림이 없어요" description="퀘스트와 편지 상태가 여기에 표시돼요." />
      ) : (
        notifications.map(notification => (
          <Card
            key={notification.id}
            title={notification.title}
            description={`${notification.body} · ${new Date(notification.createdAt).toLocaleString('ko-KR')}`}
            right={<Pill tone={notification.isRead ? 'neutral' : 'brand'}>{notification.isRead ? '읽음' : '새 알림'}</Pill>}
          />
        ))
      )}
    </Screen>
  );
}
