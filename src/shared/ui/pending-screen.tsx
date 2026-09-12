import { StyleSheet, Text, View } from 'react-native';

import { useColors, fontSize, spacing } from '@/core/theme';

import { Screen } from './screen';

type Props = {
  title: string;
  /** Qué vivirá aquí y en qué documento está definido. */
  description: string;
};

/**
 * Andamiaje temporal. Cada pantalla real la sustituye al construirse;
 * cuando no quede ninguna referencia, este archivo se borra.
 */
export function PendingScreen({ title, description }: Props) {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.inkMuted }]}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: spacing.md },
  title: { fontSize: fontSize.title, fontWeight: '600', letterSpacing: -0.5 },
  description: { fontSize: fontSize.body, lineHeight: 21 },
});
