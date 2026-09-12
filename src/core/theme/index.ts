import { useColorScheme } from 'react-native';

import { colors, type Colors } from './tokens';

export { colors, spacing, radius, fontSize, minTouchTarget } from './tokens';
export type { Colors, ColorScheme } from './tokens';

/** Colores del esquema activo del sistema. */
export function useColors(): Colors {
  return colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
