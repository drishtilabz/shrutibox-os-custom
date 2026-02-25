/**
 * @fileoverview Mapa de notas cromaticas del Shrutibox Digital.
 *
 * Define las 13 notas de una octava completa del sistema Sargam:
 * 7 shuddh (naturales) + 4 komal (bemol) + 1 tivra (sostenido) + Sa agudo.
 * Frecuencias basadas en afinacion A=440Hz, octava 3.
 */

/**
 * Las 13 notas cromaticas en orden ascendente.
 * @type {Array<{id: string, name: string, variant: string, western: string, frequency: number, fileKey: string}>}
 */
const CHROMATIC_NOTES = [
  { id: 'sa',        name: 'Sa',  variant: 'shuddh', western: 'C3',  frequency: 130.81, fileKey: 'sa' },
  { id: 're_komal',  name: 'Re',  variant: 'komal',  western: 'Db3', frequency: 138.59, fileKey: 're_komal' },
  { id: 're',        name: 'Re',  variant: 'shuddh', western: 'D3',  frequency: 146.83, fileKey: 're' },
  { id: 'ga_komal',  name: 'Ga',  variant: 'komal',  western: 'Eb3', frequency: 155.56, fileKey: 'ga_komal' },
  { id: 'ga',        name: 'Ga',  variant: 'shuddh', western: 'E3',  frequency: 164.81, fileKey: 'ga' },
  { id: 'ma',        name: 'Ma',  variant: 'shuddh', western: 'F3',  frequency: 174.61, fileKey: 'ma' },
  { id: 'ma_tivra',  name: 'Ma',  variant: 'tivra',  western: 'F#3', frequency: 185.00, fileKey: 'ma_tivra' },
  { id: 'pa',        name: 'Pa',  variant: 'shuddh', western: 'G3',  frequency: 196.00, fileKey: 'pa' },
  { id: 'dha_komal', name: 'Dha', variant: 'komal',  western: 'Ab3', frequency: 207.65, fileKey: 'dha_komal' },
  { id: 'dha',       name: 'Dha', variant: 'shuddh', western: 'A3',  frequency: 220.00, fileKey: 'dha' },
  { id: 'ni_komal',  name: 'Ni',  variant: 'komal',  western: 'Bb3', frequency: 233.08, fileKey: 'ni_komal' },
  { id: 'ni',        name: 'Ni',  variant: 'shuddh', western: 'B3',  frequency: 246.94, fileKey: 'ni' },
  { id: 'sa_high',   name: 'Sa',  variant: 'shuddh', western: 'C4',  frequency: 261.63, fileKey: 'sa_high' },
];

/** Lista completa de notas del instrumento (13 notas cromaticas). */
export const NOTES = CHROMATIC_NOTES;

/** Diccionario de notas indexado por id para busqueda O(1). */
export const NOTES_BY_ID = Object.fromEntries(NOTES.map((n) => [n.id, n]));

/**
 * Mapeo de teclas del teclado fisico a id de nota, estilo piano:
 * - Fila inferior (shuddh): A S D F G H J K
 * - Fila superior (komal/tivra): W E T Y U
 * @type {Record<string, string>}
 */
export const KEYBOARD_MAP = {
  a: 'sa',
  w: 're_komal',
  s: 're',
  e: 'ga_komal',
  d: 'ga',
  f: 'ma',
  t: 'ma_tivra',
  g: 'pa',
  y: 'dha_komal',
  h: 'dha',
  u: 'ni_komal',
  j: 'ni',
  k: 'sa_high',
};

/**
 * Mapeo inverso: de noteId a tecla, para mostrar labels en la UI.
 * @type {Record<string, string>}
 */
export const KEY_LABELS = Object.fromEntries(
  Object.entries(KEYBOARD_MAP).map(([key, noteId]) => [noteId, key.toUpperCase()])
);

export { CHROMATIC_NOTES };
