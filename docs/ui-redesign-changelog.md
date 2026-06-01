# Changelog de Rediseño UI/UX — Shrutibox Digital

> **Estado:** ✅ Ejecutado
> **Fecha:** 2026-06-01
> **Rama:** `feature/new-design-claude`
> **Plan asociado:** [`ui-redesign-plan.md`](./ui-redesign-plan.md)
> **Dirección:** Híbrido (chrome/UI moderno + lengüetas realistas) · Solo estética · 4 skins

Este documento detalla **todos** los cambios estéticos aplicados. No se tocó
el motor de audio, los stores, i18n, hooks ni la lógica/disposición de los
componentes. Todo el trabajo vive en la capa de tokens, CSS y clases de estilo.

---

## Decisiones tomadas sobre las preguntas abiertas del plan

| Pregunta | Decisión |
|----------|----------|
| Fuente display | **Fraunces** (serif cálida variable). Usada solo en título, visor de notas y BPM. |
| Skins nuevos | **2 nuevos** → "Latón Nocturno" e "Índigo Especiado" (total: 4 skins). |
| Selector de skins | Convertido de toggle sol/luna a **selector visual de paletas** (popover con swatches). Necesario con 4 temas; sigue siendo solo UI. |
| Validación | `npm run lint` (limpio en archivos tocados), `npm run build` (OK) y dev server (sirve 200). |

---

## Sistema de diseño (nuevos tokens)

Se **amplió** el contrato `--sb-*` sin quitar ninguno existente:

| Token | Rol |
|-------|-----|
| `--sb-surface-1` | Superficie base de chrome/controles. |
| `--sb-surface-2` | Superficie elevada / hover. |
| `--sb-surface-border` | Borde sutil unificado de superficies. |
| `--sb-accent-glow` | Halo cálido del acento para estados activos. |

Tokens globales (no dependientes del skin), definidos en `:root` de `index.css`:
`--sb-ease`, `--sb-ease-out`, `--sb-dur-fast`, `--sb-dur`, `--sb-radius-sm/md/lg`.

Los 4 tokens de superficie tienen **fallbacks** en `:root` (vía `color-mix`),
así que si un skin no los define, nada se rompe.

---

## Cambios por archivo

### `index.html`
- **Qué:** se agregaron `preconnect` a Google Fonts y el `<link>` de **Fraunces** (variable, opsz 9–144, pesos 400–700).
- **Por qué:** habilitar la tipografía display sin sumar dependencias npm.

### `src/index.css`
- **Tokens `@theme`:** mapeo de `--color-sb-surface-1/2/border` para habilitar utilidades `bg-sb-surface-*`, `border-sb-surface-border`.
- **`:root`:** tokens globales de easing/duración/radio + fallbacks de superficie/glow.
- **`.sb-display`:** clase de fuente Fraunces con `font-optical-sizing: auto`.
- **`.sb-surface` / `.sb-surface-raised`:** sistema de superficies (paneles, popovers) con borde sutil e iluminación interior.
- **`.sb-control` / `.sb-control--active`:** controles/botones segmentados modernos con hover, active (scale) y `focus-visible`.
- **`.sb-toggle-on` / `.sb-toggle-off`:** estilos de toggles de icono (activo "iluminado" con halo de acento / inactivo neutro).
- **`.sb-glow-accent`:** halo cálido radial detrás del CTA principal.
- **`.shrutibox-body`:** textura de madera refinada (luz superior radial + sombra exterior más rica y con profundidad).
- **`.shrutibox-reed` / `.shrutibox-reed-open`:** highlights/sombras ligeramente más ricos, easing unificado (`--sb-ease-out`) y un **glow cálido del acento** al abrir la lengüeta. Forma y movimiento intactos.
- **`.metronome-ctrl`:** alineado al sistema de superficies (`--sb-surface-*`) y easing.
- **`prefers-reduced-motion`:** se sumó `.sb-control` a la regla que anula transiciones.

