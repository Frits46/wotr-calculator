import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#252015' },
        headerTintColor: '#c9a84c',
        tabBarStyle: { backgroundColor: '#252015', borderTopColor: '#3d2e1f' },
        tabBarActiveTintColor: '#c9a84c',
        tabBarInactiveTintColor: '#8a7e6b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚔</Text>,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="optimizer"
        options={{
          title: 'Optimize',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>,
        }}
      />
      <Tabs.Screen
        name="presets"
        options={{
          title: 'Presets',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏰</Text>,
        }}
      />
    </Tabs>
  );
}
