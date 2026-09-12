export type AppEnv = 'development' | 'staging' | 'production';

/**
 * Único punto de lectura de variables de entorno en toda la app.
 * Expo sustituye `process.env.EXPO_PUBLIC_*` en tiempo de compilación, así que
 * hay que escribir el nombre completo y literal — no se puede indexar dinámicamente.
 */
export const env = {
  appEnv: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnv,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export const isDev = env.appEnv === 'development';
export const isProduction = env.appEnv === 'production';

/**
 * Para valores que sí son obligatorios en el punto donde se usan.
 * Falla en el arranque con un mensaje claro, en lugar de con un `undefined`
 * a mitad de una petición.
 */
export function required<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === '') {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env`);
  }
  return value;
}
