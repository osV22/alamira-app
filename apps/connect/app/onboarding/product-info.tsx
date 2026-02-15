import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Antenna } from 'iconoir-react-native';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { Card } from '@alamira/ui/src/components/Card';
import { colors } from '@alamira/ui/src/theme';

export default function ProductInfoScreen() {
  const router = useRouter();
  const { step, deviceInfo, checkFirmwareUpdate } = useOnboarding();

  useEffect(() => {
    if (step === 'firmware-update') {
      router.replace('/onboarding/firmware-update');
    }
  }, [step]);

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-20 h-20 rounded-2xl bg-surface-elevated items-center justify-center mb-6">
        <Antenna width={40} height={40} color={colors.primary} strokeWidth={1.5} />
      </View>

      <Text className="text-2xl font-bold text-foreground text-center">
        {deviceInfo?.model ?? 'Alamira Display'}
      </Text>

      <Text className="text-sm text-primary text-center mt-2 mb-8">
        Device identified successfully
      </Text>

      <Card className="w-full mb-8">
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Serial</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceInfo?.serial}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Firmware</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceInfo?.firmware_version}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Device ID</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceInfo?.device_id}
            </Text>
          </View>
        </View>
      </Card>

      <Button variant="solid" size="lg" onPress={checkFirmwareUpdate} className="w-full">
        Continue
      </Button>
    </View>
  );
}
