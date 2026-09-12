# Fase 6-7 · Definición de funcionalidades y corte MVP / v2 / Futuro

> Continúa `01-descubrimiento-y-estrategia.md`. Mantiene las decisiones anteriores: enfoque híbrido (motor adaptativo + asistente conversacional embebido), 5 niveles de usuario, contexto por sesión.

---

## 1. El problema central que define el MVP

El usuario objetivo prioritario no es "el principiante" ni "el avanzado": es **quien empieza y no sigue**. Es el segmento más grande del mercado y el peor atendido.

La causa del abandono **no es la falta de rutinas**. Es un desfase temporal:

```
Semana:      1 ─── 2 ─── 3 ─── 4 ─── 6 ─── 8 ─── 12
Esfuerzo:    ███████████████████████████████████████
Resultado
visible:                                    ▁▃▅███
Abandono:          ▲▲▲▲▲▲▲▲▲▲
                   (aquí se pierde a la mayoría)
```

**El usuario abandona en el hueco**: entre 6 y 10 semanas antes de que su cuerpo le dé la primera señal de que valió la pena.

### Decisión de producto derivada

El trabajo principal del MVP no es prescribir entrenamientos (eso es la base mínima). Es **cerrar ese hueco haciendo visible el progreso antes de que el cuerpo cambie**, y **sostener al usuario en el momento en que falla**.

Dos consecuencias concretas:

**A. Medimos indicadores adelantados, no solo los tardíos.**

| Tipo | Ejemplos | Cuándo se mueve | Uso |
|---|---|---|---|
| **Adelantados** (prioridad MVP) | Sesiones completadas, volumen total levantado, repeticiones añadidas, constancia, ejercicios dominados, RPE bajando con la misma carga | **Desde la semana 1** | Es lo que el usuario ve a diario. Cierra el hueco |
| **Tardíos** | Récords de fuerza, medidas corporales, peso, fotos | Semana 8-12 | Refuerzo posterior. No pueden ser el único indicador |

La mayoría de apps muestra solo los tardíos (peso corporal, PRs) — precisamente los que no se mueven cuando el usuario más necesita verlos moverse.

**B. Diseñamos explícitamente el momento de la recaída.**

Ninguna app diseña el momento más importante del producto: **cuando el usuario falla**. Hoy hacen una de dos cosas, y ambas son malas:
- Nada (el usuario desaparece en silencio).
- Culpa: *"¡Llevas 5 días sin entrenar!"* — que es exactamente el mensaje que impide volver, porque vuelve el costo emocional de la falla.

Nuestra decisión: **el regreso sin castigo**. Es una funcionalidad, no un detalle de tono.

---

## 2. Decisión de arquitectura de contenido: patrones de movimiento

Esta decisión sostiene casi todo el motor, así que se toma ahora.

Los ejercicios **no** se relacionan entre sí por nombre ("sustituto del press banca = press con mancuernas"). Se clasifican por **patrón de movimiento**:

| Patrón | Gimnasio | Casa (con algo) | Sin equipo |
|---|---|---|---|
| Empuje horizontal | Press banca | Press con mancuernas | Flexiones |
| Empuje vertical | Press militar | Press mancuerna | Pike push-up |
| Tracción horizontal | Remo con barra | Remo con mancuerna | Remo invertido en mesa |
| Tracción vertical | Dominadas / Jalón | Banda elástica | Dominadas asistidas |
| Dominante de rodilla | Sentadilla con barra | Sentadilla goblet | Sentadilla búlgara |
| Dominante de cadera | Peso muerto | Peso muerto rumano | Hip thrust a una pierna |
| Core / antirrotación | Rueda abdominal | Plancha con peso | Plancha, hollow hold |

**Por qué importa:** el motor no busca "un sustituto de este ejercicio", busca **"un empuje horizontal disponible en este contexto y apropiado para este nivel"**. Con esto, las tres funcionalidades diferenciadoras clave (sustitución inteligente, continuidad gimnasio↔casa, y el modo sin equipo) salen del **mismo mecanismo** en vez de ser tres implementaciones separadas.

