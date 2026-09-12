# Fase 1-10 · Descubrimiento y Estrategia de Producto

> Documento de decisiones del proyecto. Se actualizará en cada fase siguiente para mantener coherencia. No contiene código: es la base de producto sobre la que se construirá la arquitectura, el diseño y el desarrollo.

---

## 1. Concepto de la aplicación

Un **entrenador personal inteligente de bolsillo**: una app de React Native que genera, ejecuta y ajusta rutinas de entrenamiento en función del contexto real del usuario (tiempo disponible, lugar, equipo, energía, historial y progreso), y que permite renegociar el plan en lenguaje natural en el momento en que cambia la situación ("solo tengo 20 minutos", "no tengo pesas hoy", "cambia este ejercicio"). No es una librería de rutinas estáticas ni un chatbot decorativo: es un motor adaptativo con una capa conversacional que lo controla.

## 2. Problema real que resolvemos

El problema no es "falta de rutinas" (existen miles gratis). El problema es la **fricción entre el plan y la vida real**:

- El usuario tiene un plan, pero hoy su realidad no coincide con él (menos tiempo, otro lugar, cansancio, una lesión leve) y no sabe cómo adaptarlo sin romper su progreso.
- El principiante no sabe *cómo* estructurar nada desde cero y las apps actuales asumen que ya sabe.
- Nadie le dice *por qué* algo cambió (peso, series, dificultad): la sensación de "caja negra" o de hoja de cálculo sin criterio genera abandono.
- La constancia se rompe porque el sistema es rígido: si no puedes seguir el plan al pie de la letra, la app no ofrece un camino intermedio, así que el usuario simplemente deja de abrir la app.

La oportunidad no es "otra app de ejercicios", es **eliminar la fricción de decisión** que ocurre cada vez que la vida no coincide con el plan.

## 3. Modelo de usuario

### 3.1 Decisión de arquitectura: tres ejes independientes, no un solo segmento

Un error común del mercado es mezclar en un mismo "tipo de usuario" cosas que cambian a ritmos distintos. Separamos el usuario en **tres ejes ortogonales**:

| Eje | Qué es | Cada cuánto cambia | Dónde vive |
|---|---|---|---|
| **Nivel** | Experiencia y capacidad técnica del usuario | Lentamente (meses) | Perfil del usuario |
| **Contexto** | Dónde entrena y con qué equipo | **Por sesión** (puede cambiar hoy mismo) | Sesión de entrenamiento |
| **Disponibilidad** | Tiempo por sesión y frecuencia semanal | Semana a semana | Plan + sesión |

**Consecuencia directa:** "entrena en gimnasio" y "entrena en casa" **no son tipos de usuario distintos**. Son el mismo usuario en contextos distintos. El sistema debe permitir que la misma persona entrene el martes en el gimnasio y el jueves en su sala, **sin perder el plan, sin duplicar perfiles y sin romper la progresión**. Esta es una decisión de arquitectura, no solo de UX: el volumen semanal por grupo muscular se acumula de forma global, sin importar dónde se entrenó.

### 3.2 Los 5 niveles de usuario

