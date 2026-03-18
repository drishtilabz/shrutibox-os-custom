import esAR from './es-AR';
import ptBR from './pt-BR';
import enUS from './en-US';

export const LOCALES = [ptBR, esAR, enUS];
export const LOCALES_BY_ID = Object.fromEntries(LOCALES.map((l) => [l.id, l]));
export const DEFAULT_LOCALE_ID = 'pt-BR';
