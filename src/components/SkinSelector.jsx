/**
 * @fileoverview Selector visual de paletas (skins).
 *
 * Antes era un toggle binario sol/luna. Con el rediseño UI híbrido y la
 * incorporación de más skins, pasa a ser un selector de muestras: un botón
 * disparador que muestra el color del skin activo y, al abrirse, un popover
 * con todas las paletas disponibles representadas por su swatch + nombre.
 *
 * Solo presentación: usa el store de tema existente (setSkin) sin tocar lógica.
 */

import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../store/useThemeStore';
import useTranslation from '../i18n/useTranslation';
import { SKINS } from '../skins';

export default function SkinSelector() {
  const skinId = useThemeStore((s) => s.skinId);
  const setSkin = useThemeStore((s) => s.setSkin);
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const activeSkin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];

  // Cierra el popover al hacer click fuera o presionar Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="sb-control w-10 h-10 rounded-lg active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-focus-ring focus-visible:ring-offset-1"
        aria-label={t('theme.toggle')}
        aria-haspopup="true"
        aria-expanded={open}
        title={activeSkin.name}
      >
        <span
          className="w-5 h-5 rounded-full ring-1 ring-inset ring-black/20 shadow-inner"
          style={{ background: activeSkin.preview }}
        />
      </button>

      {open && (
        <div
          className="sb-surface-raised absolute right-0 top-12 z-50 w-44 rounded-xl p-1.5 backdrop-blur-md"
          role="menu"
          aria-label={t('theme.toggle')}
        >
          {SKINS.map((skin) => {
            const isActive = skin.id === skinId;
            return (
              <button
                key={skin.id}
                onClick={() => {
                  setSkin(skin.id);
                  setOpen(false);
                }}
                role="menuitemradio"
                aria-checked={isActive}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 ${
                  isActive
                    ? 'bg-sb-accent/15 text-sb-text'
                    : 'text-sb-text-faint hover:bg-sb-surface-2 hover:text-sb-text-mid'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full ring-1 ring-inset ring-black/20 shrink-0 ${
                    isActive ? 'ring-2 ring-sb-accent' : ''
                  }`}
                  style={{ background: skin.preview }}
                />
                <span className="text-xs font-semibold truncate flex-1">{skin.name}</span>
                {isActive && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-sb-accent shrink-0">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
