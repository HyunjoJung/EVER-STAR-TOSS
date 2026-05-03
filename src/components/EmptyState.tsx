import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Txt } from '@toss/tds-react-native';

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
      <Txt typography="t5" fontWeight="bold" color="#191f28" textAlign="center">
        {title}
      </Txt>
      <Txt typography="t7" color="#6b7684" textAlign="center" style={styles.description}>
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
    borderRadius: 12,
    padding: 20,
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  description: {
    lineHeight: 20,
  },
});
