"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import MobileMenuOverlay from '@/components/MobileMenuOverlay';

const StatCard = ({ label, value, trend, subtitle, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <span className="material-symbols-outlined text-slate-400">{icon}</span>
        </div>
        <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{value}</p>
        {(trend || subtitle) && (
            <div className="flex items-center gap-1 mt-2">
                <span className={`material-symbols-outlined text-sm ${color === 'emerald' ? 'text-emerald-500' : 'text-primary'}`}>
                    {trend ? 'trending_up' : 'speed'}
                </span>
                <p className={`${color === 'emerald' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'} text-xs font-semibold`}>
                    {trend ? `${trend} ` : ''}
                    <span className="text-slate-400 font-normal">{subtitle}</span>
                </p>
            </div>
        )}
    </div>
);

const HealthBar = ({ label, progress, color, warning }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
            <span className={`text-xs font-bold ${warning ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                {progress}% {warning && `(${warning})`}
            </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

const AlertItem = ({ icon, color, title, desc }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
        <span className={`material-symbols-outlined ${color} mt-0.5`}>{icon}</span>
        <div>
            <p className="text-sm font-bold leading-none">{title}</p>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
    </div>
);

export default function VehicleHistoryClient({ dict }) {
    const router = useRouter();
    const params = useParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const lang = params?.lang || 'es';
    const t = useTranslation(dict);

    const userProfile = (
        <div className="flex items-center gap-3 px-2">
            <div className="bg-slate-200 size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=9')" }}></div>
            <div className="flex flex-col">
                <p className="text-sm font-semibold">Usuario CarHistorial</p>
                <p className="text-slate-500 text-xs">{t('dashboard.sidebar.role')}</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <Sidebar 
                lang={lang}
                router={router}
                activePage="history"
                t={t}
                userProfile={userProfile}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader 
                    onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isMenuOpen={isMobileMenuOpen}
                />

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-6xl mx-auto p-4 lg:p-8">
                        
                        {/* Header */}
                        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{t('features.history_title')}</h2>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-sm">electric_car</span>
                                    <p className="text-sm font-medium">Tesla Model 3 — <span className="text-slate-400 font-mono text-xs">VIN: 5YJ3E1EA6LFXXXXXX</span></p>
                                </div>
                            </div>
                            <button className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-all">
                                <span className="material-symbols-outlined text-sm">post_add</span> {t('dashboard.activity.title')}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard 
                                label={t('dashboard.expenses.title')} 
                                value="€ 2.450,00" 
                                trend={t('dashboard.expenses.trend')} 
                                icon="payments" 
                                color="emerald" 
                            />
                            <StatCard 
                                label={t('dashboard.stats.mileage')} 
                                value="12.400 km" 
                                subtitle={t('dashboard.filters.30days')} 
                                icon="speed" 
                                color="primary" 
                            />
                            <StatCard 
                                label={t('dashboard.stats.health')} 
                                value="92%" 
                                subtitle={t('register.benefit1_title')} 
                                icon="favorite" 
                                color="emerald" 
                            />
                        </div>

                        {/* Tabla */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-1 min-w-[280px]">
                                    <div className="flex items-center w-full bg-slate-100 dark:bg-slate-800 px-4 rounded-lg focus-within:ring-2 ring-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                                        <input 
                                            className="bg-transparent border-none focus:ring-0 text-sm w-full py-2.5" 
                                            placeholder={`${t('landing.nav_features')}...`} 
                                            type="text" 
                                        />
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold transition-colors hover:bg-slate-200">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    {t('dashboard.actions.export')}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 italic">ID</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.activity.service')}</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.stats.mileage')}</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.expenses.title')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-400">#0812</td>
                                            <td className="px-6 py-4 text-sm font-semibold">{t('dashboard.activity.service')}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">42.500 km</td>
                                            <td className="px-6 py-4 text-sm font-bold">€ 320,00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">{t('dashboard.distribution.title')}</h3>
                                <div className="space-y-4">
                                    <HealthBar label={t('dashboard.alerts.brake')} progress={25} color="bg-amber-500" warning={t('dashboard.stats.pending')} />
                                    <HealthBar label={t('dashboard.stats.health')} progress={92} color="bg-emerald-500" />
                                    <HealthBar label={t('features.alerts_title')} progress={65} color="bg-primary" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">{t('dashboard.alerts.title')}</h3>
                                    <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">{t('dashboard.alerts.critical')}</span>
                                </div>
                                <div className="space-y-3">
                                    <AlertItem 
                                        icon="warning" 
                                        color="text-amber-500" 
                                        title={t('dashboard.alerts.engine')} 
                                        desc={t('register.benefit5_desc')} 
                                    />
                                    <AlertItem 
                                        icon="notifications" 
                                        color="text-primary" 
                                        title={t('dashboard.alerts.view_all')} 
                                        desc={t('dashboard.header.subtitle')} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileMenuOverlay 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                lang={lang}
                router={router}
                activePage="history"
                t={t}
            />
        </div>
    );
}
