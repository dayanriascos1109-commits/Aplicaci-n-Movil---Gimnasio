# Fase 12-13 · Arquitectura técnica, autenticación y modo invitado

> Continúa `03-experiencia-y-arquitectura-de-informacion.md`. Mantiene todas las decisiones anteriores: enfoque híbrido, 5 niveles de usuario, contexto por sesión, offline durante el entrenamiento, IA como capa de control no crítica.

---

## 1. Expo vs React Native CLI

### La pregunta está mal planteada en casi todo internet

La comparación habitual ("Expo es fácil pero limitado, CLI es profesional") describe **Expo Go**, que es el sandbox de pruebas. Eso quedó obsoleto. La comparación real es entre:

- **Expo con Development Builds** (compilas tu propia app con los módulos nativos que quieras), y
- **React Native CLI puro**.

Con Development Builds y *config plugins*, Expo puede usar **cualquier** módulo nativo. La antigua "expulsión" (eject) ya no existe como ruptura: `npx expo prebuild` genera las carpetas `ios/` y `android/` cuando las necesites, y puedes editarlas.

### Evaluación contra nuestros requisitos

| Requisito | Expo (dev build) | RN CLI | Comentario |
|---|---|---|---|
| Auth Google | `@react-native-google-signin` vía plugin | Igual | Empate |
| Auth Apple | `expo-apple-authentication` | Config manual en Xcode | **Expo más simple** |
| IA | Es solo HTTPS | Igual | Irrelevante para la decisión |
| Cámara | `expo-camera` | `react-native-vision-camera` | Empate (ambos funcionan en los dos) |
| Notificaciones push | `expo-notifications` + FCM/APNs | Config manual | **Expo más simple** |
| Sensores | `expo-sensors` | Módulos sueltos | Empate |
| Almacenamiento local | `expo-sqlite`, `expo-secure-store`, MMKV | Igual | Empate |
| **Health Connect (Android)** | `react-native-health-connect` + config plugin | Igual | Empate — ambos requieren dev build |
| **Apple Health** | `@kingstinct/react-native-healthkit` + plugin | Igual | Empate |
| Dispositivos físicos | Dev build instalada por USB o QR | Igual | Empate |
| Módulos nativos futuros (visión, TFLite) | Expo Modules API o plugin propio | Nativo directo | **CLI algo más directo**, Expo perfectamente capaz |
| **Publicar en Play Store** | EAS Build + Submit | Manual con Gradle | **Expo mucho más simple** |
| **Publicar en App Store** | **EAS Build compila iOS sin Mac** | **Requiere un Mac obligatoriamente** | **Decisivo** |

### Decisión: **Expo con Development Builds**

Razones, en orden de peso:

1. **iOS sin Mac.** Con RN CLI, compilar y publicar en App Store **exige** un Mac. Con EAS Build, compilas iOS desde Linux o Windows. Para un equipo pequeño esto puede ser la diferencia entre publicar en iOS o no publicar.
2. **Los módulos que necesitamos ya funcionan.** Health Connect, HealthKit, cámara, notificaciones — todos con dev builds. No hay bloqueo técnico.
3. **La salida está garantizada.** `npx expo prebuild` te deja en un proyecto RN estándar. No es un camino sin retorno, así que el riesgo de la decisión es bajo.
4. **Actualizaciones OTA** (`expo-updates`) permiten corregir errores de JS sin pasar por revisión de tienda. En una app con usuarios reales entrenando, esto vale mucho.

**Costos reales que asumimos:**
- Dependemos del ciclo de versiones del SDK de Expo para subir de versión de React Native (unas semanas de retraso frente a la última).
- El tamaño del binario es algo mayor.
- EAS Build tiene plan gratuito limitado; **pero no es obligatorio** — `npx expo run:android` compila localmente con Android Studio, sin costo.

**Regla de trabajo que fijamos desde hoy:**
- Expo Go solo los primeros minutos. A partir de que entre el primer módulo nativo, **development build**.
- Compilación local durante el desarrollo (`expo run:android` con Android Studio).
- EAS Build únicamente para iOS y para los envíos a tienda.

---

## 2. Flujo completo de autenticación

