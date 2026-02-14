import { View, Text } from 'react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Card } from '@alamira/ui/src/components/Card';
import { Button } from '@alamira/ui/src/components/Button';

export default function DevicesScreen() {
  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-foreground mb-6">Devices</Text>

      <View className="flex-1 items-center justify-center">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-surface-elevated items-center justify-center mb-4">
            <Text className="text-3xl">📡</Text>
          </View>
          <Text className="text-lg font-semibold text-foreground mb-2">No Paired Devices</Text>
          <Text className="text-sm text-muted text-center mb-6 px-8">
            Scan for nearby Alamira displays to pair and configure them.
          </Text>
          <Button variant="solid">Scan for Devices</Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