| Nivel | Quién es | Qué NO sabe | Qué hace la app diferente | Riesgo principal |
|---|---|---|---|---|
| **1 · Principiante absoluto** (sin ningún conocimiento) | Nunca entrenó, o lo intentó sin guía. No conoce los nombres de los ejercicios ni qué es una serie o una repetición | Vocabulario, técnica, cómo elegir peso, cuánto es "suficiente" | Enseña el vocabulario antes de pedirlo. Sesiones cortas, pocos ejercicios, foco en técnica y en **crear el hábito**, no en carga. Progresión por dominio técnico, no por peso | Lesión, saturación y abandono en las 2 primeras semanas |
| **2 · Principiante** | Entrenó antes o conoce lo básico. Reconoce los ejercicios y puede seguir una rutina, pero no sabe construir una | Cómo estructurar y progresar; cuánto volumen necesita | Progresión lineal automática de carga. Estructura semanal clara. Explica el *por qué* de cada ajuste | Hacer demasiado, frustrarse cuando la progresión lineal se acaba |
| **3 · Intermedio** | Entrena con constancia 6+ meses. Técnica correcta, conoce sus límites | Periodización, gestión de volumen, por qué se estancó | Introduce variación, control de volumen por grupo muscular, detección de estancamiento y deload | Estancamiento y desequilibrios musculares |
| **4 · Avanzado** | 2+ años entrenando. Maneja RPE/RIR, tiene objetivos definidos | Poco: aquí la app asiste, no enseña | Da **control y datos**: permite sobrescribir al motor, ver tendencias finas, ajustar variables manualmente | Que la app se sienta "para principiantes" y la abandone por falta de control |
| **5 · Muy avanzado** | Competidor o cercano a competir. Objetivos muy específicos (fuerza máxima, preparación, físico) | Nada que una app genérica pueda enseñarle | Herramienta de registro y análisis de precisión, no de prescripción | **Es el peor segmento para el MVP** (ver nota abajo) |

> **Nota como asesor — no persigas el nivel 5 en el MVP.** Es tentador porque es el usuario más "serio", pero es un mercado muy pequeño, ya tiene entrenador o su propia hoja de cálculo, y exigiría funcionalidad costosa (periodización por bloques, %1RM, picos de competición, gestión de fatiga avanzada) que no sirve al 95% restante. Lo mantenemos como **nivel soportado** en el modelo de datos (para que la app no se le rompa y pueda usarla como registro), pero **no diseñamos para él** ni lo usamos como referencia de producto.
>
> **El nivel de mayor valor y mayor diferenciación es el 1.** Casi ninguna app lo resuelve bien: todas asumen que el usuario ya sabe qué es un press banca. Es el segmento con más abandono y donde una experiencia realmente guiada gana por diferencia grande.

### 3.3 El nivel es dinámico, no una etiqueta del registro

Preguntar "¿cuál es tu nivel?" en el onboarding es poco fiable: el principiante se sobreestima y el intermedio se subestima. Nuestra decisión:

- El usuario **declara** un punto de partida en el onboarding, con lenguaje concreto en lugar de etiquetas abstractas (*"¿Sabes hacer una sentadilla con barra?"* en vez de *"¿Eres intermedio?"*).
- El sistema **recalibra el nivel de forma continua** a partir del comportamiento real: sesiones completadas, progresión de carga, RPE reportado, constancia y dominio de ejercicios.
- El nivel puede **subir o bajar** (alguien que vuelve tras 6 meses parado no es el mismo de antes).

