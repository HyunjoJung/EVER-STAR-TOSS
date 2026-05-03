import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Txt } from '@toss/tds-react-native';
import { colors, lineHeights, radius, spacing } from 'design/tokens';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Txt typography="t5" fontWeight="bold" color={colors.textPrimary} textAlign="center">
        {title}
      </Txt>
      <Txt typography="t7" color={colors.textSecondary} textAlign="center" style={styles.description}>
        {description}
      </Txt>
      {actionLabel != null && onAction != null ? (
        <Button size="medium" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sm,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  description: {
    lineHeight: lineHeights.body,
  },
});
