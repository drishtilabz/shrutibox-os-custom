/**
 * @fileoverview Skin "Latón Nocturno" — tema oscuro contemporáneo.
 *
 * Aleja la paleta de la madera hacia una base pizarra/teal nocturna con
 * acentos de latón dorado, evocando los herrajes metálicos del instrumento.
 * Las lengüetas de marfil se conservan como pieza de identidad central.
 *
 * Escalera de luminosidad pensada para contraste WCAG AA sobre bg-deep:
 *   - text (L~93%), text-mid (L~70%), text-faint (L~56%), accent (latón L~66%).
 */

export default {
  id: 'brass-night',
  name: 'Latón Nocturno',
  preview: '#14201f',
  meta: {
    themeColor: '#1e3330',
  },
  cssVars: {
    '--sb-bg': '#14201f',
    '--sb-bg-deep': '#080d0d',

    '--sb-text': '#eef2ef',
    '--sb-text-mid': '#a6bdb3',
    '--sb-text-faint': '#82958d',

    '--sb-accent': '#d8a93a',
    '--sb-accent-hover': '#ecbd52',
    '--sb-accent-ink': '#14100a',

    '--sb-chrome': '#1e3330',
    '--sb-border': '#335149',
    '--sb-muted': '#c8a04a',
    '--sb-neutral': '#16201f',

    // Sistema de superficies (chrome moderno del rediseño híbrido)
    '--sb-surface-1': 'rgba(30, 51, 48, 0.55)',
    '--sb-surface-2': 'rgba(51, 81, 73, 0.5)',
    '--sb-surface-border': 'rgba(130, 170, 155, 0.2)',
    '--sb-accent-glow': 'rgba(216, 169, 58, 0.55)',

    '--sb-play': '#10b981',
    '--sb-stop': '#ef4444',
    '--sb-playing': '#34d399',

    '--sb-body-1': 'hsl(172, 22%, 13%)',
    '--sb-body-2': 'hsl(172, 20%, 11%)',
    '--sb-body-3': 'hsl(174, 18%, 9%)',
    '--sb-body-shine': 'rgba(120, 200, 180, 0.10)',
    '--sb-body-highlight': 'rgba(180, 220, 200, 0.06)',
    '--sb-body-shadow-inset': 'rgba(0, 0, 0, 0.35)',
    '--sb-body-shadow-outer': 'rgba(0, 0, 0, 0.45)',

    '--sb-slot-start': '#020403',
    '--sb-slot-end': '#0a1210',

    '--sb-reed-1': '#f0ece1',
    '--sb-reed-2': '#ebe6d9',
    '--sb-reed-3': '#e4dece',
    '--sb-reed-4': '#ddd6c4',
    '--sb-reed-5': '#d6ceb9',
    '--sb-reed-border': 'rgba(170, 160, 135, 0.4)',

    '--sb-screw-1': '#e0cf9a',
    '--sb-screw-2': '#bda968',
    '--sb-screw-3': '#998648',
    '--sb-screw-4': '#756538',

    '--sb-slider-accent': '#d8a93a',

    '--sb-focus-ring': '#d8a93a',
  },
};
