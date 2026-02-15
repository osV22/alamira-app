import { useCallback } from 'react';

import { useStore } from '../store';
import { WifiProvisioningService } from '../services/wifi/WifiProvisioningService';
import { WifiAdapter } from '../services/wifi/adapter';
import { parseQRPayload } from '../services/qr/parser';
import { SimulatorService } from '../services/simulator/SimulatorService';
import type { PairedDevice } from '../services/device/types';

const wifiService = new WifiProvisioningService(new WifiAdapter());
const simulatorService = new SimulatorService();

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
  const isSimulated = useStore((s) => s.isSimulated);
  const firmwareProgress = useStore((s) => s.firmwareProgress);
  const firmwareUpdateInfo = useStore((s) => s.firmwareUpdateInfo);

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

      const host = parsed.ip ?? '192.168.4.1';
      const scannedNetworks = await wifiService.scanNetworks(
        host,
        parsed.api_port,
      );
      setNetworks(scannedNetworks);
      setStep('product-info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setStep('scan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const simulateDevice = useCallback(() => {
    const {
      setIsSimulated,
      setQRData,
      setDeviceInfo,
      setFirmwareUpdateInfo,
      setStep,
    } = useStore.getState();

    const simDevice = simulatorService.getSimulatedDevice();

    setIsSimulated(true);
    setQRData(simDevice.qrPayload);
    setDeviceInfo(simDevice.deviceInfo);
    setFirmwareUpdateInfo(simDevice.firmwareUpdate);
    setStep('product-info');
  }, []);

  const checkFirmwareUpdate = useCallback(() => {
    const { setFirmwareUpdateInfo, setStep, isSimulated: simulated } = useStore.getState();

    if (simulated) {
      const simUpdate = simulatorService.getSimulatedFirmwareUpdate();
      setFirmwareUpdateInfo(simUpdate);
    }

    setStep('firmware-update');
  }, []);

  const applyFirmwareUpdate = useCallback(() => {
    const { setFirmwareProgress } = useStore.getState();

    setFirmwareProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFirmwareProgress(100);
        return;
      }
      setFirmwareProgress(Math.round(progress));
    }, 100);
  }, []);

  const skipFirmwareUpdate = useCallback(() => {
    const { setStep, isSimulated: simulated } = useStore.getState();
    setStep(simulated ? 'name' : 'wifi-setup');
  }, []);

  const advancePastFirmware = useCallback(() => {
    const { setStep, isSimulated: simulated } = useStore.getState();
    setStep(simulated ? 'name' : 'wifi-setup');
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
        const host = currentQrData.ip ?? '192.168.4.1';
        const response = await wifiService.provision(
          host,
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
    const { setDeviceName, setStep, isSimulated: simulated } = useStore.getState();
    setDeviceName(name);

    if (simulated) {
      const {
        deviceInfo: currentDeviceInfo,
        qrData: currentQrData,
        addDevice,
      } = useStore.getState();

      if (currentDeviceInfo && currentQrData) {
        const device: PairedDevice = {
          id: currentDeviceInfo.device_id,
          name: name || currentDeviceInfo.model,
          ip: currentQrData.ip ?? '192.168.1.100',
          port: currentQrData.api_port,
          model: currentDeviceInfo.model,
          firmware_version: currentDeviceInfo.firmware_version,
          serial: currentDeviceInfo.serial,
          paired_at: Date.now(),
        };
        addDevice(device);
      }
      setStep('complete');
    } else {
      setStep('configure');
    }
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
      ip: provisionedIp ?? currentQrData.ip ?? '192.168.4.1',
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
    isSimulated,
    firmwareProgress,
    firmwareUpdateInfo,

    // Actions
    handleQRScan,
    simulateDevice,
    checkFirmwareUpdate,
    applyFirmwareUpdate,
    skipFirmwareUpdate,
    advancePastFirmware,
    sendCredentials,
    nameDevice,
    completeOnboarding,
    cancelOnboarding,
  };
}
