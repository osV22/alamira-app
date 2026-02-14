import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { Card } from '@alamira/ui/src/components/Card';

export default function ConfigureScreen() {
  const router = useRouter();
  const { step, completeOnboarding } = useOnboarding();

  useEffect(() => {
    if (step === 'complete') {
      router.replace('/onboarding/complete');
    }
  }, [step]);

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-4xl mb-4">⚙️</Text>

      <Text className="text-xl font-bold text-foreground text-center">
        Configuration
      </Text>

      <Text className="text-muted text-sm text-center mt-2 mb-6">
        Using default configuration for now
      </Text>

      <Card className="w-full mb-8">
        <Text className="text-muted text-sm leading-5">
          Default configuration will be applied. You can customize settings
          later from the device details screen.
        </Text>
      </Card>

      <Button variant="solid" onPress={completeOnboarding}>
        Continue
      </Button>
    </View>
  );
}
