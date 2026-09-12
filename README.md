# Adapta

Entrenador personal inteligente. Genera, ejecuta y ajusta rutinas según el contexto real del usuario — tiempo, lugar, equipo, energía, historial — y permite renegociar el plan en lenguaje natural en el momento en que la vida no coincide con lo planeado.

> **El nombre "Adapta" es provisional.** Se decide en la Fase 11 (identidad de marca). Cambiarlo es tocar `app.config.ts` y el `name` de `package.json`.

---

## Documentación de decisiones

Todo lo que hay en el código responde a una decisión documentada. Antes de cambiar algo estructural, lee la fase correspondiente:

| Documento | Qué decide |
|---|---|
| [`docs/01-descubrimiento-y-estrategia.md`](docs/01-descubrimiento-y-estrategia.md) | Problema, competencia, 5 niveles de usuario, contexto por sesión |
| [`docs/02-funcionalidades-y-alcance-mvp.md`](docs/02-funcionalidades-y-alcance-mvp.md) | Funcionalidades, corte MVP/v2/futuro, patrones de movimiento, métricas |
| [`docs/03-experiencia-y-arquitectura-de-informacion.md`](docs/03-experiencia-y-arquitectura-de-informacion.md) | Principios de UX, navegación, los tres flujos críticos |
| [`docs/04-arquitectura-tecnica.md`](docs/04-arquitectura-tecnica.md) | Expo vs CLI, Supabase, modo invitado, offline-first, estructura, IA |

Los wireframes viven en `wireframes/` como fuentes `.dc.html`.

---

## Requisitos locales

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 20 o superior | Entorno de desarrollo |
| Android Studio | Última estable | SDK de Android y emulador |
| JDK | **17 exactamente** | Compilación Android — ver el aviso de abajo |
| Visual Studio Code | — | Editor (hay ajustes en `.vscode/`) |
| Xcode | — | **Solo si tienes Mac.** Para iOS sin Mac se usa EAS Build |

En Android Studio hace falta tener instalado el **Android SDK** y al menos un **dispositivo virtual (AVD)** creado.

> ### ⚠️ El Java que trae Android Studio no sirve
>
> Android Studio incluye su propio Java (JBR), pero las versiones actuales traen **Java 25**, y React Native necesita **Java 17**. Con el 25 la compilación avanza más de diez minutos y muere en `configureCMakeDebug` con un mensaje engañoso:
>
> ```
> WARNING: A restricted method in java.lang.System has been called
> ```
>
> Ese aviso no explica nada: es Java 25 restringiendo el acceso nativo que necesitan `react-native-worklets` y `react-native-screens`. Hay que instalar el JDK 17 aparte y apuntar `JAVA_HOME` ahí.

---

## Configuración en Windows

Tres cosas que hay que hacer una sola vez y sin las cuales nada compila.

**1 · Permitir la ejecución de scripts** (si no, `npm` y `npx` fallan con `UnauthorizedAccess`):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**2 · Instalar el JDK 17 y apuntar `JAVA_HOME`** (la segunda línea localiza la ruta e imprime la que configuró):

```powershell
winget install --id Microsoft.OpenJDK.17 -e
```
```powershell
$jdk = (Get-ChildItem 'C:\Program Files\Microsoft' -Directory -Filter 'jdk-17*' | Select-Object -First 1).FullName; [Environment]::SetEnvironmentVariable('JAVA_HOME', $jdk, 'User'); $jdk
```

**3 · Apuntar `ANDROID_HOME` al SDK:**

```powershell
[Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')
```

Después de cualquiera de estos pasos hay que **cerrar VS Code por completo y volver a abrirlo**: Windows solo entrega las variables nuevas a los programas que arrancan después de crearlas. Reabrir la terminal no basta.

**No clones el proyecto dentro de OneDrive.** `node_modules` son decenas de miles de archivos; la sincronización los vuelve lentísimos y puede corromper compilaciones. Usa una ruta como `C:\Proyectos`.

