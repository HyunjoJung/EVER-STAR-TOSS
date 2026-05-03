import React from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { Txt } from '@toss/tds-react-native';

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={styles.wrapper}>
      <Txt typography="t7" fontWeight="bold" color="#4e5968">
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b95a1"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d6db',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#191f28',
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 132,
    textAlignVertical: 'top',
  },
});
