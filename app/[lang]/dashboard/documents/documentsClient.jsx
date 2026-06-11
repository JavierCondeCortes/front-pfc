'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useVehicles } from '@/hooks/useVehicles';
import { vehicleResourcesApi } from '@/lib/api/vehicleResources';
import { uploadFile } from '@/lib/uploadFile';
import { assignResourceToFolder, countFolderLinks, getFolderLinks } from '@/lib/resourceFolders';
import { getResourceAttachment } from '@/lib/resourceAttachments';

export default function VehicleDocumentsVault({ dict, lang }) {
    const { vehicles } = useVehicles();
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [liquids, setLiquids] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [folderFilter, setFolderFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeDocument, setActiveDocument] = useState(null);
    const [folderForm, setFolderForm] = useState(null);
    const [resourceFolderForm, setResourceFolderForm] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [nextDocuments, nextFoldersRaw, nextLiquids, nextMaintenances] = await Promise.all([
                vehicleResourcesApi.listAllReports(),
                vehicleResourcesApi.listFolders(),
                vehicleResourcesApi.listAllLiquids(),
                vehicleResourcesApi.listAllMaintenances(),
            ]);
            const baseFolders = Array.isArray(nextFoldersRaw) ? nextFoldersRaw : [];
            const nextFolders = await Promise.all(baseFolders.map(async (folder) => {
                try {
                    return await vehicleResourcesApi.getFolderContent(folder.id);
                } catch {
                    return folder;
                }
            }));
            setDocuments(Array.isArray(nextDocuments) ? nextDocuments : []);
            setFolders(nextFolders);
            setLiquids(Array.isArray(nextLiquids) ? nextLiquids : []);
            setMaintenances(Array.isArray(nextMaintenances) ? nextMaintenances : []);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los documentos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const allResources = useMemo(() => [
        ...documents.map((item) => normalizeResource('report', item)),
        ...liquids.map((item) => normalizeResource('liquid', item)),
        ...maintenances.map((item) => normalizeResource('maintenance', item)),
    ], [documents, liquids, maintenances]);

    const filteredDocuments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return allResources.filter((document) => {
            const matchesQuery = !normalizedQuery || [document.title, document.description, document.kind, document.fileType, document.vehicleName].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
            const matchesType = typeFilter === 'all' || document.kind === typeFilter || document.fileType === typeFilter;
            const matchesFolder = folderFilter === 'all' || isResourceInFolder(folders, folderFilter, document);
            return matchesQuery && matchesType && matchesFolder;
        }).toSorted((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [allResources, folders, folderFilter, query, typeFilter]);

    const handleFile = (file) => {
        if (file) setSelectedFile(file);
    };

    const handleDeleteResource = async (resource) => {
        try {
            if (resource.kind === 'liquid') await vehicleResourcesApi.deleteLiquid(resource.id);
            else if (resource.kind === 'maintenance') await vehicleResourcesApi.deleteMaintenance(resource.id);
            else await vehicleResourcesApi.deleteReport(resource.id);
            await loadData();
        } catch (err) {
            setError(err.message || 'No se pudo eliminar el recurso.');
        }
    };

    const handleSaveFolder = async (payload) => {
        try {
            await (payload.id ? vehicleResourcesApi.updateFolder(payload) : vehicleResourcesApi.createFolder(payload));
            setFolderForm(null);
            await loadData();
        } catch (err) {
            setError(err.message || 'No se pudo guardar la carpeta.');
        }
    };

    const handleDeleteFolder = async (id) => {
        try {
            await vehicleResourcesApi.deleteFolder(id);
            await loadData();
        } catch (err) {
            setError(err.message || 'No se pudo eliminar la carpeta.');
        }
    };

    const handleUploadDocument = async (payload) => {
        try {
            const uploaded = await uploadFile(selectedFile, 'documents');
            const saved = await vehicleResourcesApi.createReport({
                nombre: payload.nombre,
                ruta_doc: uploaded.url,
                costo: Number(payload.costo || 0),
                fecha_informe: payload.fecha_informe || null,
                vehiculo: { id: Number(payload.vehiculoId) },
            });
            const allReports = await vehicleResourcesApi.listAllReports();
            const created = typeof saved === 'object' ? saved : (Array.isArray(allReports) ? allReports.find((item) => item.ruta_doc === uploaded.url || item.nombre === payload.nombre) : null);
            if (payload.carpetaId && created?.id) {
                await vehicleResourcesApi.linkReportToFolder(payload.carpetaId, created.id);
            }
            setSelectedFile(null);
            await loadData();
        } catch (err) {
            setError(err.message || 'No se pudo subir el documento.');
        }
    };

    return (
        <DashboardShell dict={dict} lang={lang} activePage="documents" contentClassName="max-w-7xl mx-auto p-4 lg:p-8">
            {({ t }) => (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{t('dashboard.docs_vault.title', 'Documentos')}</h2>
                            <p className="text-sm text-slate-500 mt-1">Todos los documentos asociados a tus vehiculos.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setResourceFolderForm(true)} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">drive_file_move</span>
                                Vincular recurso
                            </button>
                            <button onClick={() => setFolderForm({})} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">create_new_folder</span>
                                {t('dashboard.docs_vault.new_folder', 'Nueva carpeta')}
                            </button>
                        </div>
                    </div>

                    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}

                    <label
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault();
                            handleFile(event.dataTransfer.files?.[0]);
                        }}
                        className="group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 bg-white/60 dark:bg-slate-900/60 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5"
                    >
                        <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                        <span className="font-black">{t('dashboard.docs_vault.dropzone_title', 'Arrastra y suelta documentos aqui')}</span>
                        <span className="text-xs text-slate-500">{t('dashboard.docs_vault.dropzone_subtitle', 'O haz clic para buscar PDF o imagenes')}</span>
                        <input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {folders.map((folder) => (
                            <FolderCard key={folder.id} folder={folder} active={Number(folderFilter) === Number(folder.id)} onSelect={() => setFolderFilter(String(folder.id))} onEdit={() => setFolderForm(folder)} onDelete={() => handleDeleteFolder(folder.id)} />
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-[1fr_220px_180px] gap-3">
                            <label className="flex items-center bg-slate-100 dark:bg-slate-800 px-4 rounded-lg focus-within:ring-2 ring-primary/20">
                                <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                                <input className="bg-transparent border-none outline-none text-sm w-full py-2.5" placeholder="Buscar por nombre o tipo..." value={query} onChange={(event) => setQuery(event.target.value)} />
                            </label>
                            <select className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold" value={folderFilter} onChange={(event) => setFolderFilter(event.target.value)}>
                                <option value="all">Todas las carpetas</option>
                                {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.nombre}</option>)}
                            </select>
                            <select className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                                <option value="all">Todos los tipos</option>
                                <option value="report">Documentos</option>
                                <option value="itv">ITV</option>
                                <option value="liquid">Liquidos</option>
                                <option value="maintenance">Mantenimientos</option>
                                <option value="documento">Documento</option>
                                <option value="pdf">PDF</option>
                                <option value="imagen">Imagen</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Documento</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Vehiculo</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Tipo</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Fecha</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading && <tr><td className="px-6 py-6 text-sm text-slate-500" colSpan="5">Cargando documentos...</td></tr>}
                                    {!loading && filteredDocuments.map((document) => (
                                        <DocumentRow key={`${document.kind}-${document.id}`} document={document} onView={() => setActiveDocument(document)} onDelete={() => handleDeleteResource(document)} />
                                    ))}
                                    {!loading && filteredDocuments.length === 0 && <tr><td className="px-6 py-6 text-sm text-slate-500" colSpan="5">No hay documentos con esos filtros.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {selectedFile && <UploadDocumentModal file={selectedFile} vehicles={vehicles} folders={folders} onClose={() => setSelectedFile(null)} onSubmit={handleUploadDocument} />}
                    {activeDocument && <DocumentPreviewModal document={activeDocument} onClose={() => setActiveDocument(null)} />}
                    {folderForm && <FolderFormModal folder={folderForm} onClose={() => setFolderForm(null)} onSubmit={handleSaveFolder} />}
                    {resourceFolderForm && <ResourceFolderModal documents={documents} liquids={liquids} maintenances={maintenances} folders={folders} onClose={() => setResourceFolderForm(false)} onSubmit={async ({ folderId, type, resourceId }) => {
                        if (type === 'report') await vehicleResourcesApi.linkReportToFolder(folderId, resourceId);
                        else assignResourceToFolder(folderId, type, resourceId);
                        setResourceFolderForm(false);
                        await loadData();
                    }} />}
                </div>
            )}
        </DashboardShell>
    );
}

