/**
 * @fileoverview Store global del Shrutibox Digital (Zustand).
 *
 * Gestiona el estado completo de la aplicacion:
 * - Inicializacion y modo seleccionado (1 o 3 octavas)
 * - Instrumento activo (seleccion de motor de audio)
 * - Notas seleccionadas (toggle on/off)
 * - Estado de reproduccion (playing/stopped)
 * - Controles de audio (volumen, octava activa, velocidad)
 *
 * Flujo principal:
 * 1. Usuario selecciona notas con toggleNote() (sin sonido aun)
 * 2. Usuario activa reproduccion con togglePlay()
 * 3. Todas las notas seleccionadas comienzan a sonar
 * 4. Mientras suena, se pueden agregar/quitar notas en tiempo real
 * 5. togglePlay() de nuevo detiene el sonido (notas quedan seleccionadas)
 */

import { create } from 'zustand';
import audioEngine from '../audio/audioEngine';
import { INSTRUMENTS_BY_ID, DEFAULT_INSTRUMENT_ID } from '../audio/instruments';

const useShrutiStore = create((set, get) => ({
  /** @type {boolean} true una vez que el audio esta inicializado. */
  initialized: false,

  /** @type {'1oct'|'3oct'|null} Modo de octavas seleccionado. */
  mode: null,

  /** @type {string} ID del instrumento activo. */
  instrumentId: DEFAULT_INSTRUMENT_ID,

  /** @type {string[]} IDs de notas seleccionadas (toggled on). */
  selectedNotes: [],

  /** @type {boolean} true si el drone esta reproduciendose. */
  playing: false,

  /** @type {number} Volumen maestro entre 0 y 1. */
  volume: 0.7,

  /** @type {number} Octava activa para el teclado fisico (3, 4 o 5). */
  octave: 3,

  /** @type {number} Multiplicador de velocidad del envelope. */
  speed: 1.0,

  /**
   * Inicializa el motor de audio del instrumento activo y establece el modo.
   * @param {'1oct'|'3oct'} mode - Modo seleccionado por el usuario
   */
  init: async (mode) => {
    const { instrumentId, volume } = get();
    const instrument = INSTRUMENTS_BY_ID[instrumentId];
    await instrument.engine.init();
    audioEngine.setEngine(instrument.engine);
    audioEngine.setVolume(volume);
    set({ initialized: true, mode });
  },

  /**
   * Cambia el instrumento activo en runtime.
   * Si el drone esta sonando, detiene el motor anterior, inicializa el nuevo,
   * restaura los ajustes de audio y re-reproduce las notas seleccionadas.
   * @param {string} instrumentId - ID del instrumento destino
   */
  setInstrument: async (instrumentId) => {
    const { playing, selectedNotes, volume, speed } = get();
    const instrument = INSTRUMENTS_BY_ID[instrumentId];
    if (!instrument) return;

    if (playing) {
      audioEngine.stopAll();
    }

    await instrument.engine.init();
    audioEngine.setEngine(instrument.engine);
    audioEngine.setVolume(volume);
    audioEngine.setSpeed(speed);

    if (playing && selectedNotes.length > 0) {
      audioEngine.playNotes(selectedNotes);
    }

    set({ instrumentId });
  },

  /**
   * Alterna la seleccion de una nota (toggle on/off).
   * Si el drone esta activo (playing=true), tambien inicia o detiene
   * el sonido de esa nota en tiempo real.
   * @param {string} noteId - ID de la nota (ej: 'sa_3')
   */
  toggleNote: (noteId) => {
    const { selectedNotes, playing } = get();
    const isSelected = selectedNotes.includes(noteId);

    if (isSelected) {
      if (playing) {
        audioEngine.stopNote(noteId);
      }
      set({ selectedNotes: selectedNotes.filter((id) => id !== noteId) });
    } else {
      if (playing) {
        audioEngine.playNote(noteId);
      }
      set({ selectedNotes: [...selectedNotes, noteId] });
    }
  },

  /**
   * Alterna la reproduccion del drone (play/stop).
   * - Play: reproduce todas las notas seleccionadas simultaneamente.
   * - Stop: detiene todo el audio; las notas quedan seleccionadas.
   */
  togglePlay: () => {
    const { playing, selectedNotes } = get();

    if (playing) {
      audioEngine.stopAll();
      set({ playing: false });
    } else {
      if (selectedNotes.length > 0) {
        audioEngine.playNotes(selectedNotes);
      }
      set({ playing: true });
    }
  },

  /**
   * Ajusta el volumen maestro.
   * @param {number} value - Valor entre 0 y 1
   */
  setVolume: (value) => {
    audioEngine.setVolume(value);
    set({ volume: value });
  },

  /**
   * Cambia la octava activa para el teclado fisico.
   * @param {number} octave - Numero de octava (3, 4 o 5)
   */
  setOctave: (octave) => set({ octave }),

  /**
   * Ajusta la velocidad del envelope (attack/release).
   * @param {number} speed - Multiplicador (0.25 a 3)
   */
  setSpeed: (speed) => {
    audioEngine.setSpeed(speed);
    set({ speed });
  },

  /**
   * Detiene el audio y vuelve al menu de seleccion de modo.
   */
  reset: () => {
    const { playing } = get();
    if (playing) {
      audioEngine.stopAll();
    }
    set({
      initialized: false,
      mode: null,
      instrumentId: DEFAULT_INSTRUMENT_ID,
      selectedNotes: [],
      playing: false,
      octave: 3,
      speed: 1.0,
    });
  },
}));

export default useShrutiStore;
