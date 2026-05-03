import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createRoute } from '@granite-js/react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card, Pill } from 'components/Card';
import { EmptyState } from 'components/EmptyState';
import { ErrorScreen, LoadingScreen, Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';

export const Route = createRoute('/memorial-book', {
  component: MemorialBookPage,
});

function MemorialBookPage() {
  const navigation = Route.useNavigation();
  const { anonymousHash, selectedPetId } = useAppSession();
  const bookQuery = useQuery({
    queryKey: queryKeys.memorialBook(anonymousHash, selectedPetId),
    enabled: anonymousHash != null && selectedPetId != null,
    queryFn: () => everStarApi.getMemorialBook(anonymousHash ?? '', selectedPetId ?? ''),
  });

  if (selectedPetId == null) {
    return (
      <Screen title="메모리얼북">
        <EmptyState title="선택된 별이 없어요" description="반려동물을 먼저 등록하거나 선택해주세요." actionLabel="별 선택" onAction={() => navigation.navigate(APP_ROUTES.pets)} />
      </Screen>
    );
  }

  if (bookQuery.isLoading) {
    return <LoadingScreen label="메모리얼북 정리 중" />;
  }

  if (bookQuery.error != null) {
    return <ErrorScreen message={bookQuery.error.message} onRetry={() => bookQuery.refetch()} />;
  }

  const book = bookQuery.data;

  if (book == null) {
    return <ErrorScreen message="메모리얼북을 불러오지 못했습니다." />;
  }

  return (
    <Screen
      title="메모리얼북"
      subtitle={`${book.pet.name}의 기록 ${book.questAnswers.length}개`}
      footer={
        <Button display="full" style="weak" onPress={() => navigation.navigate(APP_ROUTES.home)}>
          홈으로
        </Button>
      }
    >
      <Card title={book.pet.name} description={book.pet.introduction ?? `${book.pet.species} · ${book.pet.relationship}`} right={<Pill tone={book.isActive ? 'success' : 'neutral'}>{book.isActive ? '활성' : '기록 중'}</Pill>} />

      <Card title="감정 요약" description={book.sentimentSummary.totalResult ?? '기록이 쌓이면 요약이 만들어져요.'}>
        <View style={styles.weekGrid}>
          {[book.sentimentSummary.week1Result, book.sentimentSummary.week2Result, book.sentimentSummary.week3Result, book.sentimentSummary.week4Result, book.sentimentSummary.week5Result, book.sentimentSummary.week6Result, book.sentimentSummary.week7Result].map((score, index) => (
            <View key={index} style={styles.weekBox}>
              <Txt typography="t7" color="#6b7684">
                {index + 1}주
              </Txt>
              <Txt typography="t6" fontWeight="bold" color="#191f28">
                {score ?? '-'}
              </Txt>
            </View>
          ))}
        </View>
      </Card>

      <Card title="퀘스트 기록" description={`${book.questAnswers.length}개 저장됨`}>
        {book.questAnswers.length === 0 ? (
          <Txt typography="t7" color="#6b7684">
            아직 저장된 퀘스트가 없어요.
          </Txt>
        ) : (
          book.questAnswers.slice(0, 6).map(answer => (
            <View key={answer.id} style={styles.recordRow}>
              <Txt typography="t7" fontWeight="bold" color="#4e5968">
                {answer.questId}일차
              </Txt>
              <Txt typography="t7" color="#333d4b" numberOfLines={2} style={styles.recordText}>
                {answer.content}
              </Txt>
            </View>
          ))
        )}
      </Card>

      <Card title="편지" description={`${book.letters.length}개 저장됨`}>
        {book.letters.length === 0 ? (
          <Txt typography="t7" color="#6b7684">
            아직 편지가 없어요.
          </Txt>
        ) : (
          book.letters.slice(0, 4).map(letter => (
            <View key={letter.id} style={styles.recordRow}>
              <Txt typography="t7" color="#333d4b" numberOfLines={2} style={styles.recordText}>
                {letter.content}
              </Txt>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekBox: {
    width: 72,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9fafb',
    gap: 4,
  },
  recordRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e8eb',
    paddingTop: 10,
    gap: 4,
  },
  recordText: {
    lineHeight: 20,
  },
});
