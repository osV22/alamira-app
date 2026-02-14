import { View, Text } from 'react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Card } from '@alamira/ui/src/components/Card';
import { Button } from '@alamira/ui/src/components/Button';
import { StatusBadge } from '@alamira/ui/src/components/StatusBadge';

export default function DashboardScreen() {
  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">Alamira Connect</Text>
          <Text className="text-sm text-muted mt-1">Hardware Companion</Text>
        </View>
        <StatusBadge status="disconnected" />
      </View>

      <Card className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">Quick Setup</Text>
        <Text className="text-sm text-muted mb-4">
          Pair your Alamira instrument display to get started with configuration and firmware updates.
        </Text>
        <Button variant="ghost">Scan for Devices</Button>
      </Card>

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
