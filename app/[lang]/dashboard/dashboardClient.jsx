'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleResourcesApi } from '@/lib/api/vehicleResources';

export default function DashboardClient({ dict, lang }) {
    const { vehicles, loading: loadingVehicles } = useVehicles();
    const [reports, setReports] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);
    const [periodMode, setPeriodMode] = useState('month');
    const [periodDate, setPeriodDate] = useState(new Date().toISOString().slice(0, 7));
    const [year, setYear] = useState(String(new Date().getFullYear()));

    useEffect(() => {
        async function loadResources() {
            setLoadingResources(true);
            try {
                const [nextReports, nextMaintenances] = await Promise.all([
                    vehicleResourcesApi.listAllReports(),
                    vehicleResourcesApi.listAllMaintenances(),
                ]);
                setReports(Array.isArray(nextReports) ? nextReports : []);
                setMaintenances(Array.isArray(nextMaintenances) ? nextMaintenances : []);
            } finally {
                setLoadingResources(false);
            }
        }
        loadResources();
    }, []);

    const expenses = useMemo(() => buildExpenses(reports, maintenances), [maintenances, reports]);
    const visibleExpenses = useMemo(() => filterExpenses(expenses, periodMode, periodMode === 'month' ? periodDate : year), [expenses, periodDate, periodMode, year]);
    const chartData = useMemo(() => buildChartData(visibleExpenses, periodMode, periodMode === 'month' ? periodDate : year), [periodDate, periodMode, visibleExpenses, year]);
    const totalExpenses = visibleExpenses.reduce((sum, item) => sum + item.cost, 0);
    const upcomingItv = vehicles.filter((vehicle) => getDaysUntil(vehicle.ultima_fecha_itv) <= 30).length;

    return (
        <DashboardShell dict={dict} lang={lang} activePage="dashboard" contentClassName="max-w-7xl mx-auto p-4 lg:p-8">
            {({ t }) => (
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{t('dashboard.header.title', 'Panel principal')}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{vehicles.length} vehiculos, {reports.length} documentos y {maintenances.length} mantenimientos registrados.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setPeriodMode('month')} className={periodButton(periodMode === 'month')}>Mes</button>
                            <button onClick={() => setPeriodMode('year')} className={periodButton(periodMode === 'year')}>Ano</button>
                            {periodMode === 'month' ? (
                                <input type="month" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold" />
                            ) : (
                                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-28 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold" />
                            )}
                            <button onClick={() => exportExpenses(visibleExpenses, periodMode)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-sm">download</span>
                                {t('dashboard.actions.export', 'Exportar')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MiniStat icon="garage" label="Vehiculos" value={loadingVehicles ? '...' : vehicles.length} />
                        <MiniStat icon="description" label="Documentos" value={loadingResources ? '...' : reports.length} />
                        <MiniStat icon="build" label="Mantenimientos" value={loadingResources ? '...' : maintenances.length} />
                        <MiniStat icon="event_available" label="ITV proxima" value={upcomingItv} amber />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
                                <div className="min-w-0">
                                    <h3 className="font-black text-lg">Gastos {periodMode === 'month' ? 'del mes' : 'del ano'}</h3>
                                    <p className="text-xs sm:text-sm text-slate-500">Informes y mantenimientos de todos los coches.</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-2xl sm:text-3xl font-black leading-tight">{formatCurrency(totalExpenses)}</p>
                                    <p className="text-xs font-bold text-slate-400">{visibleExpenses.length} registros</p>
                                </div>
                            </div>
                            <ExpenseChart data={chartData} />
                        </section>

                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                            <h3 className="font-black text-lg mb-4">Distribucion</h3>
                            <DonutChart total={vehicles.length} warning={upcomingItv} />
                            <div className="mt-6 space-y-2">
                                <StatRow color="bg-emerald-500" label="Sin ITV cercana" value={Math.max(vehicles.length - upcomingItv, 0)} />
                                <StatRow color="bg-amber-400" label="ITV proxima o vencida" value={upcomingItv} />
                            </div>
                        </section>
                    </div>

                    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                        <h3 className="font-black text-lg mb-4">Ultimos gastos</h3>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {visibleExpenses.slice(0, 8).map((expense) => <ExpenseRow key={`${expense.type}-${expense.id}`} expense={expense} />)}
                            {visibleExpenses.length === 0 && <p className="text-sm text-slate-500">No hay gastos en este periodo.</p>}
                        </div>
                    </section>
                </div>
            )}
        </DashboardShell>
    );
}

function MiniStat({ icon, label, value, amber = false }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 size-10 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                <p className={`text-xl font-black ${amber ? 'text-amber-500' : ''}`}>{value}</p>
            </div>
        </div>
    );
}

