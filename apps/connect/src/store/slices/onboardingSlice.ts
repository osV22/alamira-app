import { StateCreator } from 'zustand';

import type { OnboardingStep, FirmwareUpdateInfo } from '../../services/device/types';
import type { WiFiNetwork, DeviceInfo } from '../../services/wifi/types';
import type { AlamiraQRPayload } from '../../services/qr/types';

export interface OnboardingSlice {
  // State
  step: OnboardingStep;
  qrData: AlamiraQRPayload | null;
  deviceInfo: DeviceInfo | null;
  networks: WiFiNetwork[];
  selectedNetwork: string | null;
  deviceName: string;
  error: string | null;
  isLoading: boolean;
  isSimulated: boolean;
  firmwareProgress: number;
  firmwareUpdateInfo: FirmwareUpdateInfo | null;

  // Actions
  setStep: (step: OnboardingStep) => void;
  setQRData: (data: AlamiraQRPayload | null) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setNetworks: (networks: WiFiNetwork[]) => void;
  setSelectedNetwork: (ssid: string | null) => void;
  setDeviceName: (name: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSimulated: (simulated: boolean) => void;
  setFirmwareProgress: (progress: number) => void;
  setFirmwareUpdateInfo: (info: FirmwareUpdateInfo | null) => void;
  reset: () => void;
}

const initialState = {
  step: 'scan' as OnboardingStep,
  qrData: null,
  deviceInfo: null,
  networks: [] as WiFiNetwork[],
  selectedNetwork: null,
  deviceName: '',
  error: null,
  isLoading: false,
  isSimulated: false,
  firmwareProgress: 0,
  firmwareUpdateInfo: null as FirmwareUpdateInfo | null,
};

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setQRData: (data) => set({ qrData: data }),
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  setNetworks: (networks) => set({ networks }),
  setSelectedNetwork: (ssid) => set({ selectedNetwork: ssid }),
  setDeviceName: (name) => set({ deviceName: name }),
  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSimulated: (simulated) => set({ isSimulated: simulated }),
  setFirmwareProgress: (progress) => set({ firmwareProgress: progress }),
  setFirmwareUpdateInfo: (info) => set({ firmwareUpdateInfo: info }),
  reset: () => set(initialState),
});
