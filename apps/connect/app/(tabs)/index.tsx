import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@alamira/ui';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alamira Connect</Text>
      <Text style={styles.subtitle}>Hardware Companion App</Text>
      <Text style={styles.hint}>Pair and manage your Alamira instrument displays</Text>
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
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  hint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
