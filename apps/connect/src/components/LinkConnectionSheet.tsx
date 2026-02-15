import { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Xmark } from 'iconoir-react-native';

import { TextInput } from '@alamira/ui/src/components/TextInput';
import { colors } from '@alamira/ui/src/theme';

interface LinkConnectionSheetProps {
  visible: boolean;
  connectionType: 'signalk' | 'nmea2000' | 'nmea0183' | null;
  onConnect: (host: string, port: number, name?: string) => void;
  onClose: () => void;
}

type Tab = 'discover' | 'manual';

const TITLES: Record<string, string> = {
  signalk: 'Link Signal K Server',
  nmea2000: 'Link NMEA 2000 Gateway',
  nmea0183: 'Link NMEA 0183 Source',
};

const DEFAULT_PORTS: Record<string, string> = {
  signalk: '3000',
  nmea2000: '10110',
  nmea0183: '10110',
};

export function LinkConnectionSheet({ visible, connectionType, onConnect, onClose }: LinkConnectionSheetProps) {
  const [tab, setTab] = useState<Tab>('manual');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible && connectionType) {
      setTab('manual');
      setHost('');
      setPort(DEFAULT_PORTS[connectionType] ?? '');
      setName('');
    }
  }, [visible, connectionType]);

  const title = connectionType ? TITLES[connectionType] : '';
  const canConnect = tab === 'manual' && host.trim() !== '';

  const handleConnect = () => {
    if (!canConnect) return;
    const portNum = parseInt(port, 10) || parseInt(DEFAULT_PORTS[connectionType ?? 'signalk'], 10);
    onConnect(host.trim(), portNum, name.trim() || undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* Dismiss overlay */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 40,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.disabled }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>{title}</Text>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <Xmark width={22} height={22} color={colors.muted} strokeWidth={1.5} />
              </Pressable>
            </View>

            {/* Tabs */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 20,
                borderRadius: 10,
                backgroundColor: colors.surfaceElevated,
                padding: 4,
              }}
            >
              <Pressable
                onPress={() => setTab('discover')}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: tab === 'discover' ? colors.surfaceBright : 'transparent',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: tab === 'discover' ? colors.foreground : colors.muted }}>
                  Discover
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTab('manual')}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: tab === 'manual' ? colors.surfaceBright : 'transparent',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: tab === 'manual' ? colors.foreground : colors.muted }}>
                  Manual
                </Text>
              </Pressable>
            </View>

            {/* Content */}
            {tab === 'discover' ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ fontSize: 14, color: colors.foreground, marginBottom: 8 }}>
                  Scanning local network...
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center', paddingHorizontal: 16 }}>
                  Discovery coming soon. Use manual entry for now.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <TextInput
                  label="Host"
                  placeholder="192.168.1.100"
                  value={host}
                  onChangeText={setHost}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <TextInput
                  label="Port"
                  placeholder={DEFAULT_PORTS[connectionType ?? 'signalk']}
                  value={port}
                  onChangeText={setPort}
                  keyboardType="number-pad"
                />
                <TextInput
                  label="Name (optional)"
                  placeholder="Friendly name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Connect button */}
            <Pressable
              onPress={handleConnect}
              disabled={!canConnect}
              style={{
                marginTop: 24,
                backgroundColor: canConnect ? colors.primary : colors.disabled,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                opacity: canConnect ? 1 : 0.5,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.background }}>
                Connect
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
