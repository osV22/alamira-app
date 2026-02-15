declare module 'react-native-qrcode-svg' {
  import { Component } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    logo?: any;
    logoSize?: number;
    logoMargin?: number;
    logoBorderRadius?: number;
    logoBackgroundColor?: string;
    ecl?: 'L' | 'M' | 'Q' | 'H';
    quietZone?: number;
    enableLinearGradient?: boolean;
    gradientDirection?: string[];
    linearGradient?: string[];
    getRef?: (ref: any) => void;
    onError?: (error: Error) => void;
  }

  export default class QRCode extends Component<QRCodeProps> {}
}
