# Plan de Rediseño UI/UX — Shrutibox Digital

> **Estado:** 📋 Propuesta para revisión (no ejecutado todavía)
> **Fecha:** 2026-05-29
> **Autor del plan:** Shrutibox Global Agent
> **Rama:** `feature/new-design-claude`

---

## 1. Decisiones de diseño (definidas con el usuario)

| Eje | Decisión |
|-----|----------|
| **Dirección estética** | **Híbrido** — chrome/UI/pantallas modernos y limpios, conservando las **lengüetas realistas** como pieza de identidad central ("héroe"). |
| **Alcance** | **Solo estética** — colores, tipografía, espaciados, sombras, animaciones y microinteracciones. **No** se cambia el layout, la disposición de elementos ni la lógica. **No** se toca el motor de audio. |
| **Temas** | **Renovar** `dark-wood` y `light-wood` + **agregar 1-2 skins nuevos**. |

### Principios rectores
1. **No romper la arquitectura de 3 capas** (UI / estado / audio). Todo el trabajo vive en `src/components`, `App.jsx`, `src/index.css` y `src/skins`.
2. **Tokens primero.** Cualquier color/sombra nuevo se define como token `--sb-*` en los skins, nunca hardcodeado en componentes. Esto garantiza que los temas sigan funcionando.
3. **Conservar accesibilidad.** Mantener (o mejorar) los ratios de contraste WCAG AA ya documentados en los skins, los `aria-*`, `focus-visible` y `prefers-reduced-motion`.
4. **Mobile-first.** El layout responsive actual se respeta; solo se pule la estética.
5. **Las lengüetas son sagradas.** Su realismo se mantiene y se refina sutilmente; no se "aplana".

---

## 2. Diagnóstico del estado actual

**Fortalezas a preservar:**
- Sistema de skins por tokens (`src/skins/*` → CSS custom properties → `@theme` de Tailwind v4). Muy bien hecho.
- Panel skeuomórfico de madera + lengüetas de marfil (`.shrutibox-*` en `index.css`).
- Layout unificado mobile-first en `NoteGrid.jsx`.

**Oportunidades de mejora estética (sin tocar layout):**
- **Chrome/UI plano:** los mangos laterales, la barra de instrumento (`Controls.jsx`), los selectores de skin/idioma y los chips del metrónomo usan estilos relativamente planos que pueden sentirse "de Cursor por defecto". Se pueden elevar con jerarquía, profundidad sutil y mejor sistema de superficies.
- **StartScreen:** funcional pero genérica; es la primera impresión y puede tener mucho más carácter.
- **Sistema tipográfico:** hoy se usa la fuente del sistema. Una fuente display para títulos/visor le daría personalidad sin costo de layout.
- **Paletas:** sólidas pero pueden ganar riqueza (tonos intermedios, mejor "glow" del acento, superficies con más matiz).
- **Microinteracciones:** existen (scale en active, pulse del beat) pero pueden unificarse y refinarse con curvas de easing consistentes.

---

## 3. Sistema de diseño propuesto (capa de tokens)

Se **amplía** el contrato de tokens `--sb-*` (sin quitar ninguno existente) para soportar la dirección híbrida. Nuevos tokens propuestos:

```
/* Superficies (sistema de elevación para chrome moderno) */
--sb-surface-1        /* panel base de chrome/controles */
--sb-surface-2        /* superficie elevada (cards, popovers) */
--sb-surface-border   /* borde sutil unificado de superficies */
--sb-surface-glow     /* halo/realce de superficie elevada */

/* Realce del acento (glow consistente) */
--sb-accent-glow      /* color del halo del acento para estados activos */

/* Radios y sombras como tokens (consistencia) */
--sb-radius-sm / --sb-radius-md / --sb-radius-lg
--sb-shadow-soft / --sb-shadow-elevated
```

> Estos se mapean en `index.css` (`@theme` y/o clases utilitarias) y se definen por skin. Si algún skin no los define, se aplican fallbacks sensatos para no romper nada.

### Tipografía
- Agregar **una fuente display** (p. ej. una serif/semi-serif cálida o una grotesca de carácter) para: título de la app, visor de notas grande y BPM. Texto de UI sigue en system-ui para legibilidad.
- Se carga vía `@import`/`<link>` o self-hosted en `index.css`; sin dependencias nuevas de npm.
- **Pregunta abierta** para vos (ver §7): elegir la fuente.

---

## 4. Cambios por archivo

Cada cambio incluye **qué** y **por qué**. Todo es estética; cero cambios de lógica.

### 4.1 `src/index.css`
- Definir nuevos tokens de superficie/sombra/radio en `@theme`.
- Refinar `.shrutibox-body` (textura de madera) con un gradiente de luz más creíble y borde superior más fino.
- Refinar `.shrutibox-reed` / `.shrutibox-reed-open`: sombras y highlights ligeramente más ricos, easing de apertura unificado. (Sutil; sin cambiar la forma ni el movimiento.)
- Introducir clases utilitarias modernas reutilizables: `.sb-surface`, `.sb-surface-raised`, `.sb-control` (para unificar el look de chrome/controles).
- Unificar curvas de easing y duraciones de transición en variables.
- Importar la fuente display y asignarla a una clase `.sb-display-font`.

