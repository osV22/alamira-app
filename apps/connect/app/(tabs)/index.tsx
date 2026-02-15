import { View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Antenna, Plus } from 'iconoir-react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Card } from '@alamira/ui/src/components/Card';
import { Button } from '@alamira/ui/src/components/Button';
import { colors } from '@alamira/ui/src/theme';
import { useDevices } from '../../src/hooks/useDevices';
import type { PairedDevice } from '../../src/services/device/types';

function formatLastSeen(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { devices } = useDevices();

  const handleAddDevice = () => router.push('/onboarding/scan');

  const renderDevice = ({ item }: { item: PairedDevice }) => (
    <Pressable onPress={() => router.push(`/device/${item.id}` as any)} className="mb-3">
      <Card>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl bg-surface-elevated items-center justify-center mr-3">
            <Antenna width={22} height={22} color={colors.muted} strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-base">{item.name}</Text>
            <Text className="text-muted text-xs mt-0.5">
              {item.model} · v{item.firmware_version}
            </Text>
          </View>
          <View className="items-end">
            <View className="w-2.5 h-2.5 rounded-full bg-disabled mb-1" />
            <Text className="text-muted text-xs">{formatLastSeen(item.paired_at)}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  if (devices.length === 0) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 rounded-2xl bg-surface-elevated items-center justify-center mb-6">
            <Antenna width={36} height={36} color={colors.muted} strokeWidth={1.5} />
          </View>
          <Text className="text-xl font-bold text-foreground mb-2">
            No Devices Paired
          </Text>
          <Text className="text-sm text-muted text-center mb-8 px-8">
            Scan the QR code on your Alamira display to get started with setup and configuration.
          </Text>
          <Button variant="solid" onPress={handleAddDevice}>
            Add Your First Device
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">My Devices</Text>
          <Text className="text-xs text-muted mt-1">
            {devices.length} {devices.length === 1 ? 'device' : 'devices'} paired
          </Text>
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* FAB */}
      <Pressable
        onPress={handleAddDevice}
        className="absolute bottom-28 right-4 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus width={24} height={24} color={colors.background} strokeWidth={2} />
      </Pressable>
    </ScreenContainer>
  );
}
