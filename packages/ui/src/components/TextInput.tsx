import { View, Text, TextInput as RNTextInput, type TextInputProps as RNTextInputProps } from 'react-native';
import { useState } from 'react';
import { colors } from '../theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, className, ...props }: TextInputProps & { className?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={`gap-1.5 ${className ?? ''}`}>
      {label && (
        <Text className="text-sm font-medium text-muted">{label}</Text>
      )}
      <RNTextInput
        className={`rounded-lg border px-4 py-3 text-base text-foreground bg-surface-bright ${
          error
            ? 'border-error'
            : focused
              ? 'border-primary'
              : 'border-border'
        }`}
        placeholderTextColor={colors.disabled}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text className="text-sm text-error">{error}</Text>
      )}
    </View>
  );
}
