import { useLocalSearchParams } from 'expo-router';

import DeviceDetailScreen from '../../src/components/DeviceDetailScreen';

export default function DeviceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeviceDetailScreen deviceId={id} />;
}
