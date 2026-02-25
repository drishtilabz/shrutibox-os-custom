/**
 * @fileoverview Hook de teclado para el Shrutibox.
 *
 * Mapea teclas fisicas a las 13 notas cromaticas, estilo piano:
 * - Fila inferior (shuddh): A=Sa, S=Re, D=Ga, F=Ma, G=Pa, H=Dha, J=Ni, K=Sa↑
 * - Fila superior (komal/tivra): W=Re♭, E=Ga♭, T=Ma#, Y=Dha♭, U=Ni♭
 * - Espacio = Play/Stop
 */

import { useEffect, useRef } from 'react';
import useShrutiStore from '../store/useShrutiStore';
import { KEYBOARD_MAP } from '../audio/noteMap';
import { FEATURE_FLAGS } from '../config/featureFlags';

export default function useKeyboard() {
  const toggleNoteRef = useRef(null);
  const togglePlayRef = useRef(null);

  useEffect(() => {
    toggleNoteRef.current = useShrutiStore.getState().toggleNote;
    togglePlayRef.current = useShrutiStore.getState().togglePlay;

    const unsubscribe = useShrutiStore.subscribe((state) => {
      toggleNoteRef.current = state.toggleNote;
      togglePlayRef.current = state.togglePlay;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!FEATURE_FLAGS.ENABLE_KEYBOARD) return;

    /** @param {KeyboardEvent} e */
    function handleKeyDown(e) {
      if (e.repeat) return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePlayRef.current?.();
        return;
      }

      const noteId = KEYBOARD_MAP[e.key.toLowerCase()];
      if (noteId) {
        toggleNoteRef.current?.(noteId);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
