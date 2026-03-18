/**
 * @fileoverview Barra compacta de selección de instrumento.
 *
 * Desde la refactorización UI v2 (layout unificado mobile-first), este
 * componente contiene únicamente el selector de instrumento. Los controles
 * de Play/Stop y Volumen fueron movidos al panel principal en NoteGrid.jsx,
 * dentro de los mangos laterales inspirados en el instrumento físico MKS.
 *
 * Se renderiza debajo del panel principal como una barra horizontal compacta.
 */

import useShrutiStore from '../store/useShrutiStore';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { INSTRUMENTS } from '../audio/instruments';
import useTranslation from '../i18n/useTranslation';

export default function Controls() {
  const instrumentId  = useShrutiStore((s) => s.instrumentId);
  const setInstrument = useShrutiStore((s) => s.setInstrument);
  const { t } = useTranslation();

  if (!FEATURE_FLAGS.ENABLE_INSTRUMENT_SELECTOR) return null;

  return (
    <div className="bg-amber-950/50 backdrop-blur-sm rounded-xl border border-amber-800/30 px-4 py-2.5 flex items-center gap-3">
      <span className="text-[10px] text-amber-500/50 uppercase tracking-wider font-medium shrink-0">
        {t('controls.instrument')}
      </span>
      <div className="flex gap-2 flex-1">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setInstrument(inst.id)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              inst.id === instrumentId
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'bg-amber-900/40 text-amber-500/55 hover:bg-amber-800/50'
            }`}
          >
            {inst.name}
          </button>
        ))}
      </div>
    </div>
  );
}
