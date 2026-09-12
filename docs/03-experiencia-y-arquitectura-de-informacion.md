# Fase 8-9 · Diseño de experiencia y arquitectura de información

> Continúa `02-funcionalidades-y-alcance-mvp.md`. Aquí se diseña **cómo se usa** el producto, antes de cualquier wireframe o decisión técnica. Sin pantallas dibujadas todavía: primero los flujos y la estructura.

---

## 1. Principios de experiencia

Cinco reglas que resuelven empates de diseño más adelante. Cuando dos opciones parezcan igual de buenas, gana la que respete estas reglas.

1. **El usuario nunca decide qué entrenar.** Si tiene que elegir, fallamos. La app propone; él puede cambiar, pero nunca partir de una pantalla en blanco.
2. **Cada pantalla tiene una acción principal obvia.** Si hay dos cosas igual de importantes, una de las dos no lo es.
3. **Menos pantalla, más entrenamiento.** Nada que alargue el tiempo dentro de la app se considera una mejora.
4. **La app nunca culpa.** Ni con texto, ni con color, ni con números en rojo, ni con rachas rotas.
5. **Se usa de pie, con una mano, sudando y con mala señal.** Ese es el entorno real, no un escritorio.

---

## 2. Arquitectura de información

### 2.1 Navegación principal: 4 pestañas

```
┌──────────┬──────────┬──────────┬──────────┐
│  Inicio  │   Plan   │ Progreso │  Perfil  │
└──────────┴──────────┴──────────┴──────────┘
```

| Pestaña | Su única pregunta |
|---|---|
| **Inicio** | *¿Qué hago hoy?* |
| **Plan** | *¿Qué viene esta semana?* |
| **Progreso** | *¿Estoy mejorando?* |
| **Perfil** | *¿Cómo cambio algo?* |

### 2.2 Lo que deliberadamente **no** es una pestaña

Esta es la parte importante de la decisión:

| Elemento | Dónde vive | Por qué no es pestaña |
|---|---|---|
| **Entrenar** | **Modo de pantalla completa**, lanzado desde Inicio | Durante el entrenamiento, las pestañas son ruido. El modo entrenamiento toma toda la pantalla y oculta la navegación: el usuario está entrenando, no navegando |
| **Entrenador IA** | **Capa contextual**, accesible desde Inicio y **desde dentro del entrenamiento** | Como pestaña, invita a usarlo como chatbot general — justo lo que acotamos. Como capa contextual, refuerza que es un **control del plan**, no un destino. Además, *"solo tengo 20 minutos"* y *"cambia este ejercicio"* se piden **durante** la sesión, no en una pestaña aparte |
| **Biblioteca de ejercicios** | Destino alcanzado desde el entrenamiento, la sustitución y el buscador | Navegar una biblioteca es un patrón heredado de apps para gente que arma sus propias rutinas — exactamente lo que nuestro usuario **no sabe hacer**. Es de uso poco frecuente; no merece un cuarto del espacio de navegación |

> Hipótesis a validar en beta: si **Plan** resulta poco usado, se absorbe dentro de Inicio y bajamos a 3 pestañas. No al revés: nunca añadir una quinta.

---

## 3. Flujo crítico 1 · Primer uso → primer entrenamiento

**Objetivo: menos de 5 minutos desde abrir la app hasta estar entrenando.** Es la métrica de activación (> 60%).

```
Bienvenida  →  6 preguntas  →  Plan generado  →  [Crear cuenta]  →  Entrenar
   (1)          (1 por          (ver valor)        (guardar)          (hoy)
              pantalla)
```

### Las 6 preguntas (una por pantalla, opciones grandes, sin teclado)

| # | Pregunta | Por qué esta y no otra |
|---|---|---|
| 1 | ¿Qué quieres lograr? | Define el objetivo del motor |
| 2 | ¿Qué experiencia tienes? — en lenguaje concreto: *"nunca he entrenado"* / *"he entrenado algo, sin constancia"* / *"entreno hace meses"* / *"entreno hace años"* | Fija el nivel inicial **sin** pedirle que se autoclasifique con etiquetas abstractas |
| 3 | ¿Cuántos días por semana? | Estructura del plan |
| 4 | ¿Cuánto tiempo por sesión? | Volumen por sesión |
| 5 | ¿Dónde vas a entrenar? → si incluye casa: *¿qué tienes?* | Define los contextos y el equipo disponible |
| 6 | ¿Algo que deba tener en cuenta? *(opcional, se puede saltar)* | Limitaciones declaradas por el usuario |

