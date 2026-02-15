import type { DeviceInfo, DeviceStatusResponse, SimulatorQRPayload } from '../types';

const DEVICE_ID = 'ALM-SIM-001';

interface DeviceState {
  device_id: string;
  model: string;
  firmware_version: string;
  serial: string;
  brightness: number;
  status: string;
  startTime: number;
  currentIp: string;
  provisionedSsid: string | null;
}

const state: DeviceState = {
  device_id: DEVICE_ID,
  model: 'Alamira Display Simulator',
  firmware_version: '1.0.0',
  serial: 'SIM-2026-001',
  brightness: 75,
  status: 'running',
  startTime: Date.now(),
  currentIp: '0.0.0.0',
  provisionedSsid: null,
};

export function setCurrentIp(ip: string): void {
  state.currentIp = ip;
}

export function provision(ssid: string): void {
  state.provisionedSsid = ssid;
}

export function getDeviceInfo(): DeviceInfo {
  return {
    device_id: state.device_id,
    model: state.model,
    firmware_version: state.firmware_version,
    serial: state.serial,
  };
}

export function getStatus(): DeviceStatusResponse {
  return {
    uptime: Math.floor((Date.now() - state.startTime) / 1000),
    wifi_rssi: -45,
    ip: state.currentIp,
    ssid: state.provisionedSsid ?? 'SimulatorAP',
  };
}

export function getQRPayload(port: number): SimulatorQRPayload {
  return {
    ap_ssid: 'ALAMIRA-SIM',
    ap_pass: 'simulator',
    device_id: state.device_id,
    api_port: port,
    ip: state.currentIp,
  };
}

export function getFullState() {
  return { ...state };
}
