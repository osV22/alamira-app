import { View, Text, type ViewProps } from 'react-native';
import { type ReactNode } from 'react';

interface HeaderProps extends ViewProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export function Header({ title, subtitle, leftAction, rightAction, className, ...props }: HeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 bg-background ${className ?? ''}`}
      {...props}
    >
      <View className="w-10 items-start">
        {leftAction}
      </View>
      <View className="flex-1 items-center">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
      <View className="w-10 items-end">
        {rightAction}
      </View>
    </View>
  );
}
