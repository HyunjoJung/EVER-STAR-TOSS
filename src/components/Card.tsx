import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { colors, layout, lineHeights, radius, spacing } from 'design/tokens';

export function Card({
  title,
  description,
  children,
  onPress,
  right,
  style,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}) {
  const content = (
    <View style={[styles.card, style]}>
      {(title != null || description != null || right != null) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title != null ? (
              <Txt typography="t5" fontWeight="bold" color={colors.textPrimary}>
                {title}
              </Txt>
            ) : null}
            {description != null ? (
              <Txt typography="t7" color={colors.textSecondary} style={styles.description}>
                {description}
              </Txt>
            ) : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress == null) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'brand' | 'success' }) {
  return (
    <View style={[styles.pill, tone === 'brand' && styles.brandPill, tone === 'success' && styles.successPill]}>
      <Txt typography="t7" fontWeight="bold" color={tone === 'neutral' ? colors.textLabel : colors.white}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: layout.cardGap,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    lineHeight: lineHeights.caption,
  },
  pressed: {
    opacity: 0.72,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfacePressed,
  },
  brandPill: {
    backgroundColor: colors.brand,
  },
  successPill: {
    backgroundColor: colors.success,
  },
});