> **Advertencia de riesgo — el mayor riesgo del proyecto no es el código, es el contenido.** La biblioteca de ejercicios (mapeo muscular correcto, dificultad, equipo, patrón, demostración visual) es el activo más caro y más lento de construir, y sin ella el motor no funciona. Recomendación: **empezar con 120-150 ejercicios muy bien curados** que cubran los 7 patrones × 3 contextos × 3 niveles, en vez de 1000 mediocres. La cobertura de patrones importa más que el tamaño del catálogo.

---

## 3. Funcionalidades del MVP

Criterio de corte: **entra al MVP solo lo que se necesita para que un usuario nuevo complete su primera semana y regrese la segunda.** Todo lo demás espera.

### 3.1 Activación

| # | Funcionalidad | Clasificación | Problema que resuelve |
|---|---|---|---|
| 1 | **Onboarding progresivo** (~6 preguntas, < 2 min, en lenguaje concreto no técnico) | Diferenciadora | El registro largo es el primer punto de abandono. Preguntamos lo mínimo para generar un plan digno y aprendemos el resto con el uso |
| 2 | **Primer entrenamiento en menos de 5 minutos** desde abrir la app | Esencial | El usuario debe *sentir* el producto antes de que se le enfríe la intención |
| 3 | **Modo guía para nivel 1** (enseña vocabulario y técnica antes de exigir carga) | Diferenciadora | Nadie atiende bien al que empieza de cero |

### 3.2 Núcleo de entrenamiento

| # | Funcionalidad | Clasificación | Problema que resuelve |
|---|---|---|---|
| 4 | **Generador de plan semanal adaptativo** (objetivo, nivel, días, tiempo, contexto) | Esencial | El usuario no sabe estructurar; es la base del producto |
| 5 | **Selector de contexto por sesión** ("¿dónde entrenas hoy?" en un toque) | Diferenciadora | La misma persona entrena en lugares distintos sin perder el plan |
| 6 | **Pantalla de entrenamiento**: ejercicio, demostración, series, reps, peso, descanso, temporizador, siguiente | Esencial | Uso diario. Debe ser rapidísima — se usa de pie, con una mano, sudando |
| 7 | **Registro de series en un toque** | Esencial | Si registrar cuesta, el usuario deja de registrar y perdemos los datos del motor |
| 8 | **Sustitución inteligente de ejercicio** (por patrón de movimiento) | Diferenciadora | Una limitación puntual (equipo ocupado, molestia, preferencia) no debe romper la sesión |
| 9 | **Reajuste de sesión por tiempo real disponible** ("hoy solo tengo 20 min") | Diferenciadora | Evita el "todo o nada" que mata la constancia |
| 10 | **Biblioteca de ejercicios** (patrón, músculos, equipo, nivel, errores comunes, demostración) | Esencial | Base de contenido y consulta |

### 3.3 Progreso y motivación (el diferenciador del MVP)

| # | Funcionalidad | Clasificación | Problema que resuelve |
|---|---|---|---|
| 11 | **Progreso por indicadores adelantados** (volumen, constancia, reps añadidas, RPE) | **Innovadora** | Cierra el hueco de 8-12 semanas: el usuario ve avance real desde la semana 1 |
| 12 | **Motivación contextual basada en datos reales** (nunca frases genéricas) | **Innovadora** | *"Llevas 3 semanas subiendo el volumen de piernas"* es creíble; *"¡Tú puedes!"* no |
| 13 | **Regreso sin castigo** tras inactividad: sin culpa, plan recalibrado a la baja, sesión de reentrada corta y ganable | **Innovadora** | Es el momento donde el mercado pierde a sus usuarios y nadie lo diseña |
| 14 | **Racha flexible** (tolera fallos sin destruir el progreso acumulado) | Diferenciadora | La racha tradicional castiga al inconsistente justo cuando más frágil está |
| 15 | **Explicabilidad del ajuste** (*"bajamos la carga porque tu RPE subió 2 semanas seguidas"*) | **Innovadora** | Sin el *por qué*, el motor parece caja negra y pierde confianza |

### 3.4 Entrenador IA — **acotado en el MVP**

