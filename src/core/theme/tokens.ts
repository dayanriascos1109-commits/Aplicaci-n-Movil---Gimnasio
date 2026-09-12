/**
 * Tokens de diseño.
 *
 * PROVISIONALES: estos valores vienen de los wireframes de la Fase 10 y existen
 * para que la app se pueda construir mientras tanto. La paleta y la tipografía
 * definitivas se deciden en la Fase 11 (identidad de marca).
 *
 * Ninguna pantalla debe escribir un color literal. Todo sale de aquí, para que
 * cambiar la marca sea cambiar este archivo.
 */

const palette = {
  light: {
    background: '#FBFAF8',
    surface: '#FFFFFF',
    /** Texto principal y acciones dominantes */
    ink: '#1C1B19',
    /** Texto secundario */
    inkMuted: '#6B6761',
    /** Texto terciario, etiquetas */
    inkFaint: '#9D9892',
    /** Texto sobre superficies oscuras */
    inkInverse: '#FBFAF8',
    border: '#E2DED7',
    borderSoft: '#F0ECE5',
    /** Marca únicamente lo que es decisión estratégica, no decoración */
    accent: '#B2593C',
    accentSurface: '#F7EAE4',
    accentInk: '#6E3B28',
  },
  dark: {
    background: '#131211',
    surface: '#1C1B19',
    ink: '#F4F2EF',
    inkMuted: '#A8A39C',
    inkFaint: '#7A756E',
    inkInverse: '#131211',
    border: '#2E2C29',
    borderSoft: '#242220',
    accent: '#D4795A',
    accentSurface: '#2E1F19',
    accentInk: '#E8B19A',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type Colors = (typeof palette)[ColorScheme];

export const colors = palette;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const fontSize = {
  caption: 11,
  small: 12,
  body: 14,
  bodyLarge: 16,
  title: 24,
  display: 30,
} as const;

/**
 * Mínimo táctil. La app se usa de pie, con una mano, sudando:
 * ningún elemento interactivo baja de aquí.
 */
export const minTouchTarget = 44;
