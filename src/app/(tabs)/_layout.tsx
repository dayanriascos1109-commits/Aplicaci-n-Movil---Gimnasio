import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useColors, fontSize } from '@/core/theme';

/**
 * Cuatro pestañas, cada una responde una sola pregunta (Fase 8-9):
 *   Inicio   → ¿qué hago hoy?
 *   Plan     → ¿qué viene esta semana?
 *   Progreso → ¿estoy mejorando?
 *   Perfil   → ¿cómo cambio algo?
 *
 * Nunca una quinta. El entrenamiento, el entrenador IA y la biblioteca
 * quedan deliberadamente fuera de la navegación.
 */
export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.borderSoft },
        tabBarLabelStyle: { fontSize: fontSize.caption },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
