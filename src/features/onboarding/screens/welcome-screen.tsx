import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors, fontSize, radius, spacing, minTouchTarget } from '@/core/theme';
import { Screen } from '@/shared/ui';

/**
 * Decisión de la Fase 12: "Empezar" es la acción dominante y entra sin cuenta.
 * Los proveedores de autenticación no compiten aquí — cada paso de registro
 * puesto antes del valor cuesta entre 20% y 30% de los usuarios.
 *
 * La entrada "Ya tengo cuenta" se añade junto con la autenticación, en su rama.
 */
export function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.copy}>
          <Text style={[styles.headline, { color: colors.ink }]}>
            Tu entrenamiento{'\n'}se adapta a ti.
          </Text>
          <Text style={[styles.sub, { color: colors.inkMuted }]}>
            Donde estés, con lo que tengas, en el tiempo que tengas.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.ctaLabel, { color: colors.inkInverse }]}>Empezar</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing['3xl'] },
  copy: { flex: 1, justifyContent: 'center' },
  headline: { fontSize: fontSize.display, fontWeight: '600', letterSpacing: -0.9, lineHeight: 36 },
  sub: { fontSize: fontSize.bodyLarge, lineHeight: 24, marginTop: spacing.lg },
  cta: {
    height: 60,
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
});
