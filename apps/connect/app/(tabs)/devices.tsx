import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@alamira/ui';

export default function DevicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devices</Text>
      <Text style={styles.subtitle}>No paired devices yet</Text>
      <Text style={styles.hint}>Tap + to scan for nearby Alamira displays</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  hint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
