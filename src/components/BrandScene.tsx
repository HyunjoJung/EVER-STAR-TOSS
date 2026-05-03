import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { illustrations } from 'design/illustrations';
import { colors, lineHeights, radius, spacing } from 'design/tokens';

export function BrandScene({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <ImageBackground source={illustrations.skyGarden} resizeMode="cover" imageStyle={styles.image} style={styles.container}>
      <View style={styles.copyPanel}>
        <Image source={illustrations.logo} style={styles.logo} />
        <View style={styles.copy}>
          <Txt typography="t3" fontWeight="bold" color={colors.textPrimary}>
            {title}
          </Txt>
          <Txt typography="t7" color={colors.textLabel} style={styles.subtitle}>
            {subtitle}
          </Txt>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 178,
    overflow: 'hidden',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandSoft,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: radius.sm,
  },
  copyPanel: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  subtitle: {
    lineHeight: lineHeights.caption,
  },
});