### `src/skins/darkWood.js` y `src/skins/lightWood.js`
- **Qué:** se agregaron los 4 tokens de superficie/glow propios de cada tema.
- **Por qué:** que el chrome moderno tenga matices coherentes con cada paleta. Colores base intactos (se preservan los ratios WCAG AA documentados).

### `src/skins/brassNight.js` *(nuevo)*
- Skin "Latón Nocturno": base pizarra/teal nocturna, acento latón dorado, tornillos en tono latón, lengüetas marfil. Contrato de tokens completo.

### `src/skins/spicedIndigo.js` *(nuevo)*
- Skin "Índigo Especiado": base índigo/violeta profunda, acento azafrán, lengüetas marfil. Contrato de tokens completo.

### `src/skins/index.js`
- Registro de los 2 skins nuevos en el array `SKINS` (ahora 4).

### `src/components/SkinSelector.jsx`
- **Qué:** reescrito de toggle binario sol/luna a **selector visual de paletas**: botón disparador con el swatch del skin activo + popover con todas las paletas (swatch + nombre + check del activo).
- **Por qué:** un toggle no escala a 4 temas. Usa el `setSkin` ya existente del store; cierra con click-fuera y `Escape`; accesible (`aria-haspopup`, `role=menu`, `menuitemradio`, `aria-checked`).

### `src/components/LanguageSelector.jsx`
- Convertido a **control segmentado** sobre `.sb-surface` (mismo comportamiento y traducciones).

### `src/components/Controls.jsx`
- Selector de instrumento repulido como **segmented control** sobre `.sb-surface`, con pista interior y sombra de acento (`--sb-accent-glow`) en el ítem activo.

### `src/components/NoteGrid.jsx`
- Mangos laterales: `bg-sb-chrome/25 border…` → `.sb-surface` (look unificado).
- Toggles (metrónomo, Notas/didáctico, FX/chorus): clases inline → `.sb-toggle-on` / `.sb-toggle-off`.
- Visor de notas: tipografía **Fraunces** (`.sb-display`), tamaño un punto mayor.
- Sin cambios de estructura ni de lógica.

### `src/components/MetronomePanel.jsx`
- BPM en **Fraunces** (`.sb-display`), un punto mayor, `tabular-nums` conservado.

### `src/components/App.jsx` (`StartScreen` + shell)
- **StartScreen:** título en **Fraunces** más grande, divisor con tinte de acento, CTA con **halo cálido** (`.sb-glow-accent`) y sombra de acento. Lógica de `handleStart`/`unlockAudio` intacta.
- **Shell:** botón "volver" convertido en pill `.sb-control`.

---

## Verificación

- `npm run lint` → sin errores nuevos. Los 3 problemas reportados son **preexistentes** (`GrainAudioManager.js`, `AudioDebug.jsx`, `useTranslation.js`), en archivos no tocados.
- `npm run build` → **OK** (1028 módulos). El warning `"file" is not a known CSS property` es **preexistente** (Tailwind v4 escanea los marcadores `[file:1]` del doc `analysis-issue-tone-player...md`); también aparece en el árbol limpio.
- Dev server (`npm run dev`) → sirve `index.html`, componentes, `index.css` y skins con HTTP 200.

---

## Garantías (lo que NO se tocó)

- ❌ `src/audio/*`, `src/store/*`, `src/i18n/*`, `src/hooks/*`, `src/config/*`.
- ❌ Lógica de componentes (handlers, estado, props, flujo).
- ❌ Layout/disposición de elementos.
- ✅ Solo: tokens de skin, CSS y clases de estilo en el markup.

---

## Próximos pasos sugeridos (opcionales)

- Revisión visual en dispositivo real (iOS/Android) y en los 4 skins.
- Si gustan los skins nuevos, se pueden afinar matices o sumar más (el sistema de tokens lo hace trivial).
- Considerar capturas antes/después para el README.
