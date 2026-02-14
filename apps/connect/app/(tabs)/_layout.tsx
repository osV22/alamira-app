import { Tabs } from 'expo-router';
import { HomeSimple, Antenna, Settings } from 'iconoir-react-native';

import { TabBar } from '@alamira/ui/src/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <HomeSimple color={color} width={size} height={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, size }) => (
            <Antenna color={color} width={size} height={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} width={size} height={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
