/**
 * @fileoverview Registro de instrumentos disponibles en el Shrutibox Digital.
 *
 * Cada instrumento asocia un identificador unico, un nombre visible en la UI,
 * y una instancia de motor de audio que implementa la interfaz estandar
 * (init, playNote, stopNote, playNotes, stopAll, setVolume, setSpeed, dispose).
 *
 * Para agregar un nuevo instrumento basta con importar su motor y anadir
 * una entrada al array INSTRUMENTS.
 */

import audioManager from './AudioManager';
import sampleAudioManager from './SampleAudioManager';

/**
 * Lista ordenada de instrumentos disponibles.
 * El orden determina como aparecen en el selector de la UI.
 * @type {Array<{id: string, name: string, engine: object}>}
 */
export const INSTRUMENTS = [
  { id: 'base-sound', name: 'Base Sound', engine: audioManager },
  { id: 'shrutibox-prototype', name: 'Shrutibox Prototype', engine: sampleAudioManager },
];

/** ID del instrumento por defecto al iniciar la aplicacion. */
export const DEFAULT_INSTRUMENT_ID = 'base-sound';

/** Diccionario de instrumentos indexado por id para busqueda O(1). */
export const INSTRUMENTS_BY_ID = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.id, i])
);
