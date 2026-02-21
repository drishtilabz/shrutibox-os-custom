/**
 * @fileoverview Motor de audio basado en samples pregrabados.
 *
 * Alternativa al AudioManager sintetico: reproduce samples de audio reales
 * (archivos MP3) con loop continuo para generar el drone del shrutibox.
 * Cada nota carga su propio buffer desde la ruta definida en noteMap.js.
 *
 * Usa Tone.Player con loop seamless (loopStart/loopEnd + fadeIn/fadeOut)
 * para evitar clicks en los puntos de loop. Exporta una instancia singleton
 * con la misma interfaz publica que AudioManager.
 *
 * Fase A (prototipo): samples generados por pitch-shifting desde un WAV fuente.
 * Fase B (produccion): samples grabados individualmente por nota.
 */

import * as Tone from 'tone';
import { NOTES, NOTES_BY_ID } from './noteMap';

/**
 * Valores por defecto para el loop de samples.
 * Ajustables en Fase B cuando se usen grabaciones individuales por nota.
 */
const LOOP_DEFAULTS = {
  loopStart: 1.0,
  loopEnd: 5.0,
  fadeIn: 0.08,
  fadeOut: 0.08,
};

class SampleAudioManager {
  constructor() {
    /** @type {boolean} Indica si el contexto de audio y los buffers estan listos. */
    this.initialized = false;

    /** @type {Map<string, Tone.ToneAudioBuffer>} Buffers precargados por noteId. */
    this.buffers = new Map();

    /** @type {Map<string, Tone.Player>} Players activos indexados por noteId. */
    this.activePlayers = new Map();

    /** @type {Tone.Volume} Nodo de volumen maestro conectado a la salida. */
    this.volume = new Tone.Volume(-6).toDestination();

    /** @type {number} Tiempo de fade-in en segundos (equivale al attack del synth). */
    this.fadeInTime = LOOP_DEFAULTS.fadeIn;

    /** @type {number} Tiempo de fade-out en segundos (equivale al release del synth). */
    this.fadeOutTime = LOOP_DEFAULTS.fadeOut;
  }

  /**
   * Inicia el contexto de audio y precarga todos los buffers de samples.
   * Debe llamarse tras una interaccion del usuario (requisito del navegador).
   * @returns {Promise<void>} Se resuelve cuando todos los buffers estan cargados.
   */
  async init() {
    if (this.initialized) return;
    await Tone.start();

    const loadPromises = NOTES.map(
      (note) =>
        new Promise((resolve, reject) => {
          const buffer = new Tone.ToneAudioBuffer(
            note.file,
            () => {
              this.buffers.set(note.id, buffer);
              resolve();
            },
            reject
          );
        })
    );

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  /**
   * Inicia la reproduccion de una nota individual con loop continuo.
   * Si la nota ya esta sonando, la detiene y reinicia.
   * @param {string} noteId - Identificador de la nota (ej: 'sa_3')
   */
  playNote(noteId) {
    if (!this.initialized) return;

    const buffer = this.buffers.get(noteId);
    if (!buffer) return;

    if (this.activePlayers.has(noteId)) {
      this._stopPlayer(noteId);
    }

    const player = new Tone.Player({
      url: buffer,
      loop: true,
      loopStart: LOOP_DEFAULTS.loopStart,
      loopEnd: Math.min(LOOP_DEFAULTS.loopEnd, buffer.duration - 0.1),
      fadeIn: this.fadeInTime,
      fadeOut: this.fadeOutTime,
    }).connect(this.volume);

    player.start();
    this.activePlayers.set(noteId, player);
  }

  /**
   * Detiene la reproduccion de una nota individual.
   * @param {string} noteId - Identificador de la nota
   */
  stopNote(noteId) {
    if (!this.initialized) return;
    this._stopPlayer(noteId);
  }

  /**
   * Inicia la reproduccion de multiples notas simultaneamente.
   * @param {string[]} noteIds - Array de identificadores de notas
   */
  playNotes(noteIds) {
    for (const noteId of noteIds) {
      this.playNote(noteId);
    }
  }

  /**
   * Detiene y libera todos los players activos.
   */
  stopAll() {
    for (const noteId of [...this.activePlayers.keys()]) {
      this._stopPlayer(noteId);
    }
  }

  /**
   * Detiene un player, programa su dispose tras el fade-out, y lo elimina del Map.
   * @param {string} noteId - Identificador de la nota
   * @private
   */
  _stopPlayer(noteId) {
    const player = this.activePlayers.get(noteId);
    if (!player) return;

    player.stop();
    setTimeout(() => player.dispose(), (this.fadeOutTime + 0.5) * 1000);
    this.activePlayers.delete(noteId);
  }

  /**
   * Ajusta el volumen maestro.
   * @param {number} value - Valor entre 0 (silencio) y 1 (maximo)
   */
  setVolume(value) {
    const db = value === 0 ? -Infinity : Tone.gainToDb(value);
    this.volume.volume.value = db;
  }

  /**
   * Ajusta la velocidad de ataque/release modificando fadeIn y fadeOut.
   * Funciona como equivalente del setSpeed del AudioManager sintetico.
   * @param {number} speed - Multiplicador de velocidad (ej: 0.5 = lento, 2 = rapido)
   */
  setSpeed(speed) {
    this.fadeInTime = LOOP_DEFAULTS.fadeIn / speed;
    this.fadeOutTime = LOOP_DEFAULTS.fadeOut / speed;
  }

  /**
   * Libera todos los recursos de audio: detiene players, limpia buffers
   * y desconecta el nodo de volumen.
   */
  dispose() {
    this.stopAll();
    this.activePlayers.clear();
    for (const buffer of this.buffers.values()) {
      buffer.dispose();
    }
    this.buffers.clear();
    this.volume.dispose();
    this.initialized = false;
  }
}

/** Instancia singleton del motor de audio basado en samples. */
const sampleAudioManager = new SampleAudioManager();
export default sampleAudioManager;
