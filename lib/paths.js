export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBasePath(path) {
    if (!path) return BASE_PATH || '/';
    if (/^(https?:|data:|blob:|#)/.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!BASE_PATH || normalizedPath === BASE_PATH || normalizedPath.startsWith(`${BASE_PATH}/`)) {
        return normalizedPath;
    }

    return `${BASE_PATH}${normalizedPath}`;
}
