import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { TextInput } from '@alamira/ui/src/components/TextInput';
import { Button } from '@alamira/ui/src/components/Button';

export default function NameDeviceScreen() {
  const router = useRouter();
  const { step, deviceInfo, nameDevice } = useOnboarding();

  const defaultName = deviceInfo?.model ?? 'My Alamira Display';
  const [localName, setLocalName] = useState(defaultName);

  useEffect(() => {
    if (step === 'configure') {
      router.replace('/onboarding/configure');
    }
  }, [step]);

  const isValid = localName.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-6">⛵</Text>

          <Text className="text-xl font-bold text-foreground text-center">
            Name Your Display
          </Text>

          <Text className="text-sm text-muted text-center mt-2 mb-8">
            Give your {deviceInfo?.model ?? 'display'} a friendly name
          </Text>

          <TextInput
            label="Display Name"
            value={localName}
            onChangeText={setLocalName}
            className="w-full mb-8"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => isValid && nameDevice(localName.trim())}
          />

          <Button
            variant="solid"
            size="lg"
            disabled={!isValid}
            onPress={() => nameDevice(localName.trim())}
            className="w-full"
          >
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
