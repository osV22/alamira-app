import { View, Text, Pressable, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Antenna } from 'iconoir-react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Button } from '@alamira/ui/src/components/Button';
import { colors } from '@alamira/ui/src/theme';
import { useDevices } from '../../src/hooks/useDevices';
import type { PairedDevice } from '../../src/services/device/types';

export default function DevicesScreen() {
  const { devices, removeDevice } = useDevices();
  const router = useRouter();

  const handleAddDevice = () => router.push('/onboarding/scan');

  const handleRemoveDevice = (device: PairedDevice) => {
    Alert.alert(
      'Remove Device',
      `Remove "${device.name}" from your paired devices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeDevice(device.id),
        },
      ]
    );
  };

  const renderDevice = ({ item }: { item: PairedDevice }) => (
    <Pressable
      className="bg-surface rounded-xl border border-border p-4 mb-2 flex-row items-center"
      onPress={() => {}}
      onLongPress={() => handleRemoveDevice(item)}
    >
      <View className="w-10 h-10 rounded-full bg-surface-elevated items-center justify-center mr-3">
        <Antenna width={20} height={20} color={colors.muted} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold">{item.name}</Text>
        <Text className="text-muted text-xs">
          {item.model} · {item.ip}
        </Text>
      </View>
      <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
    </Pressable>
  );

  if (devices.length === 0) {
    return (
      <ScreenContainer>
        <Text className="text-2xl font-bold text-foreground mb-6">Devices</Text>

        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-surface-elevated items-center justify-center mb-4">
              <Antenna width={32} height={32} color={colors.muted} />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">No Paired Devices</Text>
            <Text className="text-sm text-muted text-center mb-6 px-8">
              Scan for nearby Alamira displays to pair and configure them.
            </Text>
            <Button variant="solid" onPress={handleAddDevice}>
              Scan for Devices
            </Button>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-foreground">Devices</Text>
        <Button variant="ghost" size="sm" onPress={handleAddDevice}>
          Add Device
        </Button>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