```
Abrir app
   │
   ▼
Splash ─── ¿hay sesión válida en SecureStore?
   │
   ├── Sí ────────────────────────────────────► App (autenticado)
   ├── Hay perfil invitado local ─────────────► App (invitado)
   └── No hay nada
           │
           ▼
      BIENVENIDA
      "Tu entrenamiento se adapta a ti."
           │
           ├── [ Empezar ] ──────────► Onboarding (6 preguntas)
           │                                  │
           │                                  ▼
           │                          Plan generado y visible
           │                                  │
           │                                  ▼
           │                          "Guarda tu plan" (opcional, se puede saltar)
           │                                  │
           │                                  ▼
           │                          App (invitado o registrado)
           │
           └── [ Ya tengo cuenta ] ──► Google / Apple / correo ──► App
```

### Decisión sobre la pantalla de bienvenida

Tu propuesta era mostrar los cuatro botones (Google, Apple, correo, sin cuenta) al mismo nivel. **Recomiendo no hacerlo así**, y el motivo es medible:

Cada paso de autenticación puesto **antes** del valor cuesta entre 20% y 30% de los usuarios. Nuestra métrica de activación es >60% completando el primer entrenamiento; con cuatro botones de cuenta compitiendo, la mayoría toca uno, y perdemos gente antes de que la app haya demostrado nada.

**Propuesta:**

```
        [ logo ]

  Tu entrenamiento se adapta a ti.

   ┌─────────────────────────────┐
   │         Empezar             │   ← acción dominante, sin cuenta
   └─────────────────────────────┘

        Ya tengo cuenta →            ← lleva a Google / Apple / correo
```

"Empezar" entra directo al onboarding en modo invitado. Los proveedores no desaparecen: viven detrás de "Ya tengo cuenta" (para quien reinstala) y aparecen de nuevo al terminar el plan, cuando el usuario ya tiene algo que guardar.

Esto es coherente con la decisión de la Fase 8-9 (el registro va después del plan) y es una hipótesis medible: si en beta el flujo con proveedores visibles convierte mejor, se cambia.

### Arquitectura de proveedores (extensible)

Un único `AuthProvider` interno con una interfaz común:

```
signIn(provider: 'google' | 'apple' | 'email' | ...)
```

La app **nunca** llama al SDK de Google o Apple directamente desde una pantalla. Agregar Facebook o cualquier otro proveedor después = un archivo nuevo en `features/auth/providers/` y una entrada en un mapa. Ninguna pantalla se toca.

---

## 3. Modo invitado: cómo funciona técnicamente

### Alternativas evaluadas

| Opción | Ventajas | Desventajas |
|---|---|---|
| **A. Solo local** (sin backend) | Costo cero. Funciona sin red desde el primer segundo. Sin datos personales en servidor | Se pierde si borran la app. Sin multi-dispositivo |
| **B. Usuario anónimo en backend** (Supabase/Firebase anonymous) | Migración nativa. Multi-dispositivo posible | **Requiere red en el primer arranque.** Genera filas basura por cada instalación. Costo y limpieza. Datos personales de gente que nunca se registró |
| **C. Híbrido: local + subida solo al registrarse** | Costo cero hasta que hay cuenta. Funciona sin red. Migración controlada | Se pierde si borran la app antes de registrarse |

### Decisión: **opción C — local primero, sin fila en el backend hasta el registro**

Razones:

1. **Contradice nuestro propio principio offline.** Crear un usuario anónimo en el servidor obliga a tener red en el primer arranque. Nuestra app debe poder generar un plan y entrenar sin conexión desde el minuto uno.
2. **Costo y basura.** Una app fitness tiene una tasa de abandono altísima en las primeras 48 horas. La opción B crea un usuario real en la base por cada instalación que nunca volverá. Eso se paga y se limpia.
3. **Privacidad.** No crear registros de personas que nunca se registraron es estrictamente mejor, y simplifica el cumplimiento de protección de datos.

**Lo que asumimos:** si el usuario borra la app antes de registrarse, pierde su progreso. Se mitiga con el aviso en el momento adecuado (sección 4), no con arquitectura.

### El punto elegante: el modo invitado casi no cuesta código

Como la app es **offline-first para todo el mundo**, la base de datos local ya es la fuente de verdad durante el entrenamiento — sea el usuario invitado o registrado. Entonces:

```
Invitado   = usuario local con sync desactivado
Registrado = usuario local con sync activado
```

No hay dos aplicaciones. Hay una bandera. Esa es la razón por la que esta arquitectura vale la pena.

### Decisión técnica que hay que tomar hoy, no después

