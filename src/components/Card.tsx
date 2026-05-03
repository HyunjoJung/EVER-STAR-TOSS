import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Txt } from '@toss/tds-react-native';

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
              <Txt typography="t5" fontWeight="bold" color="#191f28">
                {title}
              </Txt>
            ) : null}
            {description != null ? (
              <Txt typography="t7" color="#6b7684" style={styles.description}>
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
      <Txt typography="t7" fontWeight="bold" color={tone === 'neutral' ? '#4e5968' : '#ffffff'}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e8eb',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  description: {
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.72,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f2f4f6',
  },
  brandPill: {
    backgroundColor: '#eb7f72',
  },
  successPill: {
    backgroundColor: '#20a05a',
  },
});
