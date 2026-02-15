import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Download } from 'iconoir-react-native';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { Card } from '@alamira/ui/src/components/Card';
import { colors } from '@alamira/ui/src/theme';

export default function FirmwareUpdateScreen() {
  const router = useRouter();
  const {
    step,
    firmwareUpdateInfo,
    firmwareProgress,
    applyFirmwareUpdate,
    skipFirmwareUpdate,
    advancePastFirmware,
  } = useOnboarding();

  const [isUpdating, setIsUpdating] = useState(false);
  const isComplete = firmwareProgress >= 100;

  useEffect(() => {
    if (step === 'wifi-setup') {
      router.replace('/onboarding/wifi-setup');
    } else if (step === 'name') {
      router.replace('/onboarding/name-device');
    }
  }, [step]);

  const handleUpdate = () => {
    setIsUpdating(true);
    applyFirmwareUpdate();
  };

  const handleContinue = () => {
    advancePastFirmware();
  };

  const currentVersion = firmwareUpdateInfo?.currentVersion ?? '—';
  const availableVersion = firmwareUpdateInfo?.availableVersion ?? '—';
  const releaseNotes = firmwareUpdateInfo?.releaseNotes ?? '';

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {isComplete ? (
        <CheckCircle width={48} height={48} color={colors.success} strokeWidth={1.5} />
      ) : (
        <Download width={48} height={48} color={colors.primary} strokeWidth={1.5} />
      )}

      <Text className="text-2xl font-bold text-foreground text-center mt-6">
        {isComplete ? 'Update Complete' : 'Firmware Update'}
      </Text>

      <Text className="text-sm text-muted text-center mt-2 mb-6">
        {isComplete
          ? 'Your device is now up to date'
          : 'A new firmware version is available'}
      </Text>

      {/* Version comparison */}
      <View className="flex-row items-center justify-center mb-6 gap-3">
        <View className="items-center">
          <Text className="text-xs text-muted mb-1">Current</Text>
          <View className="bg-surface-elevated rounded-lg px-4 py-2">
            <Text className="text-foreground font-semibold">v{currentVersion}</Text>
          </View>
        </View>
        <Text className="text-muted text-lg mt-4">→</Text>
        <View className="items-center">
          <Text className="text-xs text-primary mb-1">Available</Text>
          <View className="bg-primary/10 rounded-lg px-4 py-2 border border-primary/30">
            <Text className="text-primary font-semibold">v{availableVersion}</Text>
          </View>
        </View>
      </View>

      {/* Release notes */}
      {releaseNotes ? (
        <Card className="w-full mb-6">
          <Text className="text-xs text-muted mb-1">{"What's new"}</Text>
          <Text className="text-sm text-foreground">{releaseNotes}</Text>
        </Card>
      ) : null}

      {/* Progress bar */}
      {isUpdating && (
        <View className="w-full mb-6">
          <View className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${firmwareProgress}%` }}
            />
          </View>
          <Text className="text-xs text-muted text-center mt-2">
            {isComplete ? 'Done' : `${firmwareProgress}%`}
          </Text>
        </View>
      )}

      {/* Actions */}
      {isComplete ? (
        <Button variant="solid" size="lg" onPress={handleContinue} className="w-full">
          Continue
        </Button>
      ) : isUpdating ? (
        <Button variant="solid" size="lg" disabled className="w-full">
          Updating...
        </Button>
      ) : (
        <>
          <Button variant="solid" size="lg" onPress={handleUpdate} className="w-full">
            Update Now
          </Button>
          <View className="mt-4">
            <Button variant="ghost" onPress={skipFirmwareUpdate}>
              Skip for now
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