**Todos los identificadores se generan en el cliente como UUID v4, desde el primer día.** Entrenamientos, series, sesiones, todo.

Sin esto, migrar al invitado obliga a reasignar IDs y reescribir referencias — y la sincronización offline deja de ser idempotente. Con esto, subir los datos de un invitado es un `INSERT` masivo que se puede reintentar sin duplicar nada. Es una línea de decisión ahora y semanas de trabajo ahorradas después.

---

## 4. Cuánto uso gratuito debe tener un invitado

### Recomendación: no un contador, sino el momento en que ya tiene algo que perder

Los límites por número fijo ("3 entrenamientos y bloqueo") fallan porque cortan sin importar si el usuario le vio valor a la app o no.

**Escalera propuesta:**

| Momento | Qué pasa | Por qué ahí |
|---|---|---|
| Entrenamientos 1 y 2 | Nada. Cero fricción | Todavía está evaluando el producto |
| **Al terminar el 3.º** | Aviso **descartable**: *"Ya llevas 3 entrenamientos. Crea tu cuenta para no perderlos si cambias de teléfono."* | Nuestra propia métrica dice que el hábito se forma en 4 sesiones / 14 días. Pedimos justo antes de ese umbral, cuando ya hay algo real que proteger |
| Día 7 con ≥2 entrenamientos | Segundo aviso descartable, con otro texto | Segunda oportunidad sin insistir el mismo día |
| **5.º entrenamiento o día 14** (lo que llegue primero) | Muro **no descartable** para seguir entrenando | Después de 5 sesiones la app ya demostró todo lo que podía demostrar gratis |
| Chat con el entrenador IA | **5 mensajes** en total como invitado | Control de costo, no de negocio: cada mensaje cuesta dinero real |
| Cualquier cosa que diga "guardar", "sincronizar" o "historial completo" | Muro inmediato | Son literalmente funciones de cuenta |

### La regla de redacción importa tanto como el límite

El aviso se plantea siempre como **protección, nunca como peaje**:

- ✅ *"Crea tu cuenta para no perder tus 3 entrenamientos."*
- ❌ *"Regístrate para continuar."*

El primero le recuerda lo que ya ganó. El segundo le recuerda que le están cobrando.

---

## 5. Conversión de invitado a usuario registrado

```
El invitado toca "Crear cuenta"
        │
        ▼
Autenticación con proveedor (Google / Apple / correo)
        │
        ▼
¿Esta cuenta ya existía y tiene datos en el servidor?
        │
   ┌────┴─────────────────────────┐
   │ NO (cuenta nueva)            │ SÍ (ya tenía datos)
   ▼                              ▼
Sube todo en silencio.       Pregunta UNA vez:
No preguntes nada.           "Tienes progreso en este teléfono
        │                     y en tu cuenta. ¿Cuál conservamos?"
        ▼                              │
"Listo, tu progreso                    ▼
 quedó guardado."              [Combinar] [Usar el de la cuenta]
```

**Matiz importante frente a tu propuesta original.** Planteabas preguntar siempre si desea conservar su progreso. Recomiendo **no preguntar cuando la cuenta es nueva**: preguntar ahí genera duda donde no la había ("¿podría perderlo?"). Simplemente se sube y se confirma. La pregunta solo tiene sentido en el caso real de conflicto, que es cuando la cuenta ya traía datos.

**Cómo se hace técnicamente:**

1. Un único endpoint `POST /migrate-guest` que recibe todo el estado local en un solo cuerpo (perfil, onboarding, plan, entrenamientos, series, preferencias).
2. **Transaccional**: o entra todo, o no entra nada.
3. **Idempotente**: como los IDs son UUID generados en el cliente, reintentar no duplica. Un `ON CONFLICT DO NOTHING` resuelve el reintento.
4. **Los datos locales no se borran hasta que el servidor confirma.** Si falla, el usuario sigue teniendo todo y se reintenta después.
5. Cada fila local lleva `synced_at` y `dirty` para saber qué falta subir.

---

## 6. Sistema de autenticación y backend

| Criterio | Supabase | Firebase | Backend propio (NestJS) |
|---|---|---|---|
| Proveedores (Google, Apple, correo) | Sí, + muchos OAuth | Sí, el más maduro | Lo construyes tú |
| **Modelo de datos** | **Postgres relacional** | Firestore NoSQL | El que elijas |
| Costo inicial | Gratis hasta 50k usuarios activos; luego ~$25/mes | Generoso al inicio, **por operación** después | Servidor + tu tiempo |
| Seguridad por fila | **RLS nativo, declarativo** | Security Rules (más frágiles) | Tú lo escribes |
| Offline | Lo construyes | Firestore lo trae | Lo construyes |
| Integración con IA | Edge Functions + pgvector | Cloud Functions | Libre |
| **Dependencia del proveedor** | **Baja — es Postgres estándar** | **Alta** | Ninguna |
| Tiempo hasta el MVP | Días | Días | Semanas |

### Decisión: **Supabase**

1. **Nuestro modelo de datos es profundamente relacional.** Ejercicios, patrones de movimiento, rutinas, series, progreso por grupo muscular. La sustitución inteligente de ejercicios es una consulta con *joins*; el análisis de volumen semanal es una agregación SQL. En Firestore habría que desnormalizar justo las consultas que nos diferencian.
2. **RLS.** Cada usuario ve solo sus datos, declarado en la base y no en el código de la app. Es la diferencia entre una fuga de datos y una imposibilidad estructural.
3. **Salida barata.** Es Postgres. Si Supabase encarece o desaparece, migramos la base y sustituimos la capa de auth. Salir de Firestore es reescribir la aplicación.
4. **Costo predecible.** Tarifa plana contra facturación por operación, que en una app con sincronización puede dispararse sin aviso.

**Lo que descartamos y por qué:**
- **Firebase**: su gran ventaja (persistencia offline de Firestore) no nos sirve tanto como parece, porque **necesitamos lógica de sincronización propia de todos modos** (entrenamiento en curso, reglas de conflicto, migración de invitado). Pagaríamos el precio del modelo NoSQL sin cobrar el beneficio.
- **Backend propio**: correcto a largo plazo, prematuro hoy. Serían semanas reconstruyendo lo que Supabase da en un día, con peor seguridad hasta que madure.

**Cómo mitigamos el riesgo de quedar atados:** la app usa `supabase-js` directo (con RLS) **solo para CRUD y sincronización**. Todo lo que tenga lógica de negocio o secretos pasa por **Edge Functions propias** (proxy de IA, migración de invitado, validación de suscripción). Así el día que cambiemos de backend, cambia la implementación de esas funciones, no la app.

### Sesión persistente — un detalle de seguridad que suele fallar

`supabase-js` guarda la sesión en **AsyncStorage por defecto, que no está cifrado**. Hay que configurarlo explícitamente para usar **`expo-secure-store`** (Keychain en iOS, Keystore en Android).

| Dato | Dónde va |
|---|---|
| Refresh token | **SecureStore** (Keychain / Keystore) |
| Access token | En memoria; se renueva solo |
| Contraseñas | **En ningún lado.** Nunca se almacenan en el dispositivo |

Cierre de sesión: borra SecureStore, revoca el refresh token en el servidor y **pregunta qué hacer con los datos locales** (borrarlos o conservarlos para el siguiente inicio de sesión).

---

## 7. Almacenamiento local

Tres capas, cada una con un trabajo:

| Capa | Tecnología | Para qué | Regla |
|---|---|---|---|
| Segura | **expo-secure-store** | Solo tokens | Nada más vive aquí |
| Rápida | **react-native-mmkv** | Preferencias, banderas, caché pequeña | Síncrona, sin `await` |
| Relacional | **expo-sqlite + Drizzle ORM** | Ejercicios, rutinas, entrenamientos, series, progreso | Fuente de verdad local |

**Por qué SQLite y no AsyncStorage:** nuestras consultas son relacionales de verdad — filtrar ejercicios por patrón + equipo + nivel, agregar volumen por grupo muscular por semana. Con AsyncStorage habría que cargar todo en memoria y filtrar en JavaScript, lo cual deja de funcionar apenas el historial crece.

**Por qué Drizzle y no WatermelonDB o Realm:** WatermelonDB regala sincronización pero impone su propio protocolo y es difícil de depurar; Realm tiene un futuro incierto y un peso nativo mayor. Drizzle es tipado con TypeScript, ligero, y **nosotros controlamos la lógica de sincronización — que de todos modos necesitamos a medida.** Para un equipo pequeño, lógica explícita que entiendes le gana a un framework que no.

---

## 8. Qué vive local y qué vive en el servidor

