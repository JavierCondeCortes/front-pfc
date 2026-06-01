'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import AddVehicleModal from '@/components/AddVehicleModal';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useVehicles } from '@/hooks/useVehicles';
import { getVehiclePhoto } from '@/lib/vehiclePhotos';
import { formatDistance, getDistanceUnit, subscribeToDistanceUnit } from '@/lib/preferences';

const VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800';

const SORT_OPTIONS = {
    km_asc: { label: 'Km: menor a mayor', compare: (a, b) => getMileage(a) - getMileage(b) },
    km_desc: { label: 'Km: mayor a menor', compare: (a, b) => getMileage(b) - getMileage(a) },
    registration_desc: { label: 'Matriculacion reciente', compare: (a, b) => getDateValue(b.fecha_agregado) - getDateValue(a.fecha_agregado) },
    registration_asc: { label: 'Matriculacion antigua', compare: (a, b) => getDateValue(a.fecha_agregado) - getDateValue(b.fecha_agregado) },
    itv_asc: { label: 'ITV mas proxima', compare: (a, b) => getDateValue(getNextItvDate(a.ultima_fecha_itv)) - getDateValue(getNextItvDate(b.ultima_fecha_itv)) },
};

export default function VehiclesClient({ dict, lang }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('itv_asc');
    const distanceUnit = useSyncExternalStore(subscribeToDistanceUnit, getDistanceUnit, () => 'km');
    const { vehicles, loading, error, addVehicle, editVehicle, removeVehicle } = useVehicles();

    const visibleVehicles = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return vehicles
            .filter((vehicle) => {
                const brand = getBrandName(vehicle).toLowerCase();
                const model = String(vehicle.modelo || '').toLowerCase();
                return !query || brand.includes(query) || model.includes(query) || `${brand} ${model}`.includes(query);
            })
            .toSorted(SORT_OPTIONS[sortBy].compare);
    }, [searchTerm, sortBy, vehicles]);

    const openAddModal = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('add') === '1') {
            queueMicrotask(openAddModal);
        }
    }, []);

    const openEditModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleSaveVehicle = (payload) => (
        selectedVehicle ? editVehicle(payload) : addVehicle(payload)
    );

    const handleDeleteVehicle = async (id) => {
        setActionError(null);

        try {
            await removeVehicle(id);
        } catch (err) {
            setActionError(err.message || 'No se pudo eliminar el vehiculo.');
        }
    };

    return (
        <DashboardShell
            dict={dict}
            lang={lang}
            activePage="vehicles"
            contentClassName="max-w-7xl mx-auto p-4 md:p-8"
            onAddClick={openAddModal}
            profileName="Alex Thompson"
            profileAvatarSeed={5}
        >
            {({ t, router }) => (
                <>
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
                                <span className="text-xs md:text-sm font-black text-primary">{visibleVehicles.length}/{vehicles.length}</span>
                            </div>
                            <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 md:py-2.5 px-4 md:px-6 rounded-lg text-xs md:text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2" onClick={openAddModal}>
                                <span className="material-symbols-outlined text-sm">add</span>
                                {t('vehicles.add_btn', 'Add New')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 md:mb-8 overflow-hidden">
                        <div className="p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                            <label className="flex items-center w-full bg-slate-100 dark:bg-slate-800 px-3 md:px-4 rounded-lg focus-within:ring-2 ring-primary/20 transition-all">
                                <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                <input
                                    className="bg-transparent border-none focus:ring-0 text-xs md:text-sm w-full py-2 md:py-2.5 placeholder:text-slate-500"
                                    placeholder={t('vehicles.search_placeholder', 'Buscar por marca o modelo...')}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </label>
                            <label className="w-full md:w-auto relative flex items-center">
                                <span className="material-symbols-outlined pointer-events-none absolute left-3 text-sm text-slate-400">sort</span>
                                <select
                                    className="w-full md:min-w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-9 text-xs md:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value)}
                                >
                                    {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                                        <option key={value} value={value}>{option.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    {error && <ErrorBanner message={error} />}
                    {actionError && <ErrorBanner message={actionError} />}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {!loading && visibleVehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                t={t}
                                lang={lang}
                                router={router}
                                distanceUnit={distanceUnit}
                                onEdit={openEditModal}
                                onDelete={handleDeleteVehicle}
                            />
                        ))}

                        {loading && (
                            <div className="text-sm text-slate-500 font-semibold">{t('vehicles.loading', 'Cargando vehiculos...')}</div>
                        )}

                        {!loading && visibleVehicles.length === 0 && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-sm text-slate-500 font-semibold">
                                {t('vehicles.empty_search', 'No hay vehiculos que coincidan con la busqueda.')}
                            </div>
                        )}

                        <button className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary min-h-[250px]" onClick={openAddModal}>
                            <span className="material-symbols-outlined text-4xl">add_circle</span>
                            <p className="font-bold">{t('vehicles.add_btn', 'Add New Vehicle')}</p>
                        </button>
                    </div>

                    <AddVehicleModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        onSuccess={handleSaveVehicle}
                        vehicle={selectedVehicle}
                        t={t}
                    />
                </>
            )}
        </DashboardShell>
    );
}