---

## Puesta en marcha

```bash
git clone <url-del-repo>
cd Aplicaci-n-Movil---Gimnasio
npm install

cp .env.example .env      # rellena los valores
```

### Arrancar en Android

```bash
npm run android
```

La primera vez genera las carpetas nativas (`android/`) y compila una **development build**. Tarda varios minutos. Las siguientes veces basta con:

```bash
npm start
```

> **No usamos Expo Go.** Es el sandbox de pruebas y no admite módulos nativos propios; en cuanto entren Health Connect, HealthKit o la cámara deja de servir. Trabajamos siempre con development builds — ver la justificación en `docs/04`.

### iOS

Con Mac: `npm run ios`. Sin Mac: EAS Build compila iOS en la nube, que es una de las razones por las que elegimos Expo.

### Antes de cada commit

```bash
npm run check     # typecheck + lint
```

---

## Scripts

| Script | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo (Metro) |
| `npm run android` | Compila e instala la development build de Android |
| `npm run ios` | Ídem en iOS (requiere Mac) |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint, incluidas las reglas de capas |
| `npm run check` | Los dos anteriores |

---

## Estructura

```
src/
├─ app/                    rutas (expo-router). Archivos finos que reexportan pantallas
│   ├─ welcome.tsx
│   ├─ (tabs)/             Inicio · Plan · Progreso · Perfil
│   └─ workout.tsx         FUERA de (tabs): pantalla completa, sin navegación
│
├─ core/                   transversal · no depende de ninguna feature
│   ├─ config/             variables de entorno
│   └─ theme/              tokens de diseño
│
├─ features/               una carpeta por funcionalidad, con index.ts público
│   └─ onboarding/
│
└─ shared/                 componentes y utilidades genéricas
    └─ ui/
```

Carpetas que llegan en sus propias ramas: `core/db`, `core/api`, `core/sync`, `core/storage`, `features/auth`, `features/training-engine`, `features/workouts`, `features/exercises`, `features/plan`, `features/progress`, `features/ai-coach`, `features/profile`.

### Dos reglas que verifica ESLint, no la buena voluntad

1. **Una feature nunca importa de las entrañas de otra.** Solo desde su `index.ts`: `@/features/workouts`, nunca `@/features/workouts/services/x`.
2. **La dependencia va en un solo sentido:** `app → features → shared → core`. `core` no importa de `features`.

Romper cualquiera de las dos hace fallar `npm run lint`.

---

## Variables de entorno

Solo las variables con prefijo `EXPO_PUBLIC_` llegan a la app, y por eso **ahí no puede haber secretos**. Las claves privadas (API de IA, `service_role` de Supabase) viven exclusivamente en las Edge Functions del servidor: un APK se descompila en dos minutos.

Se leen en un único sitio, `src/core/config/env.ts`. Ninguna otra parte del código toca `process.env`.

Tres entornos, tres proyectos de Supabase separados, y cada uno instala un paquete distinto (`com.adapta.app.dev`, `.staging`, y producción) para que puedan convivir en el mismo teléfono.

**Nunca se apunta a la base de producción desde el entorno local.**

---

## Git

```
main       producción, protegida, solo por PR
develop    integración
feature/*  funcionalidades nuevas
fix/*      correcciones
release/*  preparación de versión
```

Jamás se suben al repositorio: `.env`, claves de servicio, `google-services.json`, `GoogleService-Info.plist`, certificados ni keystores. Están todos en `.gitignore`.

---

## Estado actual

Andamiaje navegable: bienvenida → pestañas → modo entrenamiento, con el sistema de tema y la configuración de entorno en su sitio. Las pantallas internas muestran todavía un marcador de posición que indica qué contendrán; cada una lo sustituye al construirse.

Siguiente en el orden de construcción (`docs/04`, sección 15): base de datos local con el catálogo semilla de ejercicios, y después el motor de rutinas — TypeScript puro y con pruebas, antes que cualquier pantalla.
