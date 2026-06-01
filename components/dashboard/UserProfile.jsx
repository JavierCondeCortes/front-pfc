'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getSessionSnapshot, subscribeToSession } from '@/lib/session';

export default function UserProfile({ name = 'Usuario CarHistorial', role, avatarSeed = 5 }) {
    const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
    const profile = useMemo(() => {
        if (!sessionSnapshot) return null;
        try {
            return JSON.parse(sessionSnapshot);
        } catch {
            return null;
        }
    }, [sessionSnapshot]);

    const displayName = profile?.nombre || profile?.name || profile?.email || name;
    const avatar = profile?.photoUrl || `https://i.pravatar.cc/150?u=${avatarSeed}`;

    return (
        <div className="flex items-center gap-3 px-2">
            <div
                className="bg-slate-200 dark:bg-slate-700 size-10 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${avatar}')` }}
            />
            <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-sm font-semibold truncate max-w-36">{displayName}</p>
                <p className="text-slate-500 text-xs">{role}</p>
            </div>
        </div>
    );
}