### 4.2 `src/skins/darkWood.js` y `src/skins/lightWood.js`
- Repulir paletas: agregar los nuevos tokens de superficie/glow/sombra.
- Ajuste fino de matices para más riqueza visual, **verificando contraste WCAG AA** (mantener los ratios documentados en los headers de cada skin).

### 4.3 Skins nuevos (1-2) en `src/skins/`
- Crear archivo(s) nuevo(s) siguiendo el mismo contrato (ej. un tema más vibrante/contemporáneo cálido). Registrarlos en `src/skins/index.js`.
- **Pregunta abierta** (ver §7): cuántos y con qué concepto.

> **Nota sobre `SkinSelector.jsx`:** hoy es un **toggle** sol/luna que alterna entre exactamente 2 skins (`toggleSkin`). Si agregamos un 3.º/4.º skin, el toggle binario se queda corto. Como acordamos "solo estética, sin layout", la opción por defecto es: mantener el toggle y que cicle entre todos los skins (cambio mínimo, no es reestructuración de layout). Si preferís un selector visual de paletas, eso sería un cambio de componente más grande — lo marco como pregunta abierta en §7.

### 4.4 `src/App.jsx` — `StartScreen` y shell
- **StartScreen:** rediseño visual de la pantalla de inicio (primera impresión): mejor jerarquía del título con la fuente display, un realce/halo cálido detrás del botón principal, botón CTA más pulido, tratamiento del estado loading/error más prolijo. Mismo contenido y misma lógica de `handleStart`/`unlockAudio`.
- **Shell de la app:** pulir el header (botón "volver" + selectores) y el footer con el nuevo sistema de superficies.

### 4.5 `src/components/Controls.jsx`
- Repulir la barra de selección de instrumento con el nuevo sistema de superficies/segmented-control (look moderno tipo "segmented control"). Mismo comportamiento.

### 4.6 `src/components/MetronomePanel.jsx` + clases `.metronome-*` en `index.css`
- Refinar los chips de control y los "pips" de beat (LEDs): glow del beat activo más consistente con el token de acento, bordes/superficies alineados al nuevo sistema. Mismo layout de 2 filas.

### 4.7 `src/components/SkinSelector.jsx` y `LanguageSelector.jsx`
- Alinear ambos al nuevo sistema de superficies/controles para que se sientan parte del mismo lenguaje visual. (Si se decide selector visual de skins, se aborda acá — ver §7.)

### 4.8 `NoteGrid.jsx` y `NoteButton.jsx`
- **Solo clases/estética**, sin tocar estructura: mangos laterales con el nuevo look de superficie, separadores y badges del visor más prolijos, etiquetas didácticas más legibles. Las lengüetas conservan su realismo (refinado en `index.css`).

---

## 5. Proceso de ejecución y validación

1. **Token system** (index.css + skins) → base de todo.
2. **Componentes** uno por uno, de mayor a menor impacto: StartScreen → NoteGrid/mangos → Controls → Metrónomo → selectores.
3. **Skins nuevos** + registro.
4. **Validación visual:** levantar la app con el dev server (`run`) y revisar en ambos/los skins y en breakpoints mobile/desktop. Capturas antes/después.
5. **Accesibilidad:** verificar contraste de las paletas y que `focus-visible` / `prefers-reduced-motion` sigan vivos.
6. **Lint:** `npm run lint` debe pasar.

---

## 6. Documentación de cambios (entregable)

Durante la ejecución mantengo un segundo archivo, **`docs/ui-redesign-changelog.md`**, con el detalle de todo lo cambiado (archivo, qué, por qué, antes/después). Eso cubre tu pedido de "dejar plasmado en un archivo de documentación todos los cambios que hice".

---

## 7. Preguntas abiertas (definir antes o durante la ejecución)

1. **Fuente display:** ¿tenés preferencia (serif cálida elegante, grotesca moderna, algo con sabor "indostánico"), o elijo y muestro 2-3 opciones?
2. **Skins nuevos:** ¿1 o 2? ¿Algún concepto/color en mente (p. ej. "teca nocturna", "latón/dorado", "índigo especiado") o propongo yo?
3. **Selector de skins:** ¿OK mantener el toggle que cicla entre todos los skins (mínimo), o querés un selector visual de paletas (cambio de componente algo mayor, pero sigue siendo solo UI)?
4. **Capturas:** ¿querés que levante el dev server y te muestre capturas antes/después a medida que avanzo?

---

## 8. Qué NO se toca (garantías)

- ❌ Motor de audio (`src/audio/*`), stores (`src/store/*`), i18n, hooks, feature flags.
- ❌ Lógica de componentes (handlers, estado, props).
- ❌ Layout/disposición de elementos y flujo de navegación.
- ✅ Solo: tokens de skin, CSS, y clases de estilo en el markup.
