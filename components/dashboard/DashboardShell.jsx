'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { getSessionSnapshot, subscribeToSession } from '@/lib/session';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import MobileMenuOverlay from '@/components/MobileMenuOverlay';
import UserProfile from '@/components/dashboard/UserProfile';

export default function DashboardShell({
    dict,
    lang: providedLang,
    activePage,
    children,
    contentClassName = 'max-w-6xl mx-auto p-4 lg:p-8',
    onAddClick,
    profileName,
    profileAvatarSeed,
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = providedLang || params?.lang || 'es';
    const t = useTranslation(dict);
    const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
    const handleAddClick = onAddClick || (() => router.push(`/${lang}/dashboard/vehicles?add=1`));

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            if (!localStorage.getItem('user_session')) router.replace(`/${lang}/login`);
        });
        return () => cancelAnimationFrame(frame);
    }, [lang, router, sessionSnapshot]);

    const userProfile = (
        <UserProfile
            name={profileName}
            role={t('dashboard.sidebar.role', 'Fleet Manager')}
            avatarSeed={profileAvatarSeed}
        />
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <Sidebar
                lang={lang}
                router={router}
                activePage={activePage}
                t={t}
                userProfile={userProfile}
                onAddClick={handleAddClick}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader
                    onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
                    isMenuOpen={isMobileMenuOpen}
                />

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className={contentClassName}>
                        {children({ t, lang, router })}
                    </div>
                </main>
            </div>

            <MobileMenuOverlay
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                lang={lang}
                router={router}
                activePage={activePage}
                t={t}
            />
        </div>
    );
}
