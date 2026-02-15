import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { NavArrowLeft, EditPencil } from 'iconoir-react-native';

import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { Header } from '@alamira/ui/src/components/Header';
import { Card } from '@alamira/ui/src/components/Card';
import { Button } from '@alamira/ui/src/components/Button';
import { colors } from '@alamira/ui/src/theme';

import { useDevices } from '../hooks/useDevices';
import type { DataConnection } from '../services/device/types';
import { RenameDeviceModal } from './RenameDeviceModal';
import { ConnectionSection } from './ConnectionSection';
import { LinkConnectionSheet } from './LinkConnectionSheet';

interface DeviceDetailScreenProps {
  deviceId: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ label, value, isLast }: InfoRowProps) {
  return (
    <View className={`flex-row justify-between py-3 ${isLast ? '' : 'border-b border-border'}`}>
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-foreground text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function DeviceDetailScreen({ deviceId }: DeviceDetailScreenProps) {
  const router = useRouter();
  const { getDevice, updateDevice, removeDevice } = useDevices();
  const device = getDevice(deviceId);

  const [renameVisible, setRenameVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState<'signalk' | 'nmea2000' | 'nmea0183' | null>(null);

  if (!device) {
    return (
      <ScreenContainer>
        <Header
          title="Device Not Found"
          leftAction={
            <Pressable onPress={() => router.back()} className="active:opacity-70 p-1">
              <NavArrowLeft width={24} height={24} color={colors.foreground} strokeWidth={1.5} />
            </Pressable>
          }
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-sm">This device is no longer available.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const connections: DataConnection[] = device.connections ?? [];

  const handleOpenSheet = (type: 'signalk' | 'nmea2000' | 'nmea0183') => {
    setSheetType(type);
    setSheetVisible(true);
  };

  const handleEditConnection = (connection: DataConnection) => {
    setSheetType(connection.type);
    setSheetVisible(true);
  };

  const handleConnect = (host: string, port: number, name?: string) => {
    const newConnection: DataConnection = {
      id: Date.now().toString(),
      type: sheetType!,
      host,
      port,
      name,
      linked_at: Date.now(),
    };

    // Replace existing connection of same type (for signalk/nmea2000), or append (for nmea0183)
    let updatedConnections: DataConnection[];
    if (sheetType === 'nmea0183') {
      updatedConnections = [...connections, newConnection];
    } else {
      const filtered = connections.filter((c) => c.type !== sheetType);
      updatedConnections = [...filtered, newConnection];
    }

    updateDevice(deviceId, { connections: updatedConnections });
    setSheetVisible(false);
  };

  const handleRename = (newName: string) => {
    updateDevice(deviceId, { name: newName });
    setRenameVisible(false);
  };

  const handleRemoveDevice = () => {
    Alert.alert('Remove Device?', `"${device.name}" will be unpaired. You can re-add it later.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeDevice(deviceId);
          router.back();
        },
      },
    ]);
  };

  const handleCheckFirmware = () => {
    Alert.alert('Up to Date', 'No updates available. You are running the latest firmware.');
  };

  return (
    <ScreenContainer padded={false}>
      <Header
        title={device.name}
        leftAction={
          <Pressable onPress={() => router.back()} className="active:opacity-70 p-1">
            <NavArrowLeft width={24} height={24} color={colors.foreground} strokeWidth={1.5} />
          </Pressable>
        }
        rightAction={
          <Pressable onPress={() => setRenameVisible(true)} className="active:opacity-70 p-1">
            <EditPencil width={22} height={22} color={colors.foreground} strokeWidth={1.5} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Data Connections */}
        <View className="mt-4">
          <ConnectionSection
            connections={connections}
            onLink={handleOpenSheet}
            onEdit={handleEditConnection}
          />
        </View>

        {/* Device Info */}
        <View className="mb-6">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Device Info
          </Text>
          <Card>
            <InfoRow label="Model" value={device.model} />
            <InfoRow label="Serial" value={device.serial} />
            <InfoRow label="IP Address" value={device.ip} />
            <InfoRow label="Port" value={String(device.port)} />
            <InfoRow label="Firmware" value={device.firmware_version} />
            <InfoRow label="Paired" value={formatDate(device.paired_at)} isLast />
          </Card>
        </View>

        {/* Firmware */}
        <View className="mb-6">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Firmware
          </Text>
          <Card>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-muted text-sm">Current Version</Text>
              <Text className="text-foreground text-sm font-medium">
                {device.firmware_version}
              </Text>
            </View>
            <Button variant="outline" onPress={handleCheckFirmware}>
              Check for Update
            </Button>
          </Card>
        </View>

        {/* Remove Device */}
        <View className="mt-4 mb-8 items-center">
          <Pressable onPress={handleRemoveDevice} className="active:opacity-70 py-3 px-6">
            <Text style={{ color: colors.error, fontSize: 15, fontWeight: '500' }}>
              Remove Device
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modals */}
      <RenameDeviceModal
        visible={renameVisible}
        currentName={device.name}
        onSave={handleRename}
        onClose={() => setRenameVisible(false)}
      />
      <LinkConnectionSheet
        visible={sheetVisible}
        connectionType={sheetType}
        onConnect={handleConnect}
        onClose={() => setSheetVisible(false)}
      />
    </ScreenContainer>
  );
}
