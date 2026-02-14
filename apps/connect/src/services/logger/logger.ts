import { logger, consoleTransport } from 'react-native-logs';

const config = {
  severity: __DEV__ ? 'debug' : 'warn',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'white' as const,
      info: 'blueBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
    },
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
};

const log = logger.createLogger(config);

export const bleLog = log.extend('ble');
export const wifiLog = log.extend('wifi');
export const deviceLog = log.extend('device');
export const qrLog = log.extend('qr');
export const storeLog = log.extend('store');

export default log;
