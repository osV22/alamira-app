import { StateCreator } from 'zustand';

import type { OnboardingStep } from '../../services/device/types';
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

  // Actions
  setStep: (step: OnboardingStep) => void;
  setQRData: (data: AlamiraQRPayload | null) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setNetworks: (networks: WiFiNetwork[]) => void;
  setSelectedNetwork: (ssid: string | null) => void;
  setDeviceName: (name: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
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
  reset: () => set(initialState),
});
