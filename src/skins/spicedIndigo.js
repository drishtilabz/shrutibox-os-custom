/**
 * @fileoverview Skin "Índigo Especiado" — tema oscuro vibrante.
 *
 * Base índigo/violeta profunda con acento azafrán (saffron), inspirado en
 * la paleta de especias y textiles indostánicos. Contraste cálido/frío que
 * resalta el visor y los estados activos. Lengüetas de marfil conservadas.
 *
 * Escalera de luminosidad pensada para contraste WCAG AA sobre bg-deep:
 *   - text (L~94%), text-mid (L~72%), text-faint (L~58%), accent (azafrán L~64%).
 */

export default {
  id: 'spiced-indigo',
  name: 'Índigo Especiado',
  preview: '#1e1633',
  meta: {
    themeColor: '#2e2350',
  },
  cssVars: {
    '--sb-bg': '#1e1633',
    '--sb-bg-deep': '#0a0815',

    '--sb-text': '#efe9f5',
    '--sb-text-mid': '#bdacd6',
    '--sb-text-faint': '#9b8bb4',

    '--sb-accent': '#f0922a',
    '--sb-accent-hover': '#ffa845',
    '--sb-accent-ink': '#1c1005',

    '--sb-chrome': '#2e2350',
    '--sb-border': '#4a3a72',
    '--sb-muted': '#e09a4a',
    '--sb-neutral': '#1a1430',

    // Sistema de superficies (chrome moderno del rediseño híbrido)
    '--sb-surface-1': 'rgba(46, 35, 80, 0.5)',
    '--sb-surface-2': 'rgba(74, 58, 114, 0.5)',
    '--sb-surface-border': 'rgba(160, 140, 210, 0.2)',
    '--sb-accent-glow': 'rgba(240, 146, 42, 0.55)',

    '--sb-play': '#10b981',
    '--sb-stop': '#ef4444',
    '--sb-playing': '#34d399',

    '--sb-body-1': 'hsl(258, 35%, 16%)',
    '--sb-body-2': 'hsl(256, 33%, 13%)',
    '--sb-body-3': 'hsl(254, 30%, 10%)',
    '--sb-body-shine': 'rgba(165, 135, 235, 0.12)',
    '--sb-body-highlight': 'rgba(195, 175, 245, 0.07)',
    '--sb-body-shadow-inset': 'rgba(0, 0, 0, 0.35)',
    '--sb-body-shadow-outer': 'rgba(0, 0, 0, 0.5)',

    '--sb-slot-start': '#050310',
    '--sb-slot-end': '#120c22',

    '--sb-reed-1': '#f3eef6',
    '--sb-reed-2': '#ece5f0',
    '--sb-reed-3': '#e3dae9',
    '--sb-reed-4': '#dacfe1',
    '--sb-reed-5': '#d0c4d8',
    '--sb-reed-border': 'rgba(150, 135, 175, 0.4)',

    '--sb-screw-1': '#cdc5d8',
    '--sb-screw-2': '#a89eb8',
    '--sb-screw-3': '#8a8098',
    '--sb-screw-4': '#6e6678',

    '--sb-slider-accent': '#f0922a',

    '--sb-focus-ring': '#f0922a',
  },
};
