import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Txt } from '@toss/tds-react-native';

export function Screen({
  title,
  subtitle,
  children,
  footer,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title != null ? (
          <View style={styles.header}>
            <Txt typography="t2" fontWeight="bold" color="#191f28">
              {title}
            </Txt>
            {subtitle != null ? (
              <Txt typography="t6" color="#6b7684" style={styles.subtitle}>
                {subtitle}
              </Txt>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer != null ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function LoadingScreen({ label = '불러오는 중' }: { label?: string }) {
  return (
    <View style={[styles.root, styles.center]}>
      <ActivityIndicator />
      <Txt typography="t6" color="#6b7684" style={styles.loadingLabel}>
        {label}
      </Txt>
    </View>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.root, styles.center]}>
      <Txt typography="t4" fontWeight="bold" color="#191f28">
        문제가 생겼어요
      </Txt>
      <Txt typography="t6" color="#6b7684" textAlign="center" style={styles.errorMessage}>
        {message}
      </Txt>
      {onRetry != null ? (
        <Button size="medium" onPress={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e8eb',
    backgroundColor: '#ffffff',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingLabel: {
    marginTop: 12,
  },
  errorMessage: {
    marginVertical: 12,
    lineHeight: 22,
  },
});
