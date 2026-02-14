import { View, Text, Pressable } from 'react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Card } from '@alamira/ui/src/components/Card';

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <Pressable className="flex-row items-center justify-between py-3 active:opacity-70">
      <Text className="text-base text-foreground">{label}</Text>
      <Text className="text-sm text-muted">{value}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-foreground mb-6">Settings</Text>

      <Card className="mb-4">
        <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">General</Text>
        <SettingsRow label="Units" value="Metric" />
        <View className="h-px bg-border" />
        <SettingsRow label="Language" value="English" />
      </Card>

      <Card className="mb-4">
        <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">About</Text>
        <SettingsRow label="App Version" value="0.1.0" />
        <View className="h-px bg-border" />
        <SettingsRow label="Build" value="Dev" />
      </Card>

      <View className="items-center mt-8">
        <Text className="text-xs text-disabled">Alamira Connect</Text>
        <Text className="text-xs text-disabled mt-1">Made for mariners</Text>
      </View>
    </ScreenContainer>
  );
}
