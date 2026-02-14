import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { colors } from '@alamira/ui/src/theme';

export default function VerifyingScreen() {
  const router = useRouter();
  const { step, error, cancelOnboarding } = useOnboarding();

  useEffect(() => {
    if (step === 'name') {
      router.replace('/onboarding/name-device');
    }
  }, [step]);

  const handleRetry = () => {
    cancelOnboarding();
    router.replace('/onboarding/wifi-setup');
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <ActivityIndicator size="large" color={colors.primary} className="mb-6" />

      <Text className="text-foreground text-lg font-semibold text-center">
        Finding your display...
      </Text>

      <Text className="text-muted text-sm text-center mt-2">
        Verifying the connection to your network
      </Text>

      {error ? (
        <View className="mt-8 items-center">
          <Text className="text-error text-sm text-center mb-4">{error}</Text>
          <Button variant="outline" onPress={handleRetry}>
            Try Again
          </Button>
        </View>
      ) : null}
    </View>
  );
}