| Dato | Local | Servidor | Notas |
|---|---|---|---|
| Catálogo de ejercicios | ✅ caché versionada | ✅ maestro | **Se empaqueta una copia inicial dentro de la app** para que el primer arranque funcione sin red |
| Plan activo | ✅ | ✅ | |
| Entrenamiento en curso | ✅ **fuente de verdad** | ❌ | Sube al terminar |
| Series registradas | ✅ hasta sincronizar | ✅ histórico | |
| Perfil, objetivo, nivel | ✅ caché | ✅ **fuente de verdad** | |
| Progreso agregado y récords | ✅ caché | ✅ | Se calcula en el servidor |
| Conversaciones con la IA | caché corta | ✅ | |
| Preferencias de interfaz | ✅ | — | No vale la pena sincronizar |
| Tokens | ✅ SecureStore | — | |
| **Estado de suscripción** | caché **no confiable** | ✅ **única verdad** | Jamás confiar en el cliente para esto |
| **Claves de API de IA** | ❌ **nunca** | ✅ | Un APK se descompila en dos minutos |

---

## 9. Arquitectura general

```
┌──────────────────────────────────────────────────────┐
│  APP REACT NATIVE (Expo dev build, TypeScript)       │
│                                                      │
│   Interfaz                                           │
│       │                                              │
│   MOTOR DE RUTINAS  ← TypeScript puro, determinista  │
│   (genera, adapta, sustituye — sin red, sin IA)      │
│       │                                              │
│   SQLite (Drizzle) ── fuente de verdad local         │
│   SecureStore ─────── tokens                         │
│   Cola de sincronización                             │
└───────────────────────┬──────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼──────────────────────────────┐
│  SUPABASE                                            │
│   Auth (Google / Apple / correo)                     │
│   Postgres + RLS                                     │
│   Edge Functions                                     │
│     · /ai/chat        → proxy al modelo              │
│     · /migrate-guest  → conversión de invitado       │
│     · /billing/*      → validación de suscripción    │
│     · /analysis/weekly→ análisis por lotes (noche)   │
└───────────────────────┬──────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │   API de Claude   │
              └───────────────────┘
```

### La decisión más importante de todo el diagrama

**El motor de rutinas corre en el teléfono, no en el servidor, y no usa IA.**

Es TypeScript puro, determinista y sin dependencias de React Native. Consecuencias:

- Funciona **sin conexión** (requisito del entrenamiento).
- Cuesta **cero** por uso.
- Es **instantáneo** (sin latencia de red ni de modelo).
- Es **testeable** con pruebas unitarias normales, sin simuladores ni llamadas de red.
- Si la IA falla, el producto sigue funcionando — que es exactamente lo que decidimos en la Fase 8-9.

La IA nunca *es* el motor. La IA **interpreta** lo que el usuario pide, **llama** al motor y **explica** lo que el motor decidió.

---

## 10. Inteligencia artificial: arquitectura y control de costo

### La regla de separación

| Va a lógica tradicional (gratis, offline, instantáneo) | Va al modelo (cuesta, requiere red) |
|---|---|
| Generar la rutina | Interpretar *"hoy estoy cansado y solo tengo 20 minutos"* |
| Sustituir un ejercicio | Conversar con el usuario |
| Calcular progresión de carga | Explicar en lenguaje natural por qué cambió algo |
| Detectar estancamiento | Redactar el análisis semanal |
| Temporizadores, estadísticas, validaciones | Interpretar una limitación descrita libremente |

Si una función se puede resolver con una consulta SQL o un `if`, **no se resuelve con IA**. No por purismo: cada llamada cuesta dinero y añade latencia.

### Modelos y precios reales (verificados, no de memoria)

| Modelo | ID | Entrada $/1M | Salida $/1M |
|---|---|---|---|
| Claude Opus 5 | `claude-opus-5` | $5.00 | $25.00 |
| Claude Sonnet 5 | `claude-sonnet-5` | $2.00 | $10.00 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1.00 | $5.00 |

**Recomendación de partida: `claude-opus-5`** para el entrenador conversacional. La calidad de interpretación es justo lo que diferencia el producto, y en el MVP el volumen es bajo. Bajar de modelo es una decisión tuya de negocio, no mía de arquitectura — lo que sí hago es dejar el proveedor y el modelo **configurables por variable de entorno**, para que cambiarlo sea una línea y no una migración.

### Tres mecanismos de control de costo, desde el día uno

