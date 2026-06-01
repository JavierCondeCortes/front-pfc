'use client';

import NavItem from './NavItem';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenuOverlay({ isOpen, onClose, lang, router, activePage, t }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={onClose}
        >
            <div
                className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <span className="font-black text-primary">Menu</span>
                    <button onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav className="flex flex-col gap-3">
                    <NavItem
                        onClick={() => {
                            router.push(`/${lang}/dashboard`);
                            onClose();
                        }}
                        icon="dashboard"
                        label={t('dashboard.menu.dashboard', 'Dashboard')}
                        active={activePage === 'dashboard'}
                    />
                    <NavItem
                        onClick={() => {
                            router.push(`/${lang}/dashboard/history`);
                            onClose();
                        }}
                        icon="history"
                        label={t('dashboard.menu.history', 'Service History')}
                        active={activePage === 'history'}
                    />
                    <NavItem
                        onClick={() => {
                            router.push(`/${lang}/dashboard/vehicles`);
                            onClose();
                        }}
                        icon="garage"
                        label={t('dashboard.menu.vehicles', 'Vehicles')}
                        active={activePage === 'vehicles'}
                    />
                    <NavItem
                        onClick={() => {
                            router.push(`/${lang}/dashboard/documents`);
                            onClose();
                        }}
                        icon="description"
                        label={t('dashboard.menu.docs', 'Documents')}
                        active={activePage === 'documents'}
                    />
                    <NavItem
                        onClick={() => {
                            router.push(`/${lang}/dashboard/settings`);
                            onClose();
                        }}
                        icon="settings"
                        label={t('dashboard.menu.settings', 'Settings')}
                        active={activePage === 'settings'}
                    />
                </nav>
                <LanguageSwitcher lang={lang} className="mt-6" />
            </div>
        </div>
    );
}
