import AsyncStorage from '@react-native-async-storage/async-storage';
import { deviceLog } from '../logger/logger';
import type { PairedDevice } from './types';

const STORAGE_KEY = '@alamira/paired-devices';

export async function loadDevices(): Promise<PairedDevice[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PairedDevice[];
  } catch (error) {
    deviceLog.error('Failed to load paired devices', error);
    return [];
  }
}

export async function saveDevices(devices: PairedDevice[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch (error) {
    deviceLog.error('Failed to save paired devices', error);
  }
}
