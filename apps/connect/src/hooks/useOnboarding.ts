import { useCallback } from 'react';

import { useStore } from '../store';
import { WifiProvisioningService } from '../services/wifi/WifiProvisioningService';
import { WifiAdapter } from '../services/wifi/adapter';
import { parseQRPayload } from '../services/qr/parser';
import type { PairedDevice } from '../services/device/types';

const AP_HOST = '192.168.4.1';

const wifiService = new WifiProvisioningService(new WifiAdapter());

/** Tracks the IP assigned to the device after WiFi provisioning. */
let provisionedIp: string | null = null;

export function useOnboarding() {
  const step = useStore((s) => s.step);
  const qrData = useStore((s) => s.qrData);
  const deviceInfo = useStore((s) => s.deviceInfo);
  const networks = useStore((s) => s.networks);
  const selectedNetwork = useStore((s) => s.selectedNetwork);
  const deviceName = useStore((s) => s.deviceName);
  const error = useStore((s) => s.error);
  const isLoading = useStore((s) => s.isLoading);

  const handleQRScan = useCallback(async (raw: string) => {
    const {
      setQRData,
      setStep,
      setIsLoading,
      setDeviceInfo,
      setNetworks,
      setError,
    } = useStore.getState();

    const parsed = parseQRPayload(raw);
    if (!parsed) {
      setError('Invalid QR code');
      return;
    }

    setQRData(parsed);
    setStep('connecting');
    setIsLoading(true);
    setError(null);

    try {
      const info = await wifiService.connectToDevice(parsed);
      setDeviceInfo(info);

      const scannedNetworks = await wifiService.scanNetworks(
        AP_HOST,
        parsed.api_port,
      );
      setNetworks(scannedNetworks);
      setStep('wifi-setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setStep('scan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCredentials = useCallback(
    async (ssid: string, password: string) => {
      const {
        qrData: currentQrData,
        setSelectedNetwork,
        setStep,
        setIsLoading,
        setDeviceInfo,
        setError,
      } = useStore.getState();

      if (!currentQrData) {
        setError('No device connection data');
        return;
      }

      setSelectedNetwork(ssid);
      setStep('verifying');
      setIsLoading(true);
      setError(null);

      try {
        const response = await wifiService.provision(
          AP_HOST,
          currentQrData.api_port,
          ssid,
          password,
        );

        if (!response.success) {
          throw new Error('Provisioning failed');
        }

        provisionedIp = response.ip;

        const info = await wifiService.verifyConnection(
          response.ip,
          currentQrData.api_port,
        );
        setDeviceInfo(info);
        setStep('name');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to provision WiFi',
        );
        setStep('wifi-setup');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const nameDevice = useCallback((name: string) => {
    const { setDeviceName, setStep } = useStore.getState();
    setDeviceName(name);
    setStep('configure');
  }, []);

  const completeOnboarding = useCallback(() => {
    const {
      deviceInfo: currentDeviceInfo,
      deviceName: currentDeviceName,
      qrData: currentQrData,
      addDevice,
      setStep,
    } = useStore.getState();

    if (!currentDeviceInfo || !currentQrData) return;

    const device: PairedDevice = {
      id: currentDeviceInfo.device_id,
      name: currentDeviceName || currentDeviceInfo.model,
      ip: provisionedIp ?? AP_HOST,
      port: currentQrData.api_port,
      model: currentDeviceInfo.model,
      firmware_version: currentDeviceInfo.firmware_version,
      serial: currentDeviceInfo.serial,
      paired_at: Date.now(),
    };

    addDevice(device);
    setStep('complete');
  }, []);

  const cancelOnboarding = useCallback(() => {
    provisionedIp = null;
    useStore.getState().reset();
  }, []);

  return {
    // State
    step,
    qrData,
    deviceInfo,
    networks,
    selectedNetwork,
    deviceName,
    error,
    isLoading,

    // Actions
    handleQRScan,
    sendCredentials,
    nameDevice,
    completeOnboarding,
    cancelOnboarding,
  };
}
