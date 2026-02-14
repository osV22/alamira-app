import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Card } from '@alamira/ui/src/components/Card';
import { Button } from '@alamira/ui/src/components/Button';
import { StatusBadge } from '@alamira/ui/src/components/StatusBadge';
import { useDevices } from '../../src/hooks/useDevices';

export default function DashboardScreen() {
  const router = useRouter();
  const { devices } = useDevices();
  const hasPairedDevice = devices.length > 0;
  const device = hasPairedDevice ? devices[0] : null;

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">Alamira Connect</Text>
          <Text className="text-sm text-muted mt-1">Hardware Companion</Text>
        </View>
        <StatusBadge status={hasPairedDevice ? 'connected' : 'disconnected'} />
      </View>

      {device ? (
        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
            <Text className="text-lg font-semibold text-foreground">{device.name}</Text>
          </View>
          <Text className="text-xs text-muted mt-1">{device.model}</Text>
          <Text className="text-xs text-muted mt-0.5">{device.ip}</Text>
        </Card>
      ) : (
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-2">Quick Setup</Text>
          <Text className="text-sm text-muted mb-4">
            Pair your Alamira instrument display to get started with configuration and firmware updates.
          </Text>
          <Button variant="ghost" onPress={() => router.push('/onboarding/scan')}>
            Scan for Devices
          </Button>
        </Card>
      )}

      <Card className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">Recent Activity</Text>
        <Text className="text-sm text-muted">No activity yet. Pair a device to begin.</Text>
      </Card>

      <Card elevated>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-foreground">Firmware</Text>
            <Text className="text-xs text-muted mt-0.5">Check for updates</Text>
          </View>
          <Button variant="outline" size="sm">Check</Button>
        </View>
      </Card>
    </ScreenContainer>
  );
}
