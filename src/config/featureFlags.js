/**
 * @fileoverview Feature flags para habilitar/deshabilitar funcionalidades.
 *
 * Permite activar o desactivar secciones de la UI y comportamientos
 * sin modificar el codigo de los componentes.
 *
 * Flags disponibles:
 * - ENABLE_KEYBOARD          — teclado fisico
 * - ENABLE_SPEED_CONTROL     — slider de velocidad (oculto por defecto)
 * - ENABLE_MOBILE_LAYOUT     — layout optimizado para moviles
 * - ENABLE_INSTRUMENT_SELECTOR — selector de instrumento en Controls
 * - SHOW_VERSION             — muestra la version del release en el footer
 */

/** @type {Record<string, boolean>} */
export const FEATURE_FLAGS = {
  /** Habilita el control del instrumento mediante teclado fisico. */
  ENABLE_KEYBOARD: true,

  /** Muestra el control deslizante de velocidad (attack/release). */
  ENABLE_SPEED_CONTROL: false,

  /** Habilita el layout optimizado para dispositivos moviles. */
  ENABLE_MOBILE_LAYOUT: true,

  /** Muestra el selector de instrumento en el panel de controles. */
  ENABLE_INSTRUMENT_SELECTOR: true,

  /** Muestra la version del release en el footer (placeholder hasta el primer release). */
  SHOW_VERSION: false,
};
