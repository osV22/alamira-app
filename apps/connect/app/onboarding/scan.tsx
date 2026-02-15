import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

import { Button } from '@alamira/ui/src/components/Button';
import { ScreenContainer } from '@alamira/ui/src/components/ScreenContainer';
import { colors } from '@alamira/ui/src/theme';
import { useOnboarding } from '../../src/hooks/useOnboarding';

const BRACKET_LENGTH = 40;
const BRACKET_THICKNESS = 3;
const BRACKET_RADIUS = 16;
const OVERLAY_OPACITY = 0.6;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { step, error, handleQRScan, simulateDevice, cancelOnboarding } = useOnboarding();
  const hasScanned = useRef(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const { width, height } = layout;
  const frameSize = Math.min(width, height) * 0.55;
  const frameX = (width - frameSize) / 2;
  const frameY = (height - frameSize) / 2 - 40;

  useEffect(() => {
    if (step === 'connecting') {
      router.replace('/onboarding/connecting');
    } else if (step === 'product-info') {
      router.replace('/onboarding/product-info');
    }
  }, [step, router]);

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    handleQRScan(data);
  };

  const handleCancel = () => {
    cancelOnboarding();
    router.back();
  };

  if (!permission) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Requesting camera access...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-foreground text-xl font-semibold mb-3 text-center">
            Camera Access Required
          </Text>
          <Text className="text-muted text-base text-center mb-8">
            We need camera access to scan the QR code on your Alamira display.
          </Text>
          <Button onPress={requestPermission}>Grant Camera Access</Button>
          <View className="mt-4">
            <Button variant="ghost" onPress={handleCancel}>Cancel</Button>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {width > 0 && (
      <>
      {/* SVG overlay with rounded cutout — single element, no seams */}
      <Svg
        style={StyleSheet.absoluteFillObject}
        width={width}
        height={height}
        pointerEvents="none"
      >
        <Defs>
          <Mask id="cutout">
            {/* White = visible (dark overlay shows) */}
            <Rect width={width} height={height} fill="white" />
            {/* Black = transparent (camera shows through) */}
            <Rect
              x={frameX}
              y={frameY}
              width={frameSize}
              height={frameSize}
              rx={BRACKET_RADIUS}
              ry={BRACKET_RADIUS}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          width={width}
          height={height}
          fill="black"
          opacity={OVERLAY_OPACITY}
          mask="url(#cutout)"
        />
      </Svg>

      {/* Corner brackets */}
      <View
        style={[
          styles.frameArea,
          {
            top: frameY,
            left: frameX,
            width: frameSize,
            height: frameSize,
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.bracket, styles.bracketTL]} />
        <View style={[styles.bracket, styles.bracketTR]} />
        <View style={[styles.bracket, styles.bracketBL]} />
        <View style={[styles.bracket, styles.bracketBR]} />
      </View>

      {/* Instruction text */}
      <View
        style={[styles.instructionArea, { top: frameY + frameSize + 24 }]}
        pointerEvents="none"
      >
        <Text style={styles.instructionText}>
          Point your camera at the QR code on your Alamira display
        </Text>
      </View>

      {/* Dev-only simulate button */}
      {__DEV__ && (
        <View style={[styles.simulateArea, { top: frameY + frameSize + 80 }]}>
          <Button variant="ghost" size="sm" onPress={simulateDevice}>
            Simulate Device
          </Button>
          <Text style={styles.devBadge}>DEV</Text>
        </View>
      )}
      </>)}

      {/* Error */}
      {error && (
        <View className="absolute top-16 left-0 right-0 items-center px-6">
          <View className="bg-surface rounded-lg px-4 py-3">
            <Text className="text-error text-sm text-center">{error}</Text>
          </View>
        </View>
      )}

      {/* Cancel */}
      <View className="absolute top-14 left-4">
        <Button variant="ghost" size="sm" onPress={handleCancel}>
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  frameArea: {
    position: 'absolute',
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_LENGTH,
    height: BRACKET_LENGTH,
    borderColor: colors.primary,
  },
  bracketTL: {
    top: 0,
    left: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderTopLeftRadius: BRACKET_RADIUS,
  },
  bracketTR: {
    top: 0,
    right: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderTopRightRadius: BRACKET_RADIUS,
  },
  bracketBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
    borderBottomLeftRadius: BRACKET_RADIUS,
  },
  bracketBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
    borderBottomRightRadius: BRACKET_RADIUS,
  },
  instructionArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionText: {
    color: colors.foreground,
    fontSize: 16,
    textAlign: 'center',
  },
  simulateArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  devBadge: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