| # | Funcionalidad | Clasificación | Problema que resuelve |
|---|---|---|---|
| 16 | **Asistente conversacional con alcance definido** | Diferenciadora | Control en lenguaje natural del plan y la sesión |

> **Decisión de asesor: el chat del MVP NO es de propósito general.** Se acota a intenciones que la app puede *ejecutar de verdad*:
> - Reajustar la sesión (tiempo, lugar, equipo, energía)
> - Sustituir un ejercicio
> - Explicar un ajuste o un ejercicio
> - Responder sobre el propio progreso del usuario
>
> **Por qué acotarlo:** (a) el costo por usuario de un chat abierto es impredecible y puede hundir el modelo de negocio; (b) la latencia mata la experiencia en medio de una serie; (c) un chat abierto invita preguntas médicas y de nutrición que **no debemos responder** (riesgo legal y de daño real); (d) una respuesta genérica y correcta pero inútil destruye más confianza que no tener chat. Fuera de alcance → respuesta honesta que redirige, no una alucinación amable.

### 3.5 Cumplimiento y base

| # | Funcionalidad | Clasificación | Nota |
|---|---|---|---|
| 17 | Autenticación y perfil | Esencial | — |
| 18 | **Eliminación de cuenta y exportación de datos** | Esencial | **Requisito obligatorio** de App Store y Google Play, y de protección de datos. No es opcional ni postergable |
| 19 | Aviso de no sustitución de consejo médico | Esencial | Requisito legal y ético |
| 20 | Funcionamiento offline del entrenamiento en curso | Esencial | Muchos gimnasios tienen mala señal. Si la app falla ahí, se desinstala |

---

## 4. Fuera del MVP

### v2 (requieren datos históricos que aún no existen)

| Funcionalidad | Por qué espera |
|---|---|
| Recalibración automática de nivel | Necesita historial real de comportamiento para ser fiable |
| Detección de estancamiento y deload | Requiere 8+ semanas de datos por usuario |
| Gamificación completa (niveles, insignias, desafíos) | Sin retención base, la gamificación no salva nada — primero el producto, luego la capa |
| Notificaciones inteligentes | Mal calibradas generan desinstalación. Necesitan datos de comportamiento |
| Modo avanzado (RPE/RIR, sobrescribir el motor) | Para niveles 4-5, que no son el foco inicial |
| Medidas corporales y fotos de progreso | Indicadores tardíos; útiles, pero no resuelven el hueco inicial |
| Analítica avanzada (capa premium) | Monetización posterior |

### Futuro (arquitectura preparada, desarrollo posterior)

IA visual por cámara · Apple Health / Health Connect · wearables y smartwatches · nutrición y planificación de comidas · comunidad, amigos y desafíos · entrenadores y gimnasios · marketplace · versión web · panel administrativo.

> Ninguna de estas se desarrolla ahora, pero **el modelo de datos y la arquitectura deben admitirlas sin reescritura** (decisión que se materializa en las Fases 12-13).

---

## 5. Cómo sabremos si el MVP funciona

Métricas de validación, en orden de importancia. Sin esto, no sabremos si el producto resuelve el problema o solo se ve bonito:

| Métrica | Qué valida | Objetivo de referencia |
|---|---|---|
| % que completa su **primer entrenamiento** | Activación y onboarding | > 60% |
| % que completa **4 entrenamientos en 14 días** | Formación de hábito temprano | > 35% |
| **Retención D30** | Que el producto resuelve el problema real | > 25% (el promedio de la categoría ronda 5-10%) |
| % de usuarios que **regresan tras 7+ días inactivos** | Que "el regreso sin castigo" funciona | > 30% |
| % de sesiones que usan reajuste o sustitución | Que el diferenciador se usa de verdad | > 20% |

La métrica que **no** perseguimos es tiempo en app: en una app de entrenamiento, menos tiempo en pantalla y más tiempo entrenando es mejor producto.

---

### Próximo paso (Fase 8-9)

Con el alcance cerrado, sigue el **diseño de la experiencia y la arquitectura de información**: los 3-4 flujos críticos (primer uso → primer entrenamiento; entrenamiento diario; el regreso tras fallar) y la estructura de navegación, antes de cualquier wireframe o decisión técnica.
