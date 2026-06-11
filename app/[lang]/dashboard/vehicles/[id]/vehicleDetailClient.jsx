'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleResources } from '@/hooks/useVehicleResources';
import { getVehiclePhoto } from '@/lib/vehiclePhotos';
import { getResourceAttachment, readAttachmentFile, saveResourceAttachment } from '@/lib/resourceAttachments';
import { assignResourceToFolder, countFolderLinks, getFolderLinks } from '@/lib/resourceFolders';
import { formatDistance, getDistanceUnit, subscribeToDistanceUnit } from '@/lib/preferences';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';

export default function VehicleDetailClient({ dict, lang, vehicleId }) {
    const { vehicles, loading: loadingVehicles, editVehicle, loadVehicles } = useVehicles();
    const vehicle = useMemo(() => vehicles.find((item) => Number(item.id) === Number(vehicleId)), [vehicleId, vehicles]);
    const resources = useVehicleResources(vehicleId);
    const [activeForm, setActiveForm] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [message, setMessage] = useState(null);
    const distanceUnit = useSyncExternalStore(subscribeToDistanceUnit, getDistanceUnit, () => 'km');
    const image = getVehiclePhoto(vehicle) || FALLBACK_IMAGE;

    const brand = vehicle?.marca?.nombre || vehicle?.marca || '';
    const title = `${brand} ${vehicle?.modelo || ''}`.trim() || dict?.vehicleDetail?.fallbackTitle || 'Vehiculo';

    const submitAction = async (action) => {
        setMessage(null);
        try {
            await action();
            setActiveForm(null);
            setMessage(dict.vehicleDetail.messages.saved);
        } catch (error) {
            setMessage(error.message || dict.vehicleDetail.messages.error);
        }
    };

    return (
        <DashboardShell dict={dict} lang={lang} activePage="vehicles" contentClassName="max-w-7xl mx-auto p-4 md:p-8" profileName="Alex Thompson" profileAvatarSeed={5}>
            {({ t, router }) => (
                <div className="space-y-6">
                    <button onClick={() => router.push(`/${lang}/dashboard/vehicles`)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        {t('vehicleDetail.back', 'Volver a vehiculos')}
                    </button>

                    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-stretch">
                        <div className="min-h-72 rounded-xl overflow-hidden relative bg-slate-900">
                            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-75" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                            <div className="absolute left-6 right-6 bottom-6">
                                <button onClick={() => router.push(`/${lang}/dashboard/vehicles`)} className="text-left">
                                    <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">{title}</h1>
                                </button>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Badge icon="confirmation_number" label={vehicle?.matricula || t('vehicleDetail.emptyPlate', 'Sin matricula')} />
                                    <Badge icon="speed" label={formatDistance(vehicle?.km_recorridos || 0, distanceUnit)} />
                                    <Badge icon="event_available" label={formatDate(vehicle?.ultima_fecha_itv)} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                            <h2 className="text-lg font-black">{t('vehicleDetail.quickActions', 'Acciones rapidas')}</h2>
                            <ActionButton icon="opacity" label={t('vehicleDetail.actions.addLiquid', 'Agregar liquido')} onClick={() => setActiveForm({ type: 'liquid' })} />
                            <ActionButton icon="description" label={t('vehicleDetail.actions.addDocument', 'Agregar documento')} onClick={() => setActiveForm({ type: 'report' })} />
                            <ActionButton icon="verified" label={t('vehicleDetail.actions.addItv', 'Registrar ITV')} onClick={() => setActiveForm({ type: 'itv' })} />
                            <ActionButton icon="build" label={t('vehicleDetail.actions.addMaintenance', 'Agregar mantenimiento')} onClick={() => setActiveForm({ type: 'maintenance' })} />
                            <ActionButton icon="create_new_folder" label={t('vehicleDetail.actions.addFolder', 'Crear carpeta')} onClick={() => setActiveForm({ type: 'folder' })} />
                        </div>
                    </section>

                    {message && <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm font-bold text-primary">{message}</div>}
                    {resources.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">{resources.error}</div>}

                    {activeForm?.type === 'liquid' && <LiquidForm t={t} item={activeForm.item} folders={resources.folders} onCancel={() => setActiveForm(null)} onSubmit={(payload, attachment, folderId) => submitAction(async () => {
                        const savedLiquid = activeForm.item ? (await resources.editLiquid(payload), activeForm.item) : await resources.addLiquid(payload);
                        saveResourceAttachment('liquid', savedLiquid || payload, attachment);
                        if (folderId && savedLiquid?.id) assignResourceToFolder(folderId, 'liquid', savedLiquid.id);
                    })} />}

                    {activeForm?.type === 'report' && <ReportForm t={t} item={activeForm.item} folders={resources.folders} onCancel={() => setActiveForm(null)} onSubmit={(payload, folderId, attachment) => submitAction(async () => {
                        const savedReport = activeForm.item ? (await resources.editReport(payload), activeForm.item) : await resources.addReport(payload);
                        saveResourceAttachment('report', savedReport || payload, attachment);
                        if (folderId && savedReport?.id) await resources.linkReportToFolder(folderId, savedReport.id);
                    })} />}

                    {activeForm?.type === 'itv' && <ItvForm t={t} vehicle={vehicle} folders={resources.folders} onCancel={() => setActiveForm(null)} onSubmit={(payload, folderId, attachment) => submitAction(async () => {
                        const savedReport = await resources.addReport(payload);
                        saveResourceAttachment('report', savedReport || payload, { ...(attachment || {}), specialType: 'itv', itvDate: payload.fecha_informe });
                        if (folderId && savedReport?.id) await resources.linkReportToFolder(folderId, savedReport.id);
                        await editVehicle({
                            id: Number(vehicle.id),
                            marca: vehicle.marca?.id ? { id: Number(vehicle.marca.id) } : vehicle.marca,
                            modelo: vehicle.modelo,
                            km_recorridos: Number(vehicle.km_recorridos || 0),
                            pegatina: vehicle.pegatina,
                            tipo_combustible: vehicle.tipo_combustible,
                            ultima_fecha_itv: payload.fecha_informe,
                        });
                        await loadVehicles();
                    })} />}

                    {activeForm?.type === 'maintenance' && <MaintenanceForm t={t} item={activeForm.item} folders={resources.folders} onCancel={() => setActiveForm(null)} onSubmit={(payload, attachment, folderId) => submitAction(async () => {
                        const savedMaintenance = activeForm.item ? (await resources.editMaintenance(payload), activeForm.item) : await resources.addMaintenance(payload);
                        saveResourceAttachment('maintenance', savedMaintenance || payload, attachment);
                        if (folderId && savedMaintenance?.id) assignResourceToFolder(folderId, 'maintenance', savedMaintenance.id);
                    })} />}

                    {activeForm?.type === 'folder' && <FolderForm t={t} item={activeForm.item} onCancel={() => setActiveForm(null)} onSubmit={(payload) => submitAction(() => activeForm.item ? resources.editFolder(payload) : resources.addFolder(payload))} />}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <ResourcePanel title={t('vehicleDetail.sections.liquids', 'Liquidos')} icon="opacity" items={resources.liquids} loading={resources.loading || loadingVehicles} empty={t('vehicleDetail.empty.liquids', 'Sin liquidos registrados')}>
                            {(item) => {
                                const attachment = getResourceAttachment('liquid', item);
                                const localData = parseAttachment(attachment);
                                return <ResourceRow title={item.nombre} meta={`${item.tipo || 'N/A'} - ${formatDistance(item.km_para_cambio || 0, distanceUnit)} - ${formatDate(localData?.fecha_cambio_actual)}`} attachment={attachment} onEdit={() => setActiveForm({ type: 'liquid', item })} onDelete={() => submitAction(() => resources.removeLiquid(item.id))} />;
                            }}
                        </ResourcePanel>

                        <ResourcePanel title={t('vehicleDetail.sections.documents', 'Documentos')} icon="description" items={resources.reports} loading={resources.loading} empty={t('vehicleDetail.empty.documents', 'Sin documentos registrados')}>
                            {(item) => {
                                const attachment = parseAttachment(getResourceAttachment('report', item));
                                const isItv = attachment?.specialType === 'itv' || /^itv\b/i.test(item.nombre || '');
                                return <ResourceRow title={item.nombre} meta={`${isItv ? 'ITV - ' : ''}${item.ruta_doc || 'N/A'} - ${formatCurrency(item.costo)} - ${formatDate(item.fecha_informe)}`} attachment={getResourceAttachment('report', item)} onEdit={() => setActiveForm({ type: 'report', item })} onDelete={() => submitAction(() => resources.removeReport(item.id))} />;
                            }}
                        </ResourcePanel>

                        <ResourcePanel title={t('vehicleDetail.sections.maintenance', 'Mantenimientos')} icon="build" items={resources.maintenances} loading={resources.loading} empty={t('vehicleDetail.empty.maintenance', 'Sin mantenimientos registrados')}>
                            {(item) => <ResourceRow title={item.componente_cambiado} meta={`${formatDistance(item.km_cambiado || 0, distanceUnit)} - ${formatDate(item.fecha_cambio)} - ${formatCurrency(item.costo)}`} attachment={getResourceAttachment('maintenance', item)} onEdit={() => setActiveForm({ type: 'maintenance', item })} onDelete={() => submitAction(() => resources.removeMaintenance(item.id))} />}
                        </ResourcePanel>
                    </div>

                    <ResourcePanel title={t('vehicleDetail.sections.folders', 'Carpetas')} icon="folder" items={resources.folders} loading={resources.loading} empty={t('vehicleDetail.empty.folders', 'Sin carpetas creadas')}>
                        {(item) => <ResourceRow title={item.nombre} meta={`${(item.informes?.length || 0) + countFolderLinks(item.id)} recursos`} onOpen={() => setSelectedFolder(item)} />}
                    </ResourcePanel>

                    {selectedFolder && (
                        <FolderContentModal
                            folder={selectedFolder}
                            resources={resources}
                            t={t}
                            onClose={() => setSelectedFolder(null)}
                            onEdit={() => {
                                setActiveForm({ type: 'folder', item: selectedFolder });
                                setSelectedFolder(null);
                            }}
                            onDelete={() => submitAction(async () => {
                                await resources.removeFolder(selectedFolder.id);
                                setSelectedFolder(null);
                            })}
                        />
                    )}
                </div>
            )}
        </DashboardShell>
    );
}

function ActionButton({ icon, label, onClick }) {
    return <button onClick={onClick} className="w-full flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-left text-sm font-bold hover:border-primary hover:text-primary"><span className="material-symbols-outlined">{icon}</span>{label}</button>;
}

function Badge({ icon, label }) {
    return <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"><span className="material-symbols-outlined text-sm">{icon}</span>{label}</span>;
}

function ResourcePanel({ title, icon, items, loading, empty, children }) {
    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-primary">{icon}</span><h2 className="font-black">{title}</h2></div>
            <div className="space-y-3">
                {loading && <p className="text-sm text-slate-500">Cargando...</p>}
                {!loading && items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}
                {!loading && items.map((item) => <div key={item.id}>{children(item)}</div>)}
            </div>
        </section>
    );
}

function ResourceRow({ title, meta, attachment, onEdit, onDelete, onOpen }) {
    const parsedAttachment = parseAttachment(attachment);
    return (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {onOpen ? (
                        <button type="button" onClick={onOpen} className="text-left text-sm font-black text-slate-900 hover:text-primary dark:text-white">
                            {title || 'N/A'}
                        </button>
                    ) : (
                        <p className="text-sm font-black text-slate-900 dark:text-white">{title || 'N/A'}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{meta}</p>
                    {parsedAttachment?.dataUrl && <a href={parsedAttachment.dataUrl} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"><span className="material-symbols-outlined text-sm">attach_file</span>{parsedAttachment.name}</a>}
                </div>
                {(onEdit || onDelete) && <div className="flex gap-1 shrink-0">
                    {onEdit && <button onClick={onEdit} className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-base">edit</span></button>}
                    {onDelete && <button onClick={onDelete} className="p-2 rounded-lg bg-white dark:bg-slate-900 text-red-500 hover:bg-red-50"><span className="material-symbols-outlined text-base">delete</span></button>}
                </div>}
            </div>
        </div>
    );
}

function PanelForm({ title, children, onCancel }) {
    return <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-black">{title}</h2><button onClick={onCancel} className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined">close</span></button></div>{children}</section>;
}

function Field({ label, children }) {
    return <label className="flex flex-col gap-1 text-xs font-bold uppercase text-slate-400">{label}{children}</label>;
}

function FormError({ message }) {
    return <div className="md:col-span-full rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm font-bold text-red-600">{message}</div>;
}

function AttachmentField({ t, onChange }) {
    return <Field label={t('vehicleDetail.fields.attachment', 'Adjunto')}><input type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => onChange(e.target.files?.[0] || null)} className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" /></Field>;
}

const inputClass = 'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary';

function LiquidForm({ t, item, folders, onSubmit, onCancel }) {
    const [form, setForm] = useState({ id: item?.id, nombre: item?.nombre || '', tipo: item?.tipo || '', km_para_cambio: item?.km_para_cambio || '', fecha_cambio_actual: '', carpetaId: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = validateResourceForm({ required: [[form.nombre, t('vehicleDetail.errors.liquidName', 'Indica el nombre del producto.')], [form.tipo, t('vehicleDetail.errors.liquidType', 'Indica el tipo de liquido.')]], numbers: [[form.km_para_cambio, t('vehicleDetail.errors.km', 'Los kilometros deben ser un numero mayor o igual a 0.')]], dates: [[form.fecha_cambio_actual, t('vehicleDetail.errors.datePast', 'La fecha de cambio no puede ser futura.')]] });
        if (validation) return setError(validation);
        setError(null);
        const attachment = await readAttachmentFile(file);
        onSubmit({ id: form.id, nombre: form.nombre, tipo: form.tipo, km_para_cambio: Number(form.km_para_cambio || 0), tiempo_para_cambio: item?.tiempo_para_cambio || 0 }, { ...(attachment || {}), fecha_cambio_actual: form.fecha_cambio_actual }, form.carpetaId);
    };
    return <PanelForm title={t('vehicleDetail.forms.liquid', 'Agregar liquido')} onCancel={onCancel}><form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleSubmit}>{error && <FormError message={error} />}<Field label={t('vehicleDetail.fields.productName', 'Nombre producto')}><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.liquidType', 'Tipo liquido')}><input className={inputClass} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.changeKmDone', 'Km cambio realizado')}><input type="number" className={inputClass} value={form.km_para_cambio} onChange={(e) => setForm({ ...form, km_para_cambio: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.currentChangeDate', 'Fecha cambio actual')}><input type="date" className={inputClass} value={form.fecha_cambio_actual} onChange={(e) => setForm({ ...form, fecha_cambio_actual: e.target.value })} /></Field><FolderSelect folders={folders} value={form.carpetaId} onChange={(carpetaId) => setForm({ ...form, carpetaId })} /><AttachmentField t={t} onChange={setFile} /><SubmitButton label={t('vehicleDetail.actions.save', 'Guardar')} /></form></PanelForm>;
}

function ReportForm({ t, item, folders, onSubmit, onCancel }) {
    const [form, setForm] = useState({ id: item?.id, nombre: item?.nombre || '', descripcion: item?.ruta_doc || '', costo: item?.costo || '', fecha_informe: normalizeDate(item?.fecha_informe), carpetaId: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = validateResourceForm({ required: [[form.nombre, t('vehicleDetail.errors.documentTitle', 'Indica el titulo del documento.')]], numbers: [[form.costo, t('vehicleDetail.errors.cost', 'El coste debe ser un numero mayor o igual a 0.')]], dates: [[form.fecha_informe, t('vehicleDetail.errors.datePast', 'La fecha de cambio no puede ser futura.')]] });
        if (validation) return setError(validation);
        setError(null);
        const attachment = await readAttachmentFile(file);
        onSubmit({ id: form.id, nombre: form.nombre, ruta_doc: attachment?.name || form.descripcion || item?.ruta_doc || form.nombre, costo: Number(form.costo || 0), fecha_informe: form.fecha_informe || null }, form.carpetaId, attachment);
    };
    return <PanelForm title={t('vehicleDetail.forms.document', 'Agregar documento')} onCancel={onCancel}><form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleSubmit}>{error && <FormError message={error} />}<Field label={t('vehicleDetail.fields.title', 'Titulo')}><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.description', 'Descripcion')}><input className={inputClass} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.cost', 'Coste')}><input type="number" step="0.01" className={inputClass} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.changeDate', 'Fecha cambio')}><input type="date" className={inputClass} value={form.fecha_informe} onChange={(e) => setForm({ ...form, fecha_informe: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.folder', 'Carpeta')}><select className={inputClass} value={form.carpetaId} onChange={(e) => setForm({ ...form, carpetaId: e.target.value })}><option value="">Sin carpeta</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.nombre}</option>)}</select></Field><AttachmentField t={t} onChange={setFile} /><SubmitButton label={t('vehicleDetail.actions.save', 'Guardar')} /></form></PanelForm>;
}