Todo lo demás (preferencias de ejercicios, frecuencia real, capacidad) **se aprende con el uso**, no se pregunta.

### Decisión clave: el registro va **después** del plan, no antes

La mayoría de apps pide correo y contraseña antes de entregar nada. Es el mayor punto de fuga del embudo: el usuario paga un costo antes de recibir valor.

Nuestro orden: **onboarding → plan generado y visible → "guarda tu plan" (crear cuenta)**. El usuario ya vio lo que gana; ahora el registro tiene sentido.

- Modo invitado con datos locales desde el primer segundo.
- La cuenta sincroniza y respalda; no es un peaje de entrada.
- Beneficio técnico adicional: obliga a que la app funcione bien sin sesión, que es justo lo que necesita el requisito offline.

---

## 4. Flujo crítico 2 · El entrenamiento diario

```
Inicio → [Entrenar hoy] → ¿Dónde entrenas? → MODO ENTRENAMIENTO → Resumen
                            (1 toque,
                          solo si aplica)
```

El selector de contexto aparece **solo si el usuario tiene más de un lugar configurado**, y recuerda el último usado. Para quien siempre entrena en el mismo sitio, este paso no existe.

### Modo entrenamiento (pantalla completa, sin navegación)

**Jerarquía visual, de mayor a menor:**

1. **Ejercicio actual** + demostración en bucle
2. **Serie en curso**: peso y repeticiones objetivo, grandes
3. **Botón de registrar serie** — el elemento más grande y accesible con el pulgar
4. Series ya completadas (arriba, pequeñas, como historial)
5. Descanso / siguiente ejercicio
6. Acciones secundarias (sustituir, ajustar, IA) — accesibles pero discretas

**Comportamientos no negociables:**

| Comportamiento | Razón |
|---|---|
| Pantalla siempre encendida | Nadie quiere desbloquear el teléfono entre series |
| El descanso arranca **solo** al registrar la serie | Una acción menos en el momento de más fatiga |
| Todo alcanzable con el pulgar de una mano | La otra sostiene una mancuerna |
| Funciona **sin conexión**; sincroniza después | Los sótanos de gimnasio no tienen señal. Si falla aquí, se desinstala |
| Salir nunca pierde el progreso de la sesión | Llamadas, notificaciones, la vida |

**Tres acciones disponibles en todo momento, sin salir de la sesión:**
- **Sustituir este ejercicio** → alternativas del mismo patrón de movimiento, filtradas por contexto y nivel
- **Ajustar la sesión** → *"tengo menos tiempo"*, *"me siento cansado"*
- **Preguntar** → la capa IA, con el contexto de la sesión ya cargado (no hay que explicarle nada)

### Resumen post-entrenamiento: la pantalla más importante del producto

Es el momento de mayor apertura emocional del usuario, y donde cerramos el hueco de las 8-12 semanas. **No** mostramos calorías estimadas (dato inventado que destruye credibilidad).

Mostramos avance **real y verificable**:

> *"Volumen total: 4.280 kg — 12% más que la semana pasada."*
> *"Cuarta sesión completada de 4 esta semana."*
> *"Primera vez que haces 3×10 en sentadilla."*

---

## 5. Flujo crítico 3 · El regreso tras fallar

El flujo que ninguna app diseña y que define nuestra retención.

**Disparador:** el usuario abre la app tras 7+ días de inactividad.

| ❌ Lo que hace el mercado | ✅ Lo que hacemos |
|---|---|
| *"¡Llevas 12 días sin entrenar!"* | Reconocimiento neutro, sin mención del tiempo perdido |
| Racha reseteada a 0, en rojo | La racha se marca como **pausada**, no destruida |
| El mismo plan donde lo dejó | Plan **recalibrado a la baja** automáticamente |
| Pantalla de estadísticas en caída | Foco en lo acumulado, no en lo perdido |

