import httpBridge from 'react-native-http-bridge';
import * as deviceState from './device-state';
import type {
  ProvisionRequest,
  ProvisionResponse,
  WifiScanResponse,
  LogEntry,
} from '../types';

type LogCallback = (entry: LogEntry) => void;

let running = false;

export function startServer(port: number, onLog: LogCallback): void {
  if (running) return;

  httpBridge.start(port, 'alamira_sim', (request: any) => {
    const { requestId, type: method, url: path, postData } = request;

    let body: unknown = undefined;
    if (postData) {
      try {
        body = JSON.parse(postData);
      } catch {
        body = postData;
      }
    }

    const response = route(method, path, body);

    onLog({
      timestamp: Date.now(),
      method,
      path,
      body,
      response,
    });

    httpBridge.respond(
      requestId,
      200,
      'application/json',
      JSON.stringify(response),
    );
  });

  running = true;
}

export function stopServer(): void {
  if (!running) return;
  httpBridge.stop();
  running = false;
}

function route(method: string, path: string, body: unknown): unknown {
  if (method === 'GET' && path === '/api/info') {
    return deviceState.getDeviceInfo();
  }

  if (method === 'GET' && path === '/api/wifi/scan') {
    return handleWifiScan();
  }

  if (method === 'POST' && path === '/api/provision') {
    return handleProvision(body as ProvisionRequest);
  }

  if (method === 'GET' && path === '/api/status') {
    return deviceState.getStatus();
  }

  if (method === 'POST' && path === '/api/message') {
    return { received: true };
  }

  return { error: 'Not Found', path };
}

function handleWifiScan(): WifiScanResponse {
  return {
    networks: [
      { ssid: 'HomeNetwork', rssi: -42, security: 'WPA2' },
      { ssid: 'Marina_WiFi', rssi: -58, security: 'WPA2' },
      { ssid: 'Guest_Open', rssi: -71, security: 'Open' },
    ],
  };
}

function handleProvision(req: ProvisionRequest): ProvisionResponse {
  if (!req?.ssid) {
    return { success: false, ip: '' };
  }
  deviceState.provision(req.ssid);
  return {
    success: true,
    ip: deviceState.getStatus().ip,
  };
}
