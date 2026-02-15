import type { AlamiraQRPayload } from '../qr/types';
import type { DeviceInfo } from '../wifi/types';
import type { FirmwareUpdateInfo } from '../device/types';

export interface SimulatedDevice {
  qrPayload: AlamiraQRPayload;
  deviceInfo: DeviceInfo;
  firmwareUpdate: FirmwareUpdateInfo;
}
