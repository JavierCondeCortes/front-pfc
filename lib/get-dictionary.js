
// src/lib/dictionary.js
const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
    it: () => import('@/dictionaries/it.json').then((module) => module.default),
    jp: () => import('@/dictionaries/jp.json').then((module) => module.default),
};

export const getDictionary = async (locale) => (dictionaries[locale] || dictionaries.en)();
