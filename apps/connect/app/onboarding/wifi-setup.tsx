import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiTag, Lock } from 'iconoir-react-native';

import { useOnboarding } from '../../src/hooks/useOnboarding';
import { Button } from '@alamira/ui/src/components/Button';
import { TextInput } from '@alamira/ui/src/components/TextInput';
import { colors } from '@alamira/ui/src/theme';

function signalLabel(rssi: number): { text: string; color: string } {
  if (rssi > -50) return { text: 'Strong', color: 'text-primary' };
  if (rssi > -70) return { text: 'Good', color: 'text-foreground' };
  return { text: 'Weak', color: 'text-muted' };
}

export default function WifiSetupScreen() {
  const router = useRouter();
  const { step, networks, error, isLoading, sendCredentials, cancelOnboarding } =
    useOnboarding();

  const [selectedSsid, setSelectedSsid] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    if (step === 'verifying') {
      router.replace('/onboarding/verifying');
    }
  }, [step]);

  const handleNetworkPress = (ssid: string, security: string) => {
    if (security === 'Open') {
      sendCredentials(ssid, '');
      return;
    }

    setSelectedSsid(ssid);
    setPassword('');
    setShowPasswordInput(true);
  };

  const handleConnect = () => {
    if (!selectedSsid) return;
    sendCredentials(selectedSsid, password);
  };

  const handleDismissPassword = () => {
    setShowPasswordInput(false);
    setSelectedSsid(null);
    setPassword('');
  };

  const handleCancel = () => {
    cancelOnboarding();
    router.back();
  };

  return (
    <View className="flex-1 bg-background px-6 pt-14 pb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">
            Select WiFi Network
          </Text>
          <Text className="text-sm text-muted mt-1">
            Choose the network your display should connect to
          </Text>
        </View>

        <Pressable onPress={handleCancel} className="pl-4">
          <Text className="text-muted text-sm font-medium">Cancel</Text>
        </Pressable>
      </View>

      {/* Error */}
      {error ? (
        <View className="mb-4 rounded-lg border border-error bg-surface px-4 py-3">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      ) : null}

      {/* Network list */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {networks.map((network) => {
          const signal = signalLabel(network.rssi);
          const isSelected = selectedSsid === network.ssid && showPasswordInput;

          return (
            <View key={network.ssid}>
              <Pressable
                onPress={() =>
                  handleNetworkPress(network.ssid, network.security)
                }
                className={`flex-row items-center rounded-xl border px-4 py-3.5 mb-2 ${
                  isSelected
                    ? 'bg-surface-elevated border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <WifiTag
                  width={22}
                  height={22}
                  color={isSelected ? colors.primary : colors.muted}
                />

                <Text className="flex-1 text-foreground text-base ml-3">
                  {network.ssid}
                </Text>

                <Text className={`text-xs mr-2 ${signal.color}`}>
                  {signal.text}
                </Text>

                {network.security !== 'Open' && (
                  <Lock width={16} height={16} color={colors.muted} />
                )}
              </Pressable>

              {/* Password input section */}
              {isSelected && (
                <View className="bg-surface-elevated rounded-xl border border-border px-4 py-4 mb-2 -mt-1">
                  <TextInput
                    label="Password"
                    secureTextEntry
                    placeholder="Enter WiFi password"
                    value={password}
                    onChangeText={setPassword}
                    autoFocus
                  />

                  <View className="flex-row items-center mt-4 gap-3">
                    <Button
                      onPress={handleConnect}
                      disabled={isLoading || password.length === 0}
                      className="flex-1"
                    >
                      Connect
                    </Button>

                    <Button variant="ghost" onPress={handleDismissPassword}>
                      Cancel
                    </Button>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
