'use client';

import NavItem from './NavItem';
import LanguageSwitcher from './LanguageSwitcher';

export default function Sidebar({ lang, router, activePage, t, userProfile, onAddClick }) {
    return (
        <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-4 shrink-0">
            <div className="flex flex-col gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">directions_car</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none">CarHistorial</h1>
                        <p className="text-slate-500 text-xs font-normal">{t('dashboard.sidebar.sub', 'Manage & Track')}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                    <NavItem
                        onClick={() => router.push(`/${lang}/dashboard`)}
                        icon="dashboard"
                        label={t('dashboard.menu.dashboard', 'Dashboard')}
                        active={activePage === 'dashboard'}
                    />
                    <NavItem
                        onClick={() => router.push(`/${lang}/dashboard/history`)}
                        icon="history"
                        label={t('dashboard.menu.history', 'Service History')}
                        active={activePage === 'history'}
                    />
                    <NavItem
                        onClick={() => router.push(`/${lang}/dashboard/vehicles`)}
                        icon="garage"
                        label={t('dashboard.menu.vehicles', 'Vehicles')}
                        active={activePage === 'vehicles'}
                    />
                    <NavItem
                        onClick={() => router.push(`/${lang}/dashboard/documents`)}
                        icon="description"
                        label={t('dashboard.menu.docs', 'Documents')}
                        active={activePage === 'documents'}
                    />
                    <NavItem
                        onClick={() => router.push(`/${lang}/dashboard/settings`)}
                        icon="settings"
                        label={t('dashboard.menu.settings', 'Settings')}
                        active={activePage === 'settings'}
                    />
                </nav>
            </div>

            {/* User Profile Section */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {userProfile}
                <LanguageSwitcher lang={lang} />
                <button
                    onClick={onAddClick}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    {t('dashboard.actions.add', 'Add Vehicle')}
                </button>
            </div>
        </aside>
    );
}
