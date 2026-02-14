import { qrLog } from '../logger/logger';
import type { AlamiraQRPayload } from './types';

export function parseQRPayload(raw: string): AlamiraQRPayload | null {
  try {
    const data = JSON.parse(raw);

    if (
      typeof data.ap_ssid !== 'string' ||
      typeof data.ap_pass !== 'string' ||
      typeof data.device_id !== 'string' ||
      typeof data.api_port !== 'number'
    ) {
      qrLog.warn('QR payload missing required fields', data);
      return null;
    }

    return {
      ap_ssid: data.ap_ssid,
      ap_pass: data.ap_pass,
      device_id: data.device_id,
      api_port: data.api_port,
    };
  } catch (e) {
    qrLog.warn('Failed to parse QR payload', raw);
    return null;
  }
}
