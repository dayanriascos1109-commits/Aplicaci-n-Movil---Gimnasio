import type { ExpoConfig } from 'expo/config';

/**
 * El nombre "Adapta" es provisional. Se decide en la Fase 11 (identidad de marca)
 * y al cambiarlo solo se toca este archivo.
 */
type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnv;

// Cada entorno instala un paquete distinto para que puedan convivir en el mismo teléfono.
const variants: Record<AppEnv, { name: string; suffix: string }> = {
  development: { name: 'Adapta (dev)', suffix: '.dev' },
  staging: { name: 'Adapta (staging)', suffix: '.staging' },
  production: { name: 'Adapta', suffix: '' },
};

const variant = variants[APP_ENV];

const config: ExpoConfig = {
  name: variant.name,
  slug: 'adapta',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'adapta',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  ios: {
    bundleIdentifier: `com.adapta.app${variant.suffix}`,
    supportsTablet: false,
  },
  android: {
    package: `com.adapta.app${variant.suffix}`,
    adaptiveIcon: {
      backgroundColor: '#FBFAF8',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FBFAF8',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv: APP_ENV,
  },
};

export default config;
