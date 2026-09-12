import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
          {/*
            El entrenamiento vive FUERA del grupo de pestañas, no por comodidad:
            es la decisión de la Fase 8-9. Toma la pantalla completa y oculta la
            navegación — el usuario está entrenando, no navegando.
          */}
          <Stack.Screen name="workout" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
