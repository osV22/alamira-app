import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'iconoir-react-native';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { Card } from '@alamira/ui/src/components/Card';
import { colors } from '@alamira/ui/src/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const { deviceName, deviceInfo } = useOnboarding();

  const handleGoToDashboard = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <CheckCircle color={colors.success} width={64} height={64} strokeWidth={1.5} />

      <Text className="text-2xl font-bold text-foreground text-center mt-6">
        All Set!
      </Text>

      <Text className="text-muted text-sm text-center mt-2 mb-6">
        Your display is ready to use
      </Text>

      <Card className="w-full mb-8">
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Device Name</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceName}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Model</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceInfo?.model}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted text-sm">Firmware</Text>
            <Text className="text-foreground text-sm font-medium">
              {deviceInfo?.firmware_version}
            </Text>
          </View>
        </View>
      </Card>

      <Button variant="solid" size="lg" onPress={handleGoToDashboard}>
        Go to Dashboard
      </Button>
    </View>
  );
}