function VehicleCard({ vehicle, t, lang, router, distanceUnit, onEdit, onDelete }) {
    const brand = getBrandName(vehicle);
    const model = vehicle.modelo || 'Vehiculo';
    const vehicleTitle = `${brand} ${model}`.trim();
    const mileage = getMileage(vehicle);
    const itvStatus = getItvStatus(vehicle.ultima_fecha_itv);
    const image = getVehiclePhoto(vehicle) || VEHICLE_IMAGE;

    const handleDelete = async (event) => {
        event.stopPropagation();
        if (!window.confirm(`${t('vehicles.confirm_delete', 'Eliminar')} ${vehicle.matricula || vehicleTitle}?`)) return;
        if (!vehicle.id) throw new Error('No se puede eliminar un vehiculo sin id.');
        await onDelete(Number(vehicle.id));
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/${lang}/dashboard/vehicles/${vehicle.id}`)}
            onKeyDown={(event) => event.key === 'Enter' && router.push(`/${lang}/dashboard/vehicles/${vehicle.id}`)}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img alt={vehicleTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent">
                    <p className="text-white text-xl font-black leading-tight">{vehicleTitle}</p>
                    <p className="text-slate-200 text-xs font-bold tracking-wider uppercase">{vehicle.matricula || 'Sin matricula'}</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <InfoTile icon="speed" label={t('vehicles.stats.mileage', 'Kilometraje')} value={formatDistance(mileage, distanceUnit)} />
                    <InfoTile icon="eco" label={t('vehicles.fields.fuel', 'Combustible')} value={vehicle.tipo_combustible || 'N/A'} />
                    <InfoTile icon="verified" label={t('vehicles.fields.sticker', 'Pegatina')} value={vehicle.pegatina || 'N/A'} />
                    <InfoTile icon="event_available" label={t('vehicles.fields.next_itv', 'Prox. ITV')} value={formatDate(getNextItvDate(vehicle.ultima_fecha_itv))} tone={itvStatus.tone} />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t('vehicles.fields.itv_status', 'Estado ITV')}</p>
                        <p className={`text-xs font-black ${itvStatus.className}`}>{itvStatus.label}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t('vehicles.fields.last_itv', 'Ultima ITV')}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatDate(vehicle.ultima_fecha_itv)}</p>
                    </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button onClick={(event) => { event.stopPropagation(); onEdit(vehicle); }} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        {t('common.edit', 'Editar')}
                    </button>
                    <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">
                        <span className="material-symbols-outlined text-sm">delete</span>
                        {t('common.delete', 'Eliminar')}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoTile({ icon, label, value, tone }) {
    return (
        <div className={`rounded-lg border border-slate-100 dark:border-slate-800 p-3 ${tone || 'bg-white dark:bg-slate-900'}`}>
            <div className="flex items-center gap-1 text-slate-400 mb-1">
                <span className="material-symbols-outlined text-sm">{icon}</span>
                <span className="text-[9px] font-bold uppercase">{label}</span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{value}</p>
        </div>
    );
}

function ErrorBanner({ message }) {
    return (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {message}
        </div>
    );
}

function getBrandName(vehicle) {
    return vehicle.marca?.nombre || vehicle.marca || '';
}

function getMileage(vehicle) {
    return Number(vehicle.km_recorridos ?? vehicle.kilometros_recorridos ?? 0);
}

function getDateValue(date) {
    if (!date) return Number.MAX_SAFE_INTEGER;
    const value = new Date(date).getTime();
    return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function getNextItvDate(date) {
    if (!date) return null;
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return null;
    value.setFullYear(value.getFullYear() + 1);
    return value;
}

function formatDate(date) {
    if (!date) return 'N/A';
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 'N/A';
    return value.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getItvStatus(date) {
    const nextItv = getNextItvDate(date);
    const value = nextItv?.getTime();
    if (!value) {
        return { label: 'Sin fecha', className: 'text-slate-500', tone: 'bg-slate-50 dark:bg-slate-800/40' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((value - today.getTime()) / 86400000);

    if (diffDays < 0) return { label: 'ITV vencida', className: 'text-red-600', tone: 'bg-red-50 dark:bg-red-900/20' };
    if (diffDays <= 30) return { label: `${diffDays} dias`, className: 'text-amber-600', tone: 'bg-amber-50 dark:bg-amber-900/20' };
    return { label: `${diffDays} dias`, className: 'text-emerald-600', tone: 'bg-emerald-50 dark:bg-emerald-900/20' };
}
