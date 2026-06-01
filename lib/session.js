export const SESSION_STORAGE_KEY = 'user_session';
export const TOKEN_STORAGE_KEY = 'auth_token';
export const SESSION_CHANGED_EVENT = 'carhistorial_session_changed';

export function getStoredSession() {
    if (typeof window === 'undefined') return null;

    const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionRaw) return null;

    try {
        return JSON.parse(sessionRaw);
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export function getAuthToken() {
    if (typeof window === 'undefined') return null;

    const session = getStoredSession();
    const sessionToken = session?.token || session?.access_token || session?.jwt;
    return sessionToken || localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function persistSession(userData) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
    document.cookie = `session-token=${encodeURIComponent(userData?.token || userData?.access_token || userData?.jwt || 'active')}; path=/; max-age=2592000; SameSite=Lax`;
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = 'session-token=; path=/; max-age=0; SameSite=Lax';
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getSessionSnapshot() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function subscribeToSession(listener) {
    if (typeof window === 'undefined') return () => {};

    const handleStorage = (event) => {
        if (!event.key || event.key === SESSION_STORAGE_KEY) listener();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SESSION_CHANGED_EVENT, listener);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(SESSION_CHANGED_EVENT, listener);
    };
}
