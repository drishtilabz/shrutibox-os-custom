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
import SampleAudioManager from './SampleAudioManager';
import GrainAudioManager from './GrainAudioManager';
import RealisticGrainAudioManager from './RealisticGrainAudioManager';

/*
 * Instrumentos ocultos — listos para futuras implementacion o deprecacion.
 *
 * const baseSoundManager = audioManager;           // Base Sound (sintesis PolySynth fatsine)
 * const sampleAudioManager = new SampleAudioManager('/sounds');  // Shrutibox Prototype (samples interpolados)
 * const mksCrossfadeManager = new SampleAudioManager('/sounds-mks-xfade', {
 *   loopStart: 0,
 *   loopEnd: null,
 * });  // MKS Crossfade (samples con crossfade baked-in)
 */

const mksSampleAudioManager = new SampleAudioManager('/sounds-mks');
const mksGrainManager = new GrainAudioManager('/sounds-mks');
const mksRealisticManager = new RealisticGrainAudioManager('/sounds-mks');

/**
 * Lista ordenada de instrumentos disponibles.
 * El orden determina como aparecen en el selector de la UI.
 * @type {Array<{id: string, name: string, engine: object}>}
 */
export const INSTRUMENTS = [
  { id: 'shrutibox-mks', name: 'Shrutibox MKS', engine: mksSampleAudioManager },
  { id: 'mks-grain', name: 'MKS Grain', engine: mksGrainManager },
  { id: 'mks-realistic', name: 'Shrutibox MKS Realistic', engine: mksRealisticManager },
];

/** ID del instrumento por defecto al iniciar la aplicacion. */
export const DEFAULT_INSTRUMENT_ID = 'shrutibox-mks';

/** Diccionario de instrumentos indexado por id para busqueda O(1). */
export const INSTRUMENTS_BY_ID = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.id, i])
);
