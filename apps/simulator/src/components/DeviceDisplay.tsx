import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { SimulatorQRPayload } from '../types';

interface Props {
  qrPayload: SimulatorQRPayload;
  serverRunning: boolean;
}

export function DeviceDisplay({ qrPayload, serverRunning }: Props) {
  const qrValue = JSON.stringify(qrPayload);

  return (
    <View
      style={{ width: 760, height: 330 }}
      className="bg-[#1A1A2E] border border-gray-700 rounded-lg flex-row items-center px-8"
    >
      {/* QR Code */}
      <View className="items-center justify-center mr-8">
        <QRCode
          value={qrValue}
          size={220}
          backgroundColor="#1A1A2E"
          color="#FFFFFF"
        />
      </View>

      {/* Device Info */}
      <View className="flex-1 justify-center">
        <Text className="text-white text-xl font-bold mb-4">
          ALAMIRA SIMULATOR
        </Text>

        <InfoLine label="Device" value={qrPayload.device_id} />
        <InfoLine label="FW" value="1.0.0" />
        <InfoLine label="IP" value={qrPayload.ip} />
        <InfoLine label="Port" value={String(qrPayload.api_port)} />
        <InfoLine
          label="Status"
          value={serverRunning ? 'Running' : 'Starting...'}
          valueColor={serverRunning ? '#4ADE80' : '#FBBF24'}
        />
      </View>
    </View>
  );
}

function InfoLine({
  label,
  value,
  valueColor = '#E8ECF0',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center mb-1">
      <Text className="text-gray-400 text-sm w-16">{label}</Text>
      <Text style={{ color: valueColor }} className="text-sm font-mono">
        {value}
      </Text>
    </View>
  );
}
