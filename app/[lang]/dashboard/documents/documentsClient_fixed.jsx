"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import MobileMenuOverlay from '@/components/MobileMenuOverlay';

export default function VehicleDocumentsVault({ dict }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || 'es';
    const t = useTranslation(dict);

    const userProfile = (
        <div className="flex items-center gap-3 px-2">
            <div className="bg-slate-200 size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=9')" }}></div>
            <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-sm font-semibold">Alex Thompson</p>
                <p className="text-slate-500 text-xs">{t('dashboard.sidebar.role')}</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <Sidebar 
                lang={lang}
                router={router}
                activePage="documents"
                t={t}
                userProfile={userProfile}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader 
                    onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                    isMenuOpen={isMenuOpen}
                />

                <main className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
                    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8">
                        
                        {/* Título y Header de Página */}
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-black tracking-tight">{t('dashboard.docs_vault.title')}</h2>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-sm">folder_shared</span>
                                    <p className="text-xs lg:text-sm font-medium">
                                        {t('dashboard.docs_vault.subtitle')} <span className="text-slate-900 dark:text-white font-bold">Tesla Model 3</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex  bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 font-bold py-2.5 px-5 rounded-lg text-sm items-center gap-2 shadow-sm transition-all">
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    {t('dashboard.docs_vault.new_file')}
                                </button>
                                <button className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 font-bold py-2.5 px-5 rounded-lg text-sm items-center gap-2 shadow-sm transition-all">
                                    <span className="material-symbols-outlined text-sm">create_new_folder</span>
                                    {t('dashboard.docs_vault.new_folder')}
                                </button>
                            </div>
                        </div>

                        {/* Dropzone Responsivo */}
                        <div className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 lg:p-10 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <div className="size-12 lg:size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl lg:text-3xl font-bold">cloud_upload</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-slate-900 dark:text-white font-bold text-sm lg:text-lg">{t('dashboard.docs_vault.dropzone_title')}</h3>
                                <p className="text-slate-500 text-[10px] lg:text-sm mt-1">{t('dashboard.docs_vault.dropzone_subtitle')}</p>
                            </div>
                        </div>

                        {/* Categorías (Grid en PC, Select en Móvil) */}
                        <div className="lg:hidden flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Category</label>
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-4 text-sm font-medium appearance-none focus:ring-2 focus:ring-primary/20">
                                    <option>Service Receipts (12)</option>
                                    <option>Insurance (4)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="hidden lg:grid grid-cols-4 gap-4">
                            <CategoryCard icon="health_and_safety" title={t('dashboard.docs_vault.categories.insurance')} count="4" color="blue" />
                            <CategoryCard icon="assignment" title={t('dashboard.docs_vault.categories.registration')} count="2" color="emerald" />
                            <CategoryCard icon="receipt_long" title={t('dashboard.docs_vault.categories.service')} count="12" active />
                            <CategoryCard icon="verified" title={t('dashboard.docs_vault.categories.warranty')} count="3" color="amber" />
                        </div>

                        {/* Tabla de Documentos Detallada */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-20 lg:mb-0">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-1 min-w-[250px]">
                                    <label className="flex items-center w-full bg-slate-100 dark:bg-slate-800 px-4 rounded-lg focus-within:ring-2 ring-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full py-2.5" placeholder={t('dashboard.search.placeholder')} type="text" />
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><span className="material-symbols-outlined text-sm">sort</span></button>
                                    <button className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                                        <span className="material-symbols-outlined text-sm">view_list</span> {t('dashboard.actions.view_mode')}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.table.name')}</th>
                                            <th className="hidden md:table-cell px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.table.date')}</th>
                                            <th className="hidden lg:table-cell px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('dashboard.table.size')}</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">{t('dashboard.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <DocumentRow name="Brake_Replacement_Invoice.pdf" date="Aug 12, 2023" size="1.2 MB" type="PDF" />
                                        <DocumentRow name="Tire_Rotation_Receipt.jpg" date="May 05, 2023" size="4.5 MB" type="IMG" />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Widgets de Inferiores (PC) */}
                        <div className="hidden lg:grid grid-cols-2 gap-6 pt-8 pb-8">
                            <StorageWidget t={t} />
                            <AlertsWidget t={t} />
                        </div>
                    </div>
                </main>
            </div>

            <MobileMenuOverlay 
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                lang={lang}
                router={router}
                activePage="documents"
                t={t}
            />
        </div>
    );
}

/** --- SUB-COMPONENTES AUXILIARES --- **/

const DocumentRow = ({ name, date, size, type }) => (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${type === 'PDF' ? 'text-red-500' : 'text-blue-500'}`}>
                    {type === 'PDF' ? 'picture_as_pdf' : 'image'}
                </span>
                <div className="min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white font-medium truncate max-w-[150px] lg:max-w-none">{name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Service Receipt</p>
                </div>
            </div>
        </td>
        <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{date}</td>
        <td className="hidden lg:table-cell px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{size}</td>
        <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-1">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">visibility</span></button>
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
            </div>
        </td>
    </tr>
);

const CategoryCard = ({ icon, title, count, active = false, color = 'primary' }) => (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors cursor-pointer ${active ? 'border-primary ring-1 ring-primary/20' : ''}`}>
        <div className="flex items-center justify-between mb-3">
            <div className={`size-10 rounded-lg flex items-center justify-center ${active ? 'bg-primary/10 text-primary' : `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600`}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">{count} Files</span>
        </div>
        <h4 className="text-slate-900 dark:text-white font-bold text-sm">{title}</h4>
    </div>
);

const StorageWidget = ({ t }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Vault Storage</h3>
        <div className="space-y-4">
            <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Used Space</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">420 MB / 1 GB</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
            </div>
        </div>
    </div>
);

const AlertsWidget = ({ t }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Compliance Alerts</h3>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
            <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
            <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Insurance Expiring</p>
                <p className="text-xs text-slate-500 mt-1">Proof of coverage expires in 12 days.</p>
            </div>
        </div>
    </div>
);
