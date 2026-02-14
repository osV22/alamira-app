import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  createOnboardingSlice,
  type OnboardingSlice,
} from './slices/onboardingSlice';
import { createDeviceSlice, type DeviceSlice } from './slices/deviceSlice';

export type AppStore = OnboardingSlice & DeviceSlice;

export const useStore = create<AppStore>()(
  persist(
    (set, get, api) => ({
      ...createOnboardingSlice(set, get, api),
      ...createDeviceSlice(set, get, api),
    }),
    {
      name: 'alamira-connect-store',
      storage: createJSONStorage(() => {
        // Lazy import to avoid crashing if native module isn't ready at import time
        const AsyncStorage =
          require('@react-native-async-storage/async-storage').default;
        return AsyncStorage;
      }),
      partialize: (state) => ({ devices: state.devices }),
    }
  )
);