function FolderCard({ folder, active, onSelect, onEdit, onDelete }) {
    return (
        <div className={`rounded-xl border p-4 bg-white dark:bg-slate-900 ${active ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 dark:border-slate-800'}`}>
            <button onClick={onSelect} className="w-full text-left">
                <div className="flex items-center justify-between gap-3">
                    <span className="material-symbols-outlined text-primary">folder</span>
                    <span className="text-xs font-bold text-slate-400">{(folder.informes?.length || 0) + countFolderLinks(folder.id)} recursos</span>
                </div>
                <h3 className="font-black mt-3">{folder.nombre}</h3>
            </button>
            <div className="flex gap-2 mt-4">
                <button onClick={onEdit} className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold">Editar</button>
                <button onClick={onDelete} className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Eliminar</button>
            </div>
        </div>
    );
}

function DocumentRow({ document, onView, onDelete }) {
    return (
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${document.iconClass}`}>{document.icon}</span>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate max-w-[260px]">{document.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[260px]">{document.description}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{document.vehicleName}</td>
            <td className="px-6 py-4 text-sm font-bold uppercase text-slate-500">{document.kindLabel}</td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(document.date)}</td>
            <td className="px-6 py-4 text-right">
                <button onClick={onView} className="p-2 text-slate-400 hover:text-primary"><span className="material-symbols-outlined">visibility</span></button>
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
            </td>
        </tr>
    );
}

function UploadDocumentModal({ file, vehicles, folders, onClose, onSubmit }) {
    const [form, setForm] = useState({ nombre: file.name, vehiculoId: '', carpetaId: '', costo: '', fecha_informe: new Date().toISOString().slice(0, 10) });
    const [error, setError] = useState(null);

    const submit = (event) => {
        event.preventDefault();
        if (!form.vehiculoId) return setError('Selecciona el vehiculo al que pertenece el documento.');
        if (!form.nombre.trim()) return setError('Indica el titulo del documento.');
        if (form.fecha_informe && new Date(form.fecha_informe) > new Date()) return setError('La fecha del documento no puede ser futura.');
        onSubmit(form);
    };

    return (
        <Modal title="Asociar documento" onClose={onClose}>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={submit}>
                {error && <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
                <Field label="Archivo"><div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-bold truncate">{file.name}</div></Field>
                <Field label="Vehiculo"><select required className={inputClass} value={form.vehiculoId} onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })}><option value="">Seleccionar...</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{getVehicleName(vehicle)}</option>)}</select></Field>
                <Field label="Titulo"><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
                <Field label="Coste"><input type="number" step="0.01" className={inputClass} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></Field>
                <Field label="Fecha"><input type="date" className={inputClass} value={form.fecha_informe} onChange={(e) => setForm({ ...form, fecha_informe: e.target.value })} /></Field>
                <Field label="Carpeta"><select className={inputClass} value={form.carpetaId} onChange={(e) => setForm({ ...form, carpetaId: e.target.value })}><option value="">Sin carpeta</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.nombre}</option>)}</select></Field>
                <div className="md:col-span-2 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button><button className="rounded-lg bg-primary px-5 py-2 text-sm font-black text-white">Guardar</button></div>
            </form>
        </Modal>
    );
}

function DocumentPreviewModal({ document, onClose }) {
    return (
        <Modal title={document.title} onClose={onClose}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <Info label="Tipo" value={document.kindLabel} />
                    <Info label="Vehiculo" value={document.vehicleName} />
                    <Info label="Fecha" value={formatDate(document.date)} />
                </div>
                {document.fileUrl && document.fileType === 'pdf' && <iframe title={document.title} src={document.fileUrl} className="h-[70vh] w-full rounded-lg border border-slate-200 dark:border-slate-800" />}
                {document.fileUrl && document.fileType !== 'pdf' && <img src={document.fileUrl} alt={document.title} className="max-h-[70vh] w-full rounded-lg object-contain bg-slate-100 dark:bg-slate-800" />}
                {!document.fileUrl && <p className="text-sm text-slate-500">{document.description || 'Este recurso no tiene archivo asociado.'}</p>}
            </div>
        </Modal>
    );
}

function Info({ label, value }) {
    return <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="font-bold">{value || 'N/A'}</p></div>;
}

function FolderFormModal({ folder, onClose, onSubmit }) {
    const [nombre, setNombre] = useState(folder.nombre || '');
    return (
        <Modal title={folder.id ? 'Editar carpeta' : 'Crear carpeta'} onClose={onClose}>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ id: folder.id, nombre }); }}>
                <Field label="Nombre"><input required className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} /></Field>
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button><button className="rounded-lg bg-primary px-5 py-2 text-sm font-black text-white">Guardar</button></div>
            </form>
        </Modal>
    );
}

function ResourceFolderModal({ documents, liquids, maintenances, folders, onClose, onSubmit }) {
    const [form, setForm] = useState({ type: 'report', resourceId: '', folderId: '' });
    const resources = form.type === 'report'
        ? documents.map((item) => ({ id: item.id, label: item.nombre }))
        : form.type === 'liquid'
            ? liquids.map((item) => ({ id: item.id, label: `${item.nombre} - ${item.tipo || 'Liquido'}` }))
            : maintenances.map((item) => ({ id: item.id, label: item.componente_cambiado }));

    return (
        <Modal title="Vincular recurso a carpeta" onClose={onClose}>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
                <Field label="Tipo">
                    <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, resourceId: '' })}>
                        <option value="report">Documento</option>
                        <option value="liquid">Liquido</option>
                        <option value="maintenance">Mantenimiento</option>
                    </select>
                </Field>
                <Field label="Recurso">
                    <select required className={inputClass} value={form.resourceId} onChange={(event) => setForm({ ...form, resourceId: event.target.value })}>
                        <option value="">Seleccionar...</option>
                        {resources.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                </Field>
                <Field label="Carpeta">
                    <select required className={inputClass} value={form.folderId} onChange={(event) => setForm({ ...form, folderId: event.target.value })}>
                        <option value="">Seleccionar...</option>
                        {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.nombre}</option>)}
                    </select>
                </Field>
                <div className="md:col-span-3 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                    <button className="rounded-lg bg-primary px-5 py-2 text-sm font-black text-white">Vincular</button>
                </div>
            </form>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center sm:items-center">
                <div className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-black truncate">{title}</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <div className="p-5">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return <label className="flex flex-col gap-1 text-xs font-bold uppercase text-slate-400">{label}{children}</label>;
}

const inputClass = 'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary';

function getDocumentType(document) {
    const path = String(document.fileUrl || document.ruta_doc || '').toLowerCase();
    if (path.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|webp|gif)$/.test(path)) return 'imagen';
    return 'documento';
}

function normalizeResource(kind, item) {
    const attachment = getResourceAttachment(kind === 'maintenance' ? 'maintenance' : kind, item);
    const parsedAttachment = parseAttachment(attachment);
    const isItv = kind === 'report' && (parsedAttachment?.specialType === 'itv' || /^itv\b/i.test(item.nombre || ''));
    const fileUrl = parsedAttachment?.dataUrl || item.ruta_doc || '';
    const fileType = getDocumentType({ fileUrl });
    const vehicle = item.vehiculo;
    const base = {
        id: item.id,
        raw: item,
        kind: isItv ? 'itv' : kind,
        fileType,
        fileUrl,
        vehicleName: getVehicleName(vehicle),
        vehicle,
    };
    if (kind === 'liquid') {
        return { ...base, title: item.nombre, description: `${item.tipo || 'Liquido'} - ${Number(item.km_para_cambio || 0).toLocaleString()} km`, date: parsedAttachment?.fecha_cambio_actual, kindLabel: 'Liquido', icon: 'opacity', iconClass: 'text-cyan-500' };
    }
    if (kind === 'maintenance') {
        return { ...base, title: item.componente_cambiado, description: item.descripcion || `${Number(item.km_cambiado || 0).toLocaleString()} km`, date: item.fecha_cambio, kindLabel: 'Mantenimiento', icon: 'build', iconClass: 'text-amber-500' };
    }
    return { ...base, title: item.nombre, description: item.ruta_doc || parsedAttachment?.name || '', date: item.fecha_informe, kindLabel: isItv ? 'ITV' : 'Documento', icon: isItv ? 'verified' : (fileType === 'pdf' ? 'picture_as_pdf' : 'description'), iconClass: isItv ? 'text-emerald-500' : fileType === 'pdf' ? 'text-red-500' : 'text-blue-500' };
}

function isResourceInFolder(folders, folderFilter, resource) {
    const folder = folders.find((item) => Number(item.id) === Number(folderFilter));
    if (!folder) return false;
    if ((resource.kind === 'report' || resource.kind === 'itv') && folder.informes?.some((item) => Number(item.id) === Number(resource.id))) return true;
    return getFolderLinks(folder.id).some((link) => link.type === resource.kind && Number(link.resourceId) === Number(resource.id));
}

function parseAttachment(value) {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function getVehicleName(vehicle) {
    if (!vehicle) return 'N/A';
    const brand = vehicle.marca?.nombre || vehicle.marca || '';
    return `${brand} ${vehicle.modelo || ''}`.trim() || vehicle.matricula || 'Vehiculo';
}

function formatDate(date) {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('es-ES');
}