Esto es en sí mismo una funcionalidad diferenciadora (ver #11 en la tabla de funcionalidades).

### 3.4 El contexto se elige por sesión, no por perfil

- El perfil guarda **mis lugares**: p. ej. `Gimnasio` (equipo completo), `Casa` (mancuernas + banda), `Viaje` (sin equipo).
- Al iniciar un entrenamiento, una sola pregunta de un toque: **¿dónde entrenas hoy?** — y el plan se recompone al instante con los ejercicios disponibles en ese contexto.
- El plan semanal y la progresión **no se rompen**: un entrenamiento de piernas en casa sigue contando para el volumen de piernas de la semana. Cambia el *cómo*, no el *qué* ni el progreso.

## 4. Competidores principales

| App | Fortaleza | Lo que falla |
|---|---|---|
| **Strong / Hevy** | Registro de series excelente, UX rápida y limpia | Rutinas estáticas, cero adaptación real, cero IA |
| **Fitbod** | Generación algorítmica por recuperación muscular | Onboarding pesado desde el día 1, poco soporte real para "sin equipo", el chat/IA es marketing más que sustancia |
| **Freeletics** | Marca "AI coach", fuerte en bodyweight | La IA es en gran parte basada en reglas, débil en gimnasio/pesas libres, poca transparencia sobre el "por qué" |
| **Nike Training Club** | Contenido gratuito de calidad, producción premium | Cero personalización real, cero seguimiento de progreso profundo |
| **Centr / Future / Caliber** | Experiencia premium, coach humano o cuasi-humano | Caro, no escalable, la "IA" es soporte, no el motor |
| **Jefit** | Librería de ejercicios enorme | UX anticuada, curva de aprendizaje alta para principiantes |

## 5. Qué tienen en común (patrones ya "commodity")

- Librería de ejercicios con imagen/video y registro de series-repeticiones-peso.
- Calendario de entrenamientos y estadísticas básicas (volumen, PRs).
- Rachas, insignias y gamificación superficial.
- Un "asistente IA" que en la práctica es un generador de rutina inicial, no un copiloto continuo.
- Onboarding largo y estático que no vuelve a usarse después del día 1.

Esto ya no diferencia: es la base mínima esperada por el usuario (categoría **esencial**, no **innovadora**).

## 6. Oportunidades no resueltas

1. **Renegociación en tiempo real del entrenamiento** ("hoy solo tengo 20 min", "no tengo mancuernas") — casi ninguna app lo resuelve sin que el usuario edite todo manualmente.
2. **Transparencia del ajuste**: nadie explica al usuario *por qué* bajó el peso o cambió el ejercicio, lo que genera desconfianza.
3. **Continuidad entre contextos** (mismo usuario entrena a veces en gym, a veces en casa) sin duplicar perfiles o apps.
4. **Motivación con contexto real** en lugar de frases genéricas.
5. **Percepción de esfuerzo y recuperación autorreportada** integradas al algoritmo (común en apps de atletas de alto rendimiento, ausente en apps de consumo masivo).
6. **Onboarding progresivo real**: casi todas piden todo de una vez o piden muy poco y generan rutinas genéricas.

## 7. Funcionalidades diferenciadoras propuestas

| # | Funcionalidad | Clasificación | Problema del usuario que resuelve |
|---|---|---|---|
| 1 | Generador adaptativo de rutinas (objetivo, tiempo, equipo, recuperación) | **Esencial** | Base sin la cual no hay producto competitivo |
| 2 | Registro rápido de series/entrenamiento con temporizador | **Esencial** | Núcleo de uso diario |
| 3 | Renegociación conversacional del entrenamiento en curso ("solo 20 min", "sin pesas", "cambia esto") | **Diferenciadora** | Elimina la fricción entre plan y realidad, causa #1 de abandono |
| 4 | Sustitución inteligente de ejercicios por restricción (equipo/lesión/preferencia) | **Diferenciadora** | Evita que una limitación puntual rompa la constancia |
| 5 | Explicabilidad del ajuste ("bajamos el peso porque tu RPE subió 2 semanas seguidas") | **Innovadora** | Genera confianza en un sistema que de otro modo parece caja negra |
| 6 | Motivación contextual basada en datos reales del usuario | **Innovadora** | Sustituye frases genéricas por refuerzo creíble y específico |
| 7 | Onboarding progresivo (mínimo viable al inicio, se enriquece con el uso) | **Diferenciadora** | Reduce fricción de registro sin sacrificar personalización |
| 8 | Detección de estancamiento / exceso de volumen por grupo muscular | **Diferenciadora** | Resuelve el "ya no progreso y no sé por qué" |
| 9 | Memoria conversacional persistente del entrenador IA (recuerda semanas de contexto) | **Innovadora** | Evita repetir contexto cada vez, sensación de "me conoce" |
| 10 | IA visual por cámara (conteo de reps, forma) | **Experimental / Futura** | Feedback de ejecución sin trainer presencial — alto riesgo técnico y de precisión, no debe bloquear el MVP |
| 11 | Recalibración automática y continua del nivel del usuario | **Innovadora** | El usuario no sabe autoclasificarse; el sistema lo deduce del comportamiento real y ajusta la exigencia sin que tenga que pedirlo |
| 12 | Continuidad de plan entre contextos (gimnasio ↔ casa ↔ sin equipo) sin perder progresión | **Diferenciadora** | La misma persona entrena en lugares distintos; hoy las apps la obligan a duplicar planes o a improvisar |
| 13 | Modo guía para principiante absoluto (enseña el vocabulario y la técnica antes de exigir carga) | **Diferenciadora** | Nadie sirve bien al que empieza de cero: es el segmento con más abandono del mercado |

**Recomendación como asesor:** la #10 (IA visual) es la más citada como "innovación fitness" en el mercado, pero es también la más sobrevalorada hoy: requiere visión por computador robusta, funciona mal con cámaras de teléfono en ángulos reales de gimnasio, y un mal conteo de reps daña más la confianza de lo que ayuda. La dejamos en el roadmap **futuro**, no en el MVP ni en v2.

## 8. Propuesta de valor principal

> **"El único entrenador que se adapta a tu día, no al revés."**
> Genera tu plan, entiende cuando la realidad cambia, y ajusta el entrenamiento contigo — con criterio explicado, no con reglas rígidas ni una IA de vitrina.

## 9. Tres enfoques posibles de producto

**A) AI Coach-first (conversacional puro)**
El chat es la interfaz principal; el usuario "habla" con su entrenador y la app genera todo sobre la marcha.
- Riesgo alto: UX conversacional pura es más lenta que una UI estructurada para el uso diario (registrar series en el gimnasio), y depende 100% de que el LLM entienda bien el contexto — cualquier error de interpretación rompe la confianza.

