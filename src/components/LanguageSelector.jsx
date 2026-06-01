import useLanguageStore from '../i18n/useLanguageStore';
import { LOCALES } from '../i18n/locales';

export default function LanguageSelector() {
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  return (
    <div className="sb-surface flex gap-0.5 rounded-lg p-0.5">
      {LOCALES.map((loc) => (
        <button
          key={loc.id}
          onClick={() => setLocale(loc.id)}
          title={loc.name}
          className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all duration-150 active:scale-95 ${
            loc.id === locale
              ? 'bg-sb-accent text-sb-accent-ink shadow-sm'
              : 'text-sb-text-faint hover:text-sb-text-mid'
          }`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
