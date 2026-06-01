'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleResourcesApi } from '@/lib/api/vehicleResources';
import { formatDistance, getDistanceUnit, subscribeToDistanceUnit } from '@/lib/preferences';

export default function VehicleHistoryClient({ dict, lang }) {
    const { vehicles } = useVehicles();
    const [reports, setReports] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [liquids, setLiquids] = useState([]);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const distanceUnit = useSyncExternalStore(subscribeToDistanceUnit, getDistanceUnit, () => 'km');

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            setError(null);
            try {
                const [nextReports, nextMaintenances, nextLiquids] = await Promise.all([
                    vehicleResourcesApi.listAllReports(),
                    vehicleResourcesApi.listAllMaintenances(),
                    vehicleResourcesApi.listAllLiquids(),
                ]);
                setReports(Array.isArray(nextReports) ? nextReports : []);
                setMaintenances(Array.isArray(nextMaintenances) ? nextMaintenances : []);
                setLiquids(Array.isArray(nextLiquids) ? nextLiquids : []);
            } catch (err) {
                setError(err.message || 'No se pudo cargar el historial.');
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, []);

    const records = useMemo(() => buildHistoryRecords(reports, maintenances, liquids), [liquids, maintenances, reports]);
    const filteredRecords = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return records.filter((record) => {
            const matchesType = typeFilter === 'all' || record.type === typeFilter;
            const matchesVehicle = vehicleFilter === 'all' || Number(record.vehicleId) === Number(vehicleFilter);
            const matchesQuery = !normalizedQuery || [record.title, record.description, record.vehicleName, record.type].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
            return matchesType && matchesVehicle && matchesQuery;
        });
    }, [query, records, typeFilter, vehicleFilter]);

    const totalCost = filteredRecords.reduce((sum, record) => sum + record.cost, 0);
    const totalDistance = vehicles.reduce((sum, vehicle) => sum + Number(vehicle.km_recorridos || 0), 0);

    const exportHistory = () => {
        const rows = [['tipo', 'titulo', 'vehiculo', 'fecha', 'distancia_km', 'coste', 'descripcion'], ...filteredRecords.map((record) => [record.type, record.title, record.vehicleName, record.date, record.km, record.cost, record.description])];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'historial-carhistorial.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardShell dict={dict} lang={lang} activePage="history" contentClassName="max-w-7xl mx-auto p-4 lg:p-8">
            {({ t }) => (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{t('features.history_title', 'Historial')}</h2>
                            <p className="text-sm text-slate-500 mt-1">{t('history.subtitle', 'Informes, mantenimientos y liquidos de todos tus vehiculos.')}</p>
                        </div>
                        <button onClick={exportHistory} className="bg-primary text-white font-bold py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-sm">download</span>
                            {t('dashboard.actions.export', 'Exportar')}
                        </button>
                    </div>

                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard icon="payments" label={t('history.stats.cost', 'Gasto filtrado')} value={formatCurrency(totalCost)} />
                        <StatCard icon="speed" label={t('history.stats.distance', 'Distancia total')} value={formatDistance(totalDistance, distanceUnit)} />
                        <StatCard icon="description" label={t('history.stats.documents', 'Documentos')} value={reports.length} />
                        <StatCard icon="build" label={t('history.stats.workshop', 'Registros taller')} value={maintenances.length + liquids.length} />
                    </div>

                    <HistoryTable t={t} query={query} setQuery={setQuery} typeFilter={typeFilter} setTypeFilter={setTypeFilter} vehicleFilter={vehicleFilter} setVehicleFilter={setVehicleFilter} vehicles={vehicles} loading={loading} records={filteredRecords} distanceUnit={distanceUnit} />
                </div>
            )}
        </DashboardShell>
    );
}
function HistoryTable({ t, query, setQuery, typeFilter, setTypeFilter, vehicleFilter, setVehicleFilter, vehicles, loading, records, distanceUnit }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
                <label className="flex items-center bg-slate-100 dark:bg-slate-800 px-4 rounded-lg focus-within:ring-2 ring-primary/20">
                    <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                    <input className="bg-transparent border-none outline-none text-sm w-full py-2.5" placeholder={t('history.search', 'Buscar en el historial...')} value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                <select className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="all">{t('history.filters.all_types', 'Todos los tipos')}</option>
                    <option value="informe">{t('history.filters.reports', 'Informes')}</option>
                    <option value="mantenimiento">{t('history.filters.maintenances', 'Mantenimientos')}</option>
                    <option value="liquido">{t('history.filters.liquids', 'Liquidos')}</option>
                </select>
                <select className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold" value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                    <option value="all">{t('history.filters.all_vehicles', 'Todos los vehiculos')}</option>
                    {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{getVehicleName(vehicle)}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('history.table.type', 'Tipo')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('history.table.record', 'Registro')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('history.table.vehicle', 'Vehiculo')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('history.table.date', 'Fecha')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{t('history.table.distance', 'Distancia')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">{t('history.table.cost', 'Coste')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading && <tr><td className="px-6 py-6 text-sm text-slate-500" colSpan="6">{t('history.loading', 'Cargando historial...')}</td></tr>}
                        {!loading && records.map((record) => <HistoryRow key={`${record.type}-${record.id}`} record={record} distanceUnit={distanceUnit} />)}
                        {!loading && records.length === 0 && <tr><td className="px-6 py-6 text-sm text-slate-500" colSpan="6">{t('history.empty', 'No hay registros con esos filtros.')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between mb-2"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p><span className="material-symbols-outlined text-slate-400">{icon}</span></div><p className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">{value}</p></div>;
}

function HistoryRow({ record, distanceUnit }) {
    return (
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase ${typeTone(record.type)}`}>{record.type}</span></td>
            <td className="px-6 py-4"><p className="text-sm font-bold">{record.title}</p><p className="text-xs text-slate-500">{record.description || 'Sin descripcion'}</p></td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{record.vehicleName}</td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(record.date)}</td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{record.km ? formatDistance(record.km, distanceUnit) : 'N/A'}</td>
            <td className="px-6 py-4 text-right text-sm font-black">{formatCurrency(record.cost)}</td>
        </tr>
    );
}
function buildHistoryRecords(reports, maintenances, liquids) {
    return [
        ...reports.map((item) => ({ id: item.id, type: 'informe', title: item.nombre, description: item.ruta_doc, vehicleId: item.vehiculo?.id, vehicleName: getVehicleName(item.vehiculo), date: item.fecha_informe, km: null, cost: Number(item.costo || 0) })),
        ...maintenances.map((item) => ({ id: item.id, type: 'mantenimiento', title: item.componente_cambiado, description: item.descripcion, vehicleId: item.vehiculo?.id, vehicleName: getVehicleName(item.vehiculo), date: item.fecha_cambio, km: item.km_cambiado, cost: Number(item.costo || 0) })),
        ...liquids.map((item) => ({ id: item.id, type: 'liquido', title: item.nombre, description: item.tipo, vehicleId: item.vehiculo?.id, vehicleName: getVehicleName(item.vehiculo), date: null, km: item.km_para_cambio, cost: 0 })),
    ].toSorted((a, b) => getDateValue(b.date) - getDateValue(a.date));
}

function getVehicleName(vehicle) {
    if (!vehicle) return 'N/A';
    const brand = vehicle.marca?.nombre || vehicle.marca || '';
    return `${brand} ${vehicle.modelo || ''}`.trim() || vehicle.matricula || 'Vehiculo';
}

function getDateValue(date) {
    if (!date) return 0;
    const parsed = new Date(date).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function typeTone(type) {
    if (type === 'informe') return 'bg-blue-50 text-blue-600';
    if (type === 'mantenimiento') return 'bg-amber-50 text-amber-600';
    return 'bg-emerald-50 text-emerald-600';
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
}

function formatDate(date) {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('es-ES');
}