**La pantalla de regreso tiene una sola oferta, pequeña y ganable:**

> *"Qué bueno verte."*
> *"Preparé algo corto para retomar: 20 minutos, 4 ejercicios."*
> **[ Empezar ]**

La sesión de reentrada lleva **deliberadamente menos carga y menos volumen** que la última completada. El objetivo no es entrenar bien ese día: es **completar algo** y reiniciar el ciclo. Un regreso exitoso vale más que una sesión óptima abandonada a la mitad.

---

## 6. Estados vacíos: no son un caso extremo, son la primera impresión

**El 100% de los usuarios nuevos ve la app vacía**, y es justo donde más se abandona. Por eso los tratamos como pantallas de primera clase, no como un "por hacer" al final.

| Pantalla | Estado vacío ❌ malo | Estado vacío ✅ nuestro |
|---|---|---|
| **Progreso** (semana 1) | Gráficas en cero, "aún no hay datos" | *"Tu primer entrenamiento define tu punto de partida."* + acceso directo a entrenar |
| **Plan** (recién generado) | Calendario vacío | La semana ya poblada con las sesiones propuestas — nunca hay un calendario en blanco |
| **Historial** | "Sin entrenamientos" | Explica qué verá aquí y por qué le servirá |

**Regla:** un estado vacío nunca solo informa de una ausencia — siempre ofrece la acción que lo llena.

---

## 7. Estados de carga y errores

**Carga.** Nada de pantallas en blanco con un spinner. Dos casos distintos:
- **Generación del plan** (proceso lento y de alto valor): se muestra el progreso con contexto — *"Ajustando el volumen a 3 días por semana…"*. La espera percibida baja cuando el usuario ve que se está trabajando *para él*.
- **Todo lo demás**: contenido esqueleto (skeleton), nunca pantalla vacía.

**Errores.** Tres reglas:
1. **Nunca perder el entrenamiento del usuario.** Todo lo registrado se guarda en local primero y se sincroniza después. Una caída de red jamás borra series registradas.
2. **El error se explica en lenguaje humano y siempre ofrece una salida.** No hay callejones sin salida ni códigos técnicos.
3. **Si falla la IA, la app sigue funcionando.** El motor de rutinas es determinista y no depende del modelo conversacional. Si el asistente no responde, el usuario puede entrenar igual — la IA es una capa de control, nunca un punto único de fallo.

---

## 8. Plantilla de definición de pantalla

Cada pantalla del MVP se especificará con esta ficha antes de dibujarse (Fase 10):

```
1. Objetivo          ─ la única pregunta que responde
2. Información       ─ qué se muestra, en qué orden de prioridad
3. Acciones          ─ principal (una) + secundarias
4. Jerarquía visual  ─ qué domina la pantalla
5. Navegación        ─ de dónde se llega y a dónde se sale
6. Componentes       ─ piezas reutilizables del sistema de diseño
7. Estado vacío
8. Estado de carga
9. Errores
10. Comportamiento móvil ─ una mano, offline, interrupciones
```

### Pantallas del MVP a especificar

**Activación:** Bienvenida · Onboarding (6) · Plan generado · Crear cuenta
**Núcleo:** Inicio · Selector de contexto · Modo entrenamiento · Sustitución · Resumen post-entrenamiento
**Seguimiento:** Plan semanal · Progreso · Detalle de ejercicio · Biblioteca
**Retención:** Pantalla de regreso
**Soporte:** Entrenador IA · Perfil · Ajustes · Privacidad y datos

---

### Próximo paso (Fase 10-11)

Con los flujos definidos, siguen los **wireframes** de las pantallas críticas — en este orden de prioridad, que es el orden en que se juega la retención:

1. **Modo entrenamiento** (la pantalla de uso diario)
2. **Inicio** (la que decide si abre la app)
3. **Resumen post-entrenamiento** (la que cierra el hueco de resultados)
4. **Pantalla de regreso** (la que recupera al que falló)
5. **Onboarding** (la que activa)

Después de los wireframes viene la identidad de marca y el diseño visual (Fase 11), y solo entonces las decisiones técnicas (Fase 12-13).
