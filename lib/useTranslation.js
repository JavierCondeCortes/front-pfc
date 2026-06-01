/**
 * Hook personalizado para traducciones
 * Unifica las dos variantes de la función t() que existían
 */
export function useTranslation(dict) {
    return (path, fallback) => {
        const keys = path.split('.');
        let result = dict;
        for (const key of keys) {
            if (!result || result[key] === undefined) return fallback || path;
            result = result[key];
        }
        return result;
    };
}