function ItvForm({ t, vehicle, folders, onSubmit, onCancel }) {
    const lastItv = normalizeDate(vehicle?.ultima_fecha_itv);
    const [form, setForm] = useState({ nombre: 'ITV', descripcion: '', costo: '', fecha_informe: new Date().toISOString().slice(0, 10), carpetaId: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = validateResourceForm({
            required: [[form.nombre, t('vehicleDetail.errors.documentTitle', 'Indica el titulo del documento.')], [form.fecha_informe, 'Indica la fecha de la ITV.']],
            numbers: [[form.costo, t('vehicleDetail.errors.cost', 'El coste debe ser un numero mayor o igual a 0.')]],
            dates: [[form.fecha_informe, t('vehicleDetail.errors.datePast', 'La fecha de ITV no puede ser futura.')]],
        }) || validateItvDate(form.fecha_informe, lastItv);
        if (validation) return setError(validation);
        setError(null);
        const attachment = await readAttachmentFile(file);
        onSubmit({ nombre: form.nombre.trim(), ruta_doc: attachment?.url || attachment?.name || form.descripcion || form.nombre, costo: Number(form.costo || 0), fecha_informe: form.fecha_informe }, form.carpetaId, attachment);
    };

    return <PanelForm title={t('vehicleDetail.forms.itv', 'Registrar ITV')} onCancel={onCancel}><form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleSubmit}>{error && <FormError message={error} />}<Field label={t('vehicleDetail.fields.title', 'Titulo')}><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.description', 'Descripcion')}><input className={inputClass} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.cost', 'Coste')}><input type="number" step="0.01" className={inputClass} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.itvDate', 'Fecha ITV')}><input type="date" max={new Date().toISOString().slice(0, 10)} min={lastItv || undefined} className={inputClass} value={form.fecha_informe} onChange={(e) => setForm({ ...form, fecha_informe: e.target.value })} /></Field><FolderSelect folders={folders} value={form.carpetaId} onChange={(carpetaId) => setForm({ ...form, carpetaId })} /><AttachmentField t={t} onChange={setFile} /><SubmitButton label={t('vehicleDetail.actions.save', 'Guardar')} /></form></PanelForm>;
}

