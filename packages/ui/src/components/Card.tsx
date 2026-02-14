import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, className, children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-border p-4 ${elevated ? 'bg-surface-elevated' : 'bg-surface'} ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
