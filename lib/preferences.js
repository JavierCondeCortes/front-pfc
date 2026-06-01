'use client';

export const DISTANCE_UNIT_KEY = 'distance_unit';
export const DISTANCE_UNIT_CHANGED_EVENT = 'carhistorial_distance_unit_changed';

export function getDistanceUnit() {
    if (typeof window === 'undefined') return 'km';
    return localStorage.getItem(DISTANCE_UNIT_KEY) || 'km';
}

export function setDistanceUnit(unit) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DISTANCE_UNIT_KEY, unit === 'mi' ? 'mi' : 'km');
    window.dispatchEvent(new Event(DISTANCE_UNIT_CHANGED_EVENT));
}

export function subscribeToDistanceUnit(listener) {
    if (typeof window === 'undefined') return () => {};
    const handleStorage = (event) => {
        if (!event.key || event.key === DISTANCE_UNIT_KEY) listener();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(DISTANCE_UNIT_CHANGED_EVENT, listener);
    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(DISTANCE_UNIT_CHANGED_EVENT, listener);
    };
}

export function formatDistance(value, unit = 'km', locale = 'es-ES') {
    const km = Number(value || 0);
    const converted = unit === 'mi' ? km * 0.621371 : km;
    return `${Math.round(converted).toLocaleString(locale)} ${unit === 'mi' ? 'mi' : 'km'}`;
}

export function parseDistanceInput(value, unit = 'km') {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return NaN;
    return unit === 'mi' ? Math.round(amount / 0.621371) : amount;
}