1. **Caché de prompt.** El prompt del sistema y el contexto estable del usuario (perfil, nivel, equipo) se marcan como cacheables. Solo la pregunta nueva se paga completa. En una conversación típica esto reduce muchísimo el costo de entrada.
2. **Intenciones acotadas.** El chat resuelve cuatro intenciones (reajustar sesión, sustituir ejercicio, explicar, consultar progreso). Fuera de eso, responde honestamente que no es su función. Esto limita el gasto **y** evita que dé consejos médicos o nutricionales.
3. **Análisis semanal por lotes.** El análisis de progreso no necesita ser en tiempo real: se ejecuta de madrugada con la **Batch API, al 50% del costo**, y el usuario lo encuentra listo por la mañana. Es más barato y además mejor producto.

**Límite duro de gasto por usuario y por día**, aplicado en la Edge Function. Sin esto, un error o un abuso puede generar una factura imprevisible.

---

## 11. Estados de usuario — corrección al planteamiento

Propusiste seis estados: nuevo, invitado, registrado, gratuito, premium, vencido. **Son dos ejes distintos mezclados**, exactamente el mismo problema que tuvimos con "gimnasio" y "casa" como tipos de usuario.

```
identidad   : anónimo | autenticado
derechos    : invitado | gratuito | premium | vencido
```

Seis estados planos obligan a escribir condicionales de seis ramas en cada pantalla. Dos ejes independientes no.

Y en la interfaz **no se pregunta por el estado, se pregunta por la capacidad**:

```
can('sync')                → ¿puede guardar en la nube?
can('ai_coach_unlimited')  → ¿chat sin límite?
can('advanced_analytics')  → ¿análisis avanzado?
```

Añadir un plan nuevo mañana = añadir una fila a un mapa de capacidades. Cero pantallas tocadas.

> **Nota de negocio:** no construyas las suscripciones en el MVP. Cobrar antes de tener retención es el orden inverso. Pero **sí** deja la abstracción de capacidades desde el principio, para que activarlas después sea configuración y no refactorización. Cuando llegue el momento, RevenueCat resuelve la compleja parte de compras en ambas tiendas.

---

## 12. Estructura de carpetas

Preguntaste si tu estructura por capas técnicas era adecuada. **No para este proyecto** — recomiendo por funcionalidades, con un núcleo transversal:

```
src/
├─ app/                    entrada, proveedores, raíz de navegación
│
├─ core/                   transversal · NO depende de ninguna feature
│   ├─ db/                 SQLite, esquema, migraciones (Drizzle)
│   ├─ api/                cliente Supabase, interceptores
│   ├─ sync/               cola y motor de sincronización
│   ├─ storage/            SecureStore, MMKV
│   ├─ config/             variables de entorno, feature flags
│   ├─ theme/              tokens de diseño (Fase 11)
│   ├─ errors/             manejo y reporte de errores
│   └─ analytics/
│
├─ features/
│   ├─ auth/               incluye modo invitado y migración
│   ├─ onboarding/
│   ├─ training-engine/    ★ TypeScript puro, sin React Native
│   ├─ workouts/           sesión, registro, temporizador
│   ├─ exercises/          catálogo, patrones, sustitución
│   ├─ plan/
│   ├─ progress/
│   ├─ ai-coach/
│   ├─ profile/
│   └─ subscriptions/      solo la abstracción de capacidades por ahora
│
├─ shared/
│   ├─ ui/                 componentes genéricos
│   ├─ hooks/
│   └─ utils/
│
└─ types/
```

Cada feature tiene dentro: `components/ hooks/ screens/ services/ store/ types.ts index.ts`

**Dos reglas que se hacen cumplir con ESLint, no con buena voluntad:**
1. Una feature **nunca** importa de las entrañas de otra. Solo desde su `index.ts`, o desde `core`/`shared`.
2. `core` **nunca** importa de `features`. La dependencia va en una sola dirección.

**★ `training-engine` es deliberadamente especial:** es TypeScript puro, sin una sola importación de React Native. Por eso se puede probar con tests normales, y el día que queramos ejecutarlo también en el servidor (o compartirlo con una versión web), se mueve tal cual.

**Por qué esta estructura y no la tuya:** con capas técnicas, añadir "nutrición" mañana significa tocar doce carpetas distintas. Con features, es una carpeta nueva. Y cuando algo se descarta, se borra una carpeta en lugar de perseguir fragmentos por todo el proyecto.

