import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@alamira/ui';

export default function InstrumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alamira SK</Text>
      <Text style={styles.subtitle}>Boat Instrument Display</Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
      <Text style={styles.hint}>
        Connect to Signal K and NMEA sources to view real-time boat data
      </Text>
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
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  comingSoon: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  hint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
