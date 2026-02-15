import Constants from 'expo-constants';

/**
 * Get the device's IP on the local network.
 * In Expo dev mode, Constants.expoConfig.hostUri gives us "IP:PORT".
 */
export function getDeviceIp(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return '0.0.0.0';
}
