/**
 * @fileoverview Lengüeta/switch de nota del Shrutibox.
 *
 * Simula una lengüeta metalica del frente de un shrutibox real.
 * Toggle vertical con tres estados visuales:
 * - Cerrada (no seleccionada): metalico apagado
 * - Abierta (seleccionada): desplazada, brillo
 * - Sonando (seleccionada + playing): vibracion/pulso
 *
 * Las notas komal/tivra se diferencian visualmente de las shuddh.
 */

import { useCallback } from 'react';
import useShrutiStore from '../store/useShrutiStore';
import { KEY_LABELS } from '../audio/noteMap';

export default function NoteButton({ note }) {
  const selectedNotes = useShrutiStore((s) => s.selectedNotes);
  const playing = useShrutiStore((s) => s.playing);
  const toggleNote = useShrutiStore((s) => s.toggleNote);

  const isSelected = selectedNotes.includes(note.id);
  const isSounding = isSelected && playing;
  const isAltered = note.variant === 'komal' || note.variant === 'tivra';
  const keyLabel = KEY_LABELS[note.id];

  const variantLabel =
    note.variant === 'komal' ? '♭' : note.variant === 'tivra' ? '♯' : '';

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      toggleNote(note.id);
    },
    [note.id, toggleNote],
  );

  return (
    <button
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`
        shrutibox-reed
        relative select-none touch-none flex flex-col items-center
        rounded-lg border-2 transition-all duration-200 ease-out
        cursor-pointer active:scale-95
        ${isAltered ? 'w-10 sm:w-12' : 'w-12 sm:w-14'}
        ${
          isSounding
            ? 'shrutibox-reed-sounding bg-amber-400 border-amber-300 text-amber-950 shadow-lg shadow-amber-400/40 -translate-y-2'
            : isSelected
              ? 'shrutibox-reed-open bg-amber-500/80 border-amber-400/70 text-amber-950 shadow-md shadow-amber-500/30 -translate-y-1.5'
              : isAltered
                ? 'bg-stone-700/80 border-stone-600/50 text-stone-300 hover:bg-stone-600/80 hover:border-stone-500/60'
                : 'bg-stone-600/60 border-stone-500/40 text-stone-200 hover:bg-stone-500/60 hover:border-stone-400/50'
        }
      `}
    >
      {/* Cuerpo de la lengüeta */}
      <div className="flex flex-col items-center justify-between py-2 sm:py-3 h-20 sm:h-24">
        {/* Nombre de la nota */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-sm sm:text-base font-bold">
            {note.name}
          </span>
          {variantLabel && (
            <span className={`text-xs font-medium ${
              isSounding || isSelected ? 'text-amber-800' : 'text-stone-400'
            }`}>
              {variantLabel}
            </span>
          )}
        </div>

        {/* Nota occidental */}
        <span className={`text-[9px] sm:text-[10px] ${
          isSounding
            ? 'text-amber-700'
            : isSelected
              ? 'text-amber-800/70'
              : 'text-stone-500/70'
        }`}>
          {note.western}
        </span>

        {/* Tecla de teclado */}
        {keyLabel && (
          <span className={`text-[8px] sm:text-[9px] font-mono mt-0.5 ${
            isSounding
              ? 'text-amber-600'
              : isSelected
                ? 'text-amber-700/60'
                : 'text-stone-600/50'
          }`}>
            {keyLabel}
          </span>
        )}
      </div>

      {/* Indicador de estado en la base */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-md transition-all ${
        isSounding
          ? 'bg-amber-300'
          : isSelected
            ? 'bg-amber-500/60'
            : 'bg-transparent'
      }`} />
    </button>
  );
}
