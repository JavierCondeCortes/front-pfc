'use client';

import { usePathname } from 'next/navigation';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'jp', label: '日本語' },
];

export default function LanguageSwitcher({ lang, className = '' }) {
    const pathname = usePathname();

    const changeLanguage = (nextLang) => {
        if (typeof window !== 'undefined') localStorage.setItem('preferred_language', nextLang);
        const parts = pathname.split('/');
        parts[1] = nextLang;
        window.location.assign(parts.join('/') || `/${nextLang}/home`);
    };

    return (
        <label className={`flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-200 ${className}`}>
            <span className="material-symbols-outlined text-sm">language</span>
            <select
                aria-label="Idioma"
                className="bg-transparent border-none outline-none text-xs font-bold"
                value={LANGUAGES.some((item) => item.code === lang) ? lang : 'en'}
                onChange={(event) => changeLanguage(event.target.value)}
            >
                {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
        </label>
    );
}
