import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useColors, spacing } from '@/core/theme';

type Props = {
  children: ReactNode;
  /** Bordes donde respetar el área segura. Por defecto arriba y abajo. */
  edges?: readonly Edge[];
  /** El modo entrenamiento pinta hasta el borde y gestiona su propio espaciado. */
  padded?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, edges = ['top', 'bottom'], padded = true, style }: Props) {
  const colors = useColors();

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.xl },
});
