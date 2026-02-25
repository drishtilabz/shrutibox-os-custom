/**
 * @fileoverview Display informativo del Shrutibox.
 *
 * Muestra la ultima nota seleccionada (nombre Sargam, notacion occidental,
 * frecuencia), indicador de estado de reproduccion y contador de notas activas.
 */

import useShrutiStore from '../store/useShrutiStore';
import { NOTES_BY_ID } from '../audio/noteMap';

export default function Display() {
  const selectedNotes = useShrutiStore((s) => s.selectedNotes);
  const playing = useShrutiStore((s) => s.playing);

  const lastNoteId = selectedNotes[selectedNotes.length - 1];
  const lastNote = lastNoteId ? NOTES_BY_ID[lastNoteId] : null;

  const variantLabel =
    lastNote?.variant === 'komal'
      ? ' komal'
      : lastNote?.variant === 'tivra'
        ? ' tivra'
        : '';

  return (
    <div className="bg-amber-950/60 backdrop-blur-sm rounded-2xl border border-amber-800/40 px-6 py-5 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-amber-400/60 text-xs uppercase tracking-widest font-medium">
          Shrutibox Digital
        </span>
        {playing && (
          <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Sonando
          </span>
        )}
      </div>

      <div className="min-h-[72px] flex flex-col items-center justify-center">
        {lastNote ? (
          <>
            <div
              className={`text-5xl font-bold text-amber-100 ${playing ? 'animate-pulse' : ''}`}
            >
              {lastNote.name}
              {variantLabel && (
                <span className="text-2xl text-amber-400/70">{variantLabel}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-amber-300/70 text-sm">
              <span>{lastNote.western}</span>
              <span className="w-1 h-1 rounded-full bg-amber-500/50" />
              <span>{lastNote.frequency} Hz</span>
            </div>
          </>
        ) : (
          <div className="text-amber-600/50 text-lg italic">
            Selecciona una nota...
          </div>
        )}
      </div>

      {selectedNotes.length > 0 && (
        <div className="mt-3 text-amber-500/50 text-xs">
          {selectedNotes.length} {selectedNotes.length === 1 ? 'nota activa' : 'notas activas'}
        </div>
      )}
    </div>
  );
}