---

## 13. Offline-first: cómo queda preparado

**Principios:**

1. **Toda escritura va primero a SQLite local** y encola una operación de sincronización. La interfaz nunca espera al servidor para confirmar algo al usuario.
2. **Toda lectura de pantalla sale de local.** Consecuencia concreta: **la pantalla de entrenamiento jamás muestra un cargando.** Todo lo que necesita ya está en el dispositivo.
3. **La cola se vacía cuando hay red**, con reintentos y espera progresiva.
4. **Idempotencia por UUID de cliente** — reintentar nunca duplica.
5. **Catálogo de ejercicios empaquetado en la app.** El primer arranque funciona con cero conexión; luego se actualiza por versión.

**Reglas de conflicto:**

| Dato | Regla |
|---|---|
| Entrenamientos y series | Gana el dispositivo (el usuario estuvo ahí; el servidor no) |
| Perfil y objetivos | Gana el servidor al iniciar sesión |
| Plan | Gana la modificación más reciente |

**Qué sí necesita red, explícitamente:** chat con la IA, análisis semanal, sincronización, primer inicio de sesión, actualización del catálogo. Todo lo demás funciona en un sótano sin señal.

---

## 14. Entornos, Git y seguridad del repositorio

**Tres entornos, tres proyectos de Supabase separados:**

```
development → staging → production
```

Nunca se apunta a la base de producción desde el entorno local. Se gestiona con `app.config.ts` de Expo + perfiles de EAS.

**Archivos que se versionan:** `.env.example` (con nombres de variables y valores falsos), `README.md`, `.gitignore`, documentación técnica.
**Archivos que jamás se suben:** `.env`, `.env.local`, claves de servicio, `google-services.json`, `GoogleService-Info.plist`, certificados.

**Ramas:**

```
main       → producción, protegida, solo por PR
develop    → integración
feature/*  → funcionalidades nuevas
fix/*      → correcciones
release/*  → preparación de versión
```

A partir de la próxima fase, cada funcionalidad se entrega con: nombre de rama recomendado, archivos afectados, objetivo y pruebas a realizar.

---

## 15. MVP · Versión 2 · Futuro

El *qué* ya quedó definido en la Fase 6-7. Aquí va el **orden de construcción**, que es lo que faltaba:

### MVP — en este orden

| # | Bloque | Por qué en esta posición |
|---|---|---|
| 1 | Proyecto, estructura, entornos, navegación | Sin base no hay nada |
| 2 | SQLite + esquema + catálogo semilla de ejercicios | **El contenido es el mayor riesgo del proyecto.** Cuanto antes exista, antes se descubren los problemas |
| 3 | **Motor de rutinas** (TS puro, con pruebas) | Es el corazón. Se construye y se prueba **antes** que cualquier pantalla |
| 4 | Onboarding + generación del primer plan | Primer momento de valor |
| 5 | **Pantalla de entrenamiento + registro de series** | La pantalla de uso diario |
| 6 | Resumen post-entrenamiento con indicadores adelantados | Donde se cierra el hueco de resultados |
| 7 | Auth + modo invitado + migración | Antes de tener usuarios reales, después de tener producto |
| 8 | Sincronización | Ya hay algo que sincronizar |
| 9 | Progreso y plan semanal | |
| 10 | Chat IA acotado | Lo último: es lo único que no puede romper el resto |
| 11 | Regreso sin castigo, racha flexible | Retención |
| 12 | Eliminación de cuenta, exportación, aviso médico | **Obligatorio para publicar** |

### Versión 2
Recalibración automática de nivel · detección de estancamiento y deload · gamificación completa · notificaciones inteligentes · modo avanzado (RPE/RIR) · medidas y fotos · suscripciones y analítica avanzada.

### Futuro
IA visual por cámara · Apple Health / Health Connect · wearables · nutrición · comunidad · entrenadores y gimnasios · marketplace · versión web · panel administrativo.

---

### Próximo paso

Con estas decisiones cerradas, lo siguiente es **la Fase 11 (identidad de marca y diseño visual)** o **arrancar el entorno local** (crear el proyecto Expo, estructura de carpetas, navegación y variables de entorno).

Recomiendo **marca y diseño visual primero**: los tokens de color y tipografía se necesitan para construir `core/theme/`, y hacerlo después obliga a repasar cada pantalla ya escrita.
