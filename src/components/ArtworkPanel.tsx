import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { colors, lineHeights, radius, spacing } from 'design/tokens';

export function ArtworkPanel({
  source,
  title,
  description,
}: {
  source: ImageSourcePropType;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.container}>
      <Image source={source} resizeMode="cover" style={styles.image} />
      <View style={styles.copy}>
        <Txt typography="t5" fontWeight="bold" color={colors.textPrimary}>
          {title}
        </Txt>
        <Txt typography="t7" color={colors.textSecondary} style={styles.description}>
          {description}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.brandSoft,
  },
  copy: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  description: {
    lineHeight: lineHeights.caption,
  },
});
