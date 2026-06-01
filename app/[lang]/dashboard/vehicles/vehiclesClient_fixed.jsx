'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import MobileMenuOverlay from '@/components/MobileMenuOverlay';

export default function VehiclesClient({ dict }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang || 'en';
    const t = useTranslation(dict);

    useEffect(() => {
        // Reemplaza esto por cómo obtienes el token en tu app
        const token = localStorage.getItem('token');
        fetch('http://localhost:8000/api/vehiculos', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => setVehicles(data))
            .catch(err => console.error(err));
    }, []);

    const userProfile = (
        <div className="flex items-center gap-3 px-2">
            <div className="bg-slate-200 dark:bg-slate-700 size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=5')" }}></div>
            <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-sm font-semibold">Alex Thompson</p>
                <p className="text-slate-500 text-xs">{t('dashboard.sidebar.role', 'Fleet Manager')}</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <Sidebar
                lang={lang}
                router={router}
                activePage="vehicles"
                t={t}
                userProfile={userProfile}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader
                    onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                    isMenuOpen={isMenuOpen}
                />

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">

                        {/* TÍTULO Y BOTÓN AÑADIR */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
                            <div className="flex flex-col gap-1 md:gap-2">
                                <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight">
                                    {t('vehicles.title', 'Vehicle Fleet')}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 font-medium">
                                    {t('vehicles.subtitle', 'Overview of all registered vehicles.')}
                                </p>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-3">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 px-3 py-1.5 rounded-lg">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vehicles.total_label', 'Total:')}</span>
                                    <span className="text-xs md:text-sm font-black text-primary">24</span>
                                </div>
                                <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 md:py-2.5 px-4 md:px-6 rounded-lg text-xs md:text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    {t('vehicles.add_btn', 'Add New')}
                                </button>
                            </div>
                        </div>

                        {/* BARRA DE BÚSQUEDA */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 md:mb-8 overflow-hidden">
                            <div className="p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                                <div className="w-full md:flex-1">
                                    <label className="flex items-center w-full bg-slate-100 dark:bg-slate-800 px-3 md:px-4 rounded-lg focus-within:ring-2 ring-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                        <input
                                            className="bg-transparent border-none focus:ring-0 text-xs md:text-sm w-full py-2 md:py-2.5 placeholder:text-slate-500"
                                            placeholder={t('vehicles.search_placeholder', 'Search...')}
                                            type="text"
                                        />
                                    </label>
                                </div>
                                <div className="flex w-full md:w-auto gap-2">
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider transition-colors hover:bg-slate-200">
                                        <span className="material-symbols-outlined text-sm">tune</span>
                                        {t('vehicles.filters', 'Filters')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* GRID DE VEHÍCULOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {vehicles.map((vehiculo) => (
                                <div key={vehiculo.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm border-b-4 border-b-primary">
                                    <div className="relative h-44 md:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <img
                                            alt={vehiculo.modelo?.nombre || 'Vehículo'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            src={vehiculo.imagen_url || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800"}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                                                {vehiculo.activo ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-5">
                                        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">
                                            {vehiculo.fecha_primera_matriculacion?.slice(0, 4) || 'Año'} {vehiculo.marca?.nombre} {vehiculo.modelo?.nombre}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">{t('vehicles.stats.mileage', 'Mileage')}</span>
                                                <span className="text-sm font-bold">{vehiculo.kilometros_recorridos} km</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase">{t('vehicles.stats.last_service', 'Last Service')}</span>
                                                <span className="text-sm font-bold">{vehiculo.ultima_fecha_itv || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Botón Añadir Nuevo */}
                            <button className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary min-h-[250px]">
                                <span className="material-symbols-outlined text-4xl">add_circle</span>
                                <p className="font-bold">{t('vehicles.add_btn', 'Add New Vehicle')}</p>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <MobileMenuOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                lang={lang}
                router={router}
                activePage="vehicles"
                t={t}
            />
        </div>
    );
}
