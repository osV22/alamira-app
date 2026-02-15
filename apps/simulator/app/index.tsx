import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { DeviceDisplay } from '../src/components/DeviceDisplay';
import { Console } from '../src/components/Console';
import { startServer, stopServer } from '../src/services/server';
import * as deviceStateService from '../src/services/device-state';
import { getDeviceIp } from '../src/services/network';
import type { LogEntry, SimulatorQRPayload } from '../src/types';

const SERVER_PORT = 5561;

export default function SimulatorScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [qrPayload, setQrPayload] = useState<SimulatorQRPayload | null>(null);
  const [serverRunning, setServerRunning] = useState(false);

  useEffect(() => {
    const ip = getDeviceIp();
    deviceStateService.setCurrentIp(ip);

    const payload = deviceStateService.getQRPayload(SERVER_PORT);
    setQrPayload(payload);

    startServer(SERVER_PORT, (entry) => {
      setLogs((prev) => [...prev, entry]);
    });
    setServerRunning(true);

    return () => {
      stopServer();
      setServerRunning(false);
    };
  }, []);

  const handleClear = useCallback(() => {
    setLogs([]);
  }, []);

  if (!qrPayload) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F1419] items-center justify-center">
        <Text className="text-white text-lg">Starting simulator...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F1419]">
      <View className="flex-1 px-4 py-4">
        {/* Simulated display area */}
        <View className="items-center">
          <DeviceDisplay
            qrPayload={qrPayload}
            serverRunning={serverRunning}
          />
        </View>

        {/* Console */}
        <Console logs={logs} onClear={handleClear} />
      </View>
    </SafeAreaView>
  );
}
