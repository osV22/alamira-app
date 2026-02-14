import { View, Text } from 'react-native';

type StatusVariant = 'connected' | 'disconnected' | 'scanning' | 'idle';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusVariant, { bg: string; text: string; dot: string; defaultLabel: string }> = {
  connected: { bg: 'bg-success/15', text: 'text-success', dot: 'bg-success', defaultLabel: 'Connected' },
  disconnected: { bg: 'bg-error/15', text: 'text-error', dot: 'bg-error', defaultLabel: 'Disconnected' },
  scanning: { bg: 'bg-warning/15', text: 'text-warning', dot: 'bg-warning', defaultLabel: 'Scanning' },
  idle: { bg: 'bg-muted/15', text: 'text-muted', dot: 'bg-muted', defaultLabel: 'Idle' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View className={`flex-row items-center gap-2 rounded-full px-3 py-1 ${config.bg} ${className ?? ''}`}>
      <View className={`h-2 w-2 rounded-full ${config.dot}`} />
      <Text className={`text-xs font-medium ${config.text}`}>
        {label ?? config.defaultLabel}
      </Text>
    </View>
  );
}
