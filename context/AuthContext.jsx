"use client";

import React, { createContext, useContext, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clearSession, getStoredSession, persistSession } from '@/lib/session';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredSession());
    const [loading] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || 'es';

    const login = (userData) => {
        setUser(userData);
        persistSession(userData);
        router.push(`/${lang}/dashboard`);
    };

    const logout = () => {
        setUser(null);
        clearSession();
        router.push(`/${lang}/login`);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
};