function MaintenanceForm({ t, item, folders, onSubmit, onCancel }) {
    const [form, setForm] = useState({ id: item?.id, componente_cambiado: item?.componente_cambiado || '', descripcion: item?.descripcion || '', km_cambiado: item?.km_cambiado || '', costo: item?.costo || '', fecha_cambio: normalizeDate(item?.fecha_cambio), carpetaId: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = validateResourceForm({ required: [[form.componente_cambiado, t('vehicleDetail.errors.component', 'Indica el componente cambiado.')]], numbers: [[form.km_cambiado, t('vehicleDetail.errors.km', 'Los kilometros deben ser un numero mayor o igual a 0.')], [form.costo, t('vehicleDetail.errors.cost', 'El coste debe ser un numero mayor o igual a 0.')]], dates: [[form.fecha_cambio, t('vehicleDetail.errors.datePast', 'La fecha de cambio no puede ser futura.')]] });
        if (validation) return setError(validation);
        setError(null);
        onSubmit({ id: form.id, componente_cambiado: form.componente_cambiado, descripcion: form.descripcion, km_cambiado: Number(form.km_cambiado || 0), costo: Number(form.costo || 0), fecha_cambio: form.fecha_cambio || null }, await readAttachmentFile(file), form.carpetaId);
    };
    return <PanelForm title={t('vehicleDetail.forms.maintenance', 'Agregar mantenimiento')} onCancel={onCancel}><form className="grid grid-cols-1 md:grid-cols-7 gap-3" onSubmit={handleSubmit}>{error && <FormError message={error} />}<Field label={t('vehicleDetail.fields.component', 'Componente')}><input className={inputClass} value={form.componente_cambiado} onChange={(e) => setForm({ ...form, componente_cambiado: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.description', 'Descripcion')}><input className={inputClass} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.changeKmDone', 'Km cambio realizado')}><input type="number" className={inputClass} value={form.km_cambiado} onChange={(e) => setForm({ ...form, km_cambiado: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.cost', 'Coste')}><input type="number" step="0.01" className={inputClass} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></Field><Field label={t('vehicleDetail.fields.changeDate', 'Fecha cambio')}><input type="date" className={inputClass} value={form.fecha_cambio} onChange={(e) => setForm({ ...form, fecha_cambio: e.target.value })} /></Field><FolderSelect folders={folders} value={form.carpetaId} onChange={(carpetaId) => setForm({ ...form, carpetaId })} /><AttachmentField t={t} onChange={setFile} /><SubmitButton label={t('vehicleDetail.actions.save', 'Guardar')} /></form></PanelForm>;
}

function FolderForm({ t, item, onSubmit, onCancel }) {
    const [nombre, setNombre] = useState(item?.nombre || '');
    return <PanelForm title={t('vehicleDetail.forms.folder', 'Crear carpeta')} onCancel={onCancel}><form className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit({ id: item?.id, nombre }); }}><Field label={t('vehicleDetail.fields.name', 'Nombre')}><input required className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} /></Field><SubmitButton label={t('vehicleDetail.actions.save', 'Guardar')} /></form></PanelForm>;
}

function FolderSelect({ folders, value, onChange }) {
    return <Field label="Carpeta"><select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Sin carpeta</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.nombre}</option>)}</select></Field>;
}

