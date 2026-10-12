import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';

const tabs = [
  { name: 'index', title: 'Inicio', symbol: 'house.fill' },
  { name: 'activity', title: 'Actividad', symbol: 'arrow.left.arrow.right' },
  { name: 'budgets', title: 'Presupuesto', symbol: 'chart.pie.fill' },
  { name: 'more', title: 'Más', symbol: 'ellipsis' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.muted,
        tabBarStyle: { height: 84, paddingTop: 10, paddingBottom: 24, borderTopColor: Colors.light.border, backgroundColor: Colors.light.surface },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      {tabs.map(({ name, title, symbol }) => (
        <Tabs.Screen key={name} name={name} options={{
          title,
          tabBarIcon: ({ color, size }) => <SymbolView name={{ ios: symbol, android: 'circle', web: 'circle' }} tintColor={color} size={size} />,
        }} />
      ))}
    </Tabs>
  );
}
