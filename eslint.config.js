const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// eslint-config-expo ya registra el plugin `import`; volver a declararlo rompe la config.
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'wireframes/*'],
  },
  {
    rules: {
      // Regla 1 — una feature nunca importa de las entrañas de otra.
      // Solo desde su index público: `@/features/workouts`, no `@/features/workouts/services/x`.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Importa desde el index público de la feature (@/features/nombre), no desde su interior.',
            },
          ],
        },
      ],

      // Regla 2 — la dependencia va en una sola dirección:
      // app → features → shared → core. Nunca al revés.
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: './src/features',
              message: 'core no puede depender de features. La dependencia va en un solo sentido.',
            },
            {
              target: './src/core',
              from: './src/app',
              message: 'core no puede depender de las rutas.',
            },
            {
              target: './src/shared',
              from: './src/features',
              message: 'shared no puede depender de features.',
            },
          ],
        },
      ],
    },
  },
]);