function FolderContentModal({ folder, resources, t, onClose, onEdit, onDelete }) {
    const informes = Array.isArray(folder.informes) ? folder.informes : [];
    const linked = getFolderLinks(folder.id).map((link) => {
        const source = link.type === 'liquid' ? resources.liquids : resources.maintenances;
        const item = source.find((entry) => Number(entry.id) === Number(link.resourceId));
        return item ? { type: link.type, item } : null;
    }).filter(Boolean);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center sm:items-center">
                <div className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400">{t('vehicleDetail.sections.folders', 'Carpetas')}</p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{folder.nombre}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined">close</span></button>
                    </div>

                    <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                    {informes.length === 0 && linked.length === 0 && <p className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-500">No hay recursos vinculados a esta carpeta.</p>}
                    {informes.map((informe) => (
                        <div key={informe.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate">{informe.nombre}</p>
                                <p className="text-xs text-slate-500">{informe.ruta_doc || 'Sin archivo'} - {formatCurrency(informe.costo)}</p>
                            </div>
                            {informe.ruta_doc && <a href={informe.ruta_doc} target="_blank" className="text-primary"><span className="material-symbols-outlined">visibility</span></a>}
                        </div>
                    ))}
                    {linked.map(({ type, item }) => (
                        <div key={`${type}-${item.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate">{type === 'liquid' ? item.nombre : item.componente_cambiado}</p>
                                <p className="text-xs text-slate-500">{type === 'liquid' ? 'Liquido' : 'Mantenimiento'}</p>
                            </div>
                        </div>
                    ))}
                    </div>

                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                        <button onClick={onEdit} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold">Renombrar</button>
                        <button onClick={onDelete} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmitButton({ label }) {
    return <button className="self-end rounded-lg bg-primary px-5 py-2 text-sm font-black text-white">{label}</button>;
}

function validateResourceForm({ required = [], numbers = [], dates = [] }) {
    const missing = required.find(([value]) => !String(value || '').trim());
    if (missing) return missing[1];
    const badNumber = numbers.find(([value]) => value !== '' && (Number.isNaN(Number(value)) || Number(value) < 0));
    if (badNumber) return badNumber[1];
    const badDate = dates.find(([value]) => value && (Number.isNaN(new Date(value).getTime()) || new Date(value) > new Date()));
    if (badDate) return badDate[1];
    return null;
}

function validateItvDate(date, previousDate) {
    if (!date) return 'Indica la fecha de la ITV.';
    const next = new Date(date);
    if (Number.isNaN(next.getTime())) return 'La fecha de ITV no es valida.';
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (next > today) return 'La fecha de ITV no puede ser posterior a la fecha actual.';
    if (previousDate) {
        const previous = new Date(previousDate);
        if (!Number.isNaN(previous.getTime()) && next < previous) return 'La nueva ITV no puede ser anterior a la ITV anterior.';
    }
    return null;
}

function parseAttachment(attachment) {
    if (!attachment) return null;
    try {
        return JSON.parse(attachment);
    } catch {
        return null;
    }
}

function normalizeDate(date) {
    if (!date) return '';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function formatDate(date) {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('es-ES');
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
}