function ExpenseChart({ data }) {
    const max = Math.max(...data.map((item) => item.value), 1);
    const width = 900;
    const height = 260;
    const points = data.map((item, index) => {
        const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
        const y = height - (item.value / max) * (height - 40) - 20;
        return { ...item, x, y };
    });
    const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const area = `${path} L ${width} ${height} L 0 ${height} Z`;

    return (
        <div className="h-56 sm:h-72 md:h-80 -mx-1 sm:mx-0">
            <svg viewBox={`0 0 ${width} ${height + 42}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <path d={area} fill="rgba(19,91,236,.12)" />
                <path d={path} fill="none" stroke="#135bec" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point, index) => (
                    <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="4" fill="#135bec" />
                        {(index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 6) === 0) && <text x={point.x} y={height + 26} textAnchor="middle" className="fill-slate-400 text-[16px] sm:text-[18px] font-bold">{point.label}</text>}
                    </g>
                ))}
            </svg>
        </div>
    );
}

function DonutChart({ total, warning }) {
    const safeTotal = Math.max(total, 1);
    const warningValue = Math.min((warning / safeTotal) * 100, 100);
    const activeValue = 100 - warningValue;
    return (
        <div className="relative mx-auto size-44">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle className="text-slate-100 dark:text-slate-800" cx="18" cy="18" fill="transparent" r="15.9" stroke="currentColor" strokeWidth="4" />
                <circle className="text-emerald-500" cx="18" cy="18" fill="transparent" r="15.9" stroke="currentColor" strokeDasharray={`${activeValue} 100`} strokeWidth="4" />
                <circle className="text-amber-400" cx="18" cy="18" fill="transparent" r="15.9" stroke="currentColor" strokeDasharray={`${warningValue} 100`} strokeDashoffset={`-${activeValue}`} strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{total}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Vehiculos</span>
            </div>
        </div>
    );
}

function StatRow({ color, label, value }) {
    return <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`size-2 rounded-full ${color}`} /><span className="text-xs text-slate-500">{label}</span></div><span className="text-xs font-bold">{value}</span></div>;
}

function ExpenseRow({ expense }) {
    return (
        <div className="py-3 grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_130px_110px_120px] gap-2 md:gap-4 items-center">
            <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-primary">{expense.type === 'mantenimiento' ? 'build' : expense.type === 'itv' ? 'verified' : 'description'}</span>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{expense.name}</p>
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{expense.vehicleName}</p>
            <span className="w-fit rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">{expense.type}</span>
            <p className="text-sm font-black text-slate-900 dark:text-white md:text-right">{formatCurrency(expense.cost)}</p>
            <p className="text-sm text-slate-500 md:text-right">{formatDate(expense.date)}</p>
        </div>
    );
}

function buildExpenses(reports, maintenances) {
    return [
        ...reports.map((item) => ({ id: item.id, type: /^itv\b/i.test(item.nombre || '') ? 'itv' : 'informe', name: item.nombre, vehicleName: getVehicleName(item.vehiculo), cost: Number(item.costo || 0), date: item.fecha_informe })),
        ...maintenances.map((item) => ({ id: item.id, type: 'mantenimiento', name: item.componente_cambiado, vehicleName: getVehicleName(item.vehiculo), cost: Number(item.costo || 0), date: item.fecha_cambio })),
    ].filter((item) => item.date).toSorted((a, b) => new Date(b.date) - new Date(a.date));
}

function getVehicleName(vehicle) {
    if (!vehicle) return 'N/A';
    const brand = vehicle.marca?.nombre || vehicle.marca || '';
    return `${brand} ${vehicle.modelo || ''}`.trim() || vehicle.matricula || 'Vehiculo';
}

function filterExpenses(expenses, mode, value) {
    return expenses.filter((expense) => {
        const date = new Date(expense.date);
        if (Number.isNaN(date.getTime())) return false;
        if (mode === 'year') return String(date.getFullYear()) === String(value);
        return date.toISOString().slice(0, 7) === value;
    });
}

function buildChartData(expenses, mode, value) {
    if (mode === 'year') {
        return Array.from({ length: 12 }, (_, index) => {
            const month = String(index + 1).padStart(2, '0');
            return { label: month, value: expenses.filter((expense) => new Date(expense.date).getMonth() === index).reduce((sum, item) => sum + item.cost, 0) };
        });
    }

    const [year, month] = value.split('-').map(Number);
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        return { label: String(day), value: expenses.filter((expense) => new Date(expense.date).getDate() === day).reduce((sum, item) => sum + item.cost, 0) };
    });
}

function exportExpenses(expenses, mode) {
    const rows = [['tipo', 'nombre', 'fecha', 'coste'], ...expenses.map((expense) => [expense.type, expense.name, expense.date, expense.cost])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gastos-${mode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function getDaysUntil(date) {
    if (!date) return Number.MAX_SAFE_INTEGER;
    const target = new Date(date);
    if (Number.isNaN(target.getTime())) return Number.MAX_SAFE_INTEGER;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
}

function periodButton(active) {
    return `rounded-lg px-4 py-2 text-sm font-bold ${active ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`;
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
}

function formatDate(date) {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('es-ES');
}