**B) Motor adaptativo + asistente conversacional embebido (híbrido)**
App estructurada clásica (dashboard, entrenamiento, librería, progreso) con un motor de generación/adaptación de rutinas como núcleo, y el chat como *capa de control* para renegociar en momentos puntuales (no como interfaz permanente).
- Balance entre velocidad de uso real (loguear series rápido) y la diferenciación conversacional que sí aporta valor.

**C) Constancia/hábito-first (para principiante absoluto)**
Prioriza gamificación, simplicidad extrema y motivación por encima de periodización avanzada; la IA se usa sobre todo para simplificar decisiones, no para optimizar rendimiento.
- Mercado grande (principiantes) pero menor defensibilidad técnica: es más un producto de diseño/comportamiento que de IA real, y compite directo con apps ya fuertes en ese nicho (apps de hábitos genéricas).

## 10. Recomendación para el MVP

**Enfoque B (motor adaptativo + asistente conversacional embebido).**

Justificación:
- Nos permite lanzar un producto **usable y probado en patrones que ya funcionan** (registro rápido, dashboard, librería) sin apostar todo el MVP a que una interfaz 100% conversacional sea aceptada por el usuario promedio.
- La verdadera diferenciación (renegociación en lenguaje natural, sustitución inteligente, explicabilidad) se implementa como **features dentro del flujo estructurado**, no como un cambio de paradigma de interfaz — esto reduce el riesgo técnico y de adopción.
- Es más barato de construir y validar primero: un motor de reglas + LLM acotado a comandos concretos ("tengo X minutos", "sin equipo Y", "cambia este ejercicio") es mucho más controlable en costo y precisión que un chat abierto de propósito general.
- Dejamos explícitamente fuera del MVP: IA visual, integraciones con wearables/salud, funciones sociales/comunidad y nutrición — todas quedan en el roadmap de v2/futuro, con la arquitectura preparada para incorporarlas (ver reglas de escalabilidad futura del proyecto).

---

### Próximo paso (Fase 2-3 cubiertas; siguiente es Fase 6-7)

Decisión tomada sobre el modelo de usuario: **5 niveles + contexto por sesión + disponibilidad variable**, con foco de diseño en los niveles 1-3 y soporte (sin diseño dedicado) para 4-5.

Lo siguiente es la **definición de funcionalidades y el corte MVP / v2 / futuro** (Fase 6-7): qué entra en la primera versión publicable, qué se deja preparado en la arquitectura y qué se descarta por ahora.
