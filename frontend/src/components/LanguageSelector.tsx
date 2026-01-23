import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            i18n.language === lang.code
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="mr-1.5">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
