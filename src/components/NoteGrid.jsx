/**
 * @fileoverview Panel frontal del Shrutibox.
 *
 * Renderiza las 13 notas cromaticas como lengüetas/switches
 * dispuestas en una fila horizontal, simulando el frente
 * de un shrutibox acustico real.
 */

import NoteButton from './NoteButton';
import { NOTES } from '../audio/noteMap';

export default function NoteGrid() {
  return (
    <div className="shrutibox-body rounded-2xl border-2 border-amber-900/60 p-4 sm:p-6">
      {/* Label del instrumento */}
      <div className="text-center mb-4">
        <span className="text-[10px] sm:text-xs text-amber-600/40 uppercase tracking-[0.2em] font-medium">
          Shrutibox &mdash; 13 notas
        </span>
      </div>

      {/* Fila de lengüetas */}
      <div className="flex items-end justify-center gap-1 sm:gap-1.5 overflow-x-auto pb-2">
        {NOTES.map((note) => (
          <NoteButton key={note.id} note={note} />
        ))}
      </div>

      {/* Borde inferior decorativo */}
      <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-amber-900/20 via-amber-800/40 to-amber-900/20" />
    </div>
  );
}
