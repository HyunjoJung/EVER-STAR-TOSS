import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { colors, layout, lineHeights, spacing } from 'design/tokens';

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
            <Txt typography="t2" fontWeight="bold" color={colors.textPrimary}>
              {title}
            </Txt>
            {subtitle != null ? (
              <Txt typography="t6" color={colors.textSecondary} style={styles.subtitle}>
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
      <Txt typography="t6" color={colors.textSecondary} style={styles.loadingLabel}>
        {label}
      </Txt>
    </View>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.root, styles.center]}>
      <Txt typography="t4" fontWeight="bold" color={colors.textPrimary}>
        문제가 생겼어요
      </Txt>
      <Txt typography="t6" color={colors.textSecondary} textAlign="center" style={styles.errorMessage}>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  subtitle: {
    lineHeight: lineHeights.body,
  },
  footer: {
    padding: layout.footerPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingLabel: {
    marginTop: spacing.md,
  },
  errorMessage: {
    marginVertical: spacing.md,
    lineHeight: lineHeights.body,
  },
});
