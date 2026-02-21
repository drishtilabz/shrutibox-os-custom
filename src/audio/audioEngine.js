/**
 * @fileoverview Proxy mutable del motor de audio del Shrutibox Digital.
 *
 * Envuelve el motor de audio activo y delega todas las llamadas a el.
 * Permite cambiar el backend en runtime via setEngine(), lo que habilita
 * el cambio de instrumento desde la UI sin reiniciar la aplicacion.
 *
 * Todos los consumidores (store, componentes) importan este modulo y usan
 * su interfaz publica sin conocer cual motor esta activo internamente.
 *
 * API exportada: setEngine(), init(), playNote(), stopNote(), playNotes(),
 *                stopAll(), setVolume(), setSpeed(), dispose()
 */

import audioManager from './AudioManager';

class AudioEngineProxy {
  /**
   * @param {object} defaultEngine - Motor de audio inicial (debe implementar la interfaz estandar)
   */
  constructor(defaultEngine) {
    /** @type {object} Motor de audio activo al que se delegan las llamadas. */
    this._engine = defaultEngine;
  }

  /**
   * Cambia el motor de audio activo.
   * El nuevo motor debe estar inicializado antes de llamar a este metodo.
   * @param {object} engine - Nuevo motor de audio
   */
  setEngine(engine) {
    this._engine = engine;
  }

  async init() {
    return this._engine.init();
  }

  playNote(noteId) {
    this._engine.playNote(noteId);
  }

  stopNote(noteId) {
    this._engine.stopNote(noteId);
  }

  playNotes(noteIds) {
    this._engine.playNotes(noteIds);
  }

  stopAll() {
    this._engine.stopAll();
  }

  setVolume(value) {
    this._engine.setVolume(value);
  }

  setSpeed(speed) {
    this._engine.setSpeed(speed);
  }

  dispose() {
    this._engine.dispose();
  }
}

/** Instancia singleton del proxy de audio, inicializado con el motor de sintesis. */
const audioEngine = new AudioEngineProxy(audioManager);
export default audioEngine;
