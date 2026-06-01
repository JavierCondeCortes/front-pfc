"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || 'es';

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${lang}/login`);
        }
    }, [user, loading, router, lang]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-950">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return <>{children}</>;
}