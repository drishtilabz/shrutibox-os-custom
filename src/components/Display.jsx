/**
 * @fileoverview [DEPRECADO — v2 UI] Display informativo del Shrutibox.
 *
 * A partir del rediseño UI v2 (layout unificado mobile-first), la lógica
 * y el markup de este componente fueron inlinados dentro de NoteGrid.jsx,
 * en la sección "Visor de notas" del panel principal.
 *
 * Este archivo se conserva únicamente como referencia histórica.
 * No se importa ni se usa en ningún punto de la aplicación.
 *
 * Funcionalidad migrada a: src/components/NoteGrid.jsx
 */

/*
 * Lógica original:
 *   - Muestra hasta 3 notas activas (nombre Sargam con variante ♭/♯)
 *   - Badge animado "Sonando" cuando playing === true
 *   - Contador de notas activas debajo del visor
 *
 * Toda esta lógica vive ahora en el bloque "Visor de notas" de NoteGrid.jsx,
 * integrada visualmente dentro del panel .shrutibox-body sin contenedor propio.
 */
