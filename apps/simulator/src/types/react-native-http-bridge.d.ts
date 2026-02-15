declare module 'react-native-http-bridge' {
  interface HttpRequest {
    requestId: string;
    type: string;
    url: string;
    postData?: string;
  }
  export function start(port: number, serviceName: string, callback: (request: HttpRequest) => void): void;
  export function stop(): void;
  export function respond(requestId: string, code: number, type: string, body: string): void;
}
