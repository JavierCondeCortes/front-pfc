'use client';

import React, { useEffect, useState } from 'react';
import { fetchBrands } from '@/lib/api/vehicles';
import { getVehiclePhoto, readImageFile, saveVehiclePhoto } from '@/lib/vehiclePhotos';
import { uploadFile } from '@/lib/uploadFile';
import { formatDistance, getDistanceUnit, parseDistanceInput, subscribeToDistanceUnit } from '@/lib/preferences';
import AlertItem from './AlertItem';
import FormField from './forms/FormField';

const EMPTY_FORM = {
    id: '',
    marca_id: '',
    matricula: '',
    modelo: '',
    km_recorridos: '',
    pegatina: '',
    tipo_combustible: '',
    ultima_fecha_itv: '',
};

function buildForm(vehicle, distanceUnit = 'km') {
    if (!vehicle) return EMPTY_FORM;
    const mileageKm = Number(vehicle.km_recorridos ?? vehicle.kilometros_recorridos ?? 0);

    return {
        id: vehicle.id || '',
        marca_id: vehicle.marca?.id || '',
        matricula: vehicle.matricula || '',
        modelo: vehicle.modelo || '',
        km_recorridos: distanceUnit === 'mi' ? Math.round(mileageKm * 0.621371) : mileageKm,
        pegatina: vehicle.pegatina || '',
        tipo_combustible: vehicle.tipo_combustible || '',
        ultima_fecha_itv: normalizeDate(vehicle.ultima_fecha_itv),
    };
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, vehicle = null, t = (path, fallback) => fallback }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [brands, setBrands] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const distanceUnit = React.useSyncExternalStore(subscribeToDistanceUnit, getDistanceUnit, () => 'km');
    const isEditing = Boolean(vehicle?.id);

    useEffect(() => {
        if (isOpen) {
            setFormData(buildForm(vehicle, distanceUnit));
            setPhotoPreview(getVehiclePhoto(vehicle));
            setFormError(null);
            fetchBrands().then(setBrands).catch(() => setBrands([]));
        }
    }, [distanceUnit, isOpen, vehicle]);

    const updateField = (field) => (event) => {
        setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError(null);

        const photoFile = event.target.elements.photo?.files?.[0];
        const validationError = validateVehicleForm(formData, t);
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setLoading(true);
        const payload = {
            ...(isEditing ? { id: Number(formData.id) } : {}),
            marca: { id: Number(formData.marca_id) },
            matricula: formData.matricula.trim().toUpperCase(),
            modelo: formData.modelo.trim(),
            km_recorridos: parseDistanceInput(formData.km_recorridos, distanceUnit),
            pegatina: formData.pegatina.trim(),
            tipo_combustible: formData.tipo_combustible.trim(),
            ultima_fecha_itv: formData.ultima_fecha_itv || null,
        };

        try {
            const savedVehicle = await onSuccess(payload);
            const photoKey = savedVehicle?.id || formData.id
                ? `vehicle:${savedVehicle?.id || formData.id}`
                : `plate:${payload.matricula.toLowerCase()}`;
            const uploadedPhoto = photoFile ? await uploadFile(photoFile, 'vehicles', { key: photoKey }) : null;
            saveVehiclePhoto({ id: savedVehicle?.id || formData.id, matricula: payload.matricula }, uploadedPhoto?.url || photoPreview);
            onClose();
        } catch (error) {
            setFormError(error.message || t('vehicles.form.errors.save', 'Error al guardar el vehiculo.'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-6">
            <div className="flex min-h-full items-start justify-center sm:items-center">
                <div className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-primary/30 bg-white p-5 shadow-2xl dark:bg-slate-900 sm:my-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">
                                {isEditing ? t('vehicles.form.edit_title', 'Editar vehiculo') : t('vehicles.form.add_title', 'Agregar vehiculo')}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">{t('vehicles.form.subtitle', 'Datos asociados a tu usuario autenticado.')}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formError && <div className="md:col-span-2"><AlertItem type="error" message={formError} /></div>}

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-slate-400">directions_car</span>
                            )}
                        </div>
                        <FormField label={t('vehicles.form.photo', 'Foto del coche')}>
                            <input
                                name="photo"
                                type="file"
                                accept="image/*"
                                onChange={async (event) => setPhotoPreview(await readImageFile(event.target.files?.[0]))}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                            />
                        </FormField>
                    </div>

                    <FormField label={t('vehicles.form.brand', 'Marca')}>
                        <select
                            name="marca_id"
                            required
                            value={formData.marca_id}
                            onChange={updateField('marca_id')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                        >
                            <option value="">{t('vehicles.form.select_brand', 'Seleccionar marca...')}</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>{brand.nombre}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label={t('vehicles.form.plate', 'Matricula')}>
                        <input
                            name="matricula"
                            required
                            disabled={isEditing}
                            value={formData.matricula}
                            onChange={updateField('matricula')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm uppercase disabled:bg-slate-100 disabled:text-slate-500"
                            placeholder="1234ABC"
                        />
                    </FormField>

                    <FormField label={t('vehicles.form.model', 'Modelo')}>
                        <input
                            name="modelo"
                            required
                            value={formData.modelo}
                            onChange={updateField('modelo')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                            placeholder="Seat Leon"
                        />
                    </FormField>

                    <FormField label={t('vehicles.form.mileage', distanceUnit === 'mi' ? 'Millas recorridas' : 'Kilometros recorridos')}>
                        <input
                            name="km_recorridos"
                            type="number"
                            min="0"
                            value={formData.km_recorridos}
                            onChange={updateField('km_recorridos')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                            placeholder={formatDistance(0, distanceUnit)}
                        />
                    </FormField>

                    <FormField label={t('vehicles.form.sticker', 'Pegatina')}>
                        <input
                            name="pegatina"
                            value={formData.pegatina}
                            onChange={updateField('pegatina')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                            placeholder="C, ECO, 0..."
                        />
                    </FormField>

                    <FormField label={t('vehicles.form.fuel', 'Tipo combustible')}>
                        <select
                            name="tipo_combustible"
                            required
                            value={formData.tipo_combustible}
                            onChange={updateField('tipo_combustible')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                        >
                            <option value="">{t('vehicles.form.select_fuel', 'Seleccionar combustible...')}</option>
                            <option value="diesel">{t('vehicles.fuel.diesel', 'Diesel')}</option>
                            <option value="gasolina">{t('vehicles.fuel.gasolina', 'Gasolina')}</option>
                            <option value="electrico">{t('vehicles.fuel.electrico', 'Electrico')}</option>
                            <option value="hibrido">{t('vehicles.fuel.hibrido', 'Hibrido')}</option>
                            <option value="gas">{t('vehicles.fuel.gas', 'Gas')}</option>
                        </select>
                    </FormField>

                    <FormField label={t('vehicles.form.last_itv_date', 'Fecha ultima ITV')}>
                        <input
                            name="ultima_fecha_itv"
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            value={formData.ultima_fecha_itv}
                            onChange={updateField('ultima_fecha_itv')}
                            className="border border-primary/30 rounded-lg p-2.5 text-sm"
                        />
                    </FormField>

                    <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors uppercase">
                            {t('common.cancel', 'Cancelar')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-wider disabled:opacity-50"
                        >
                            {loading ? t('common.saving', 'Guardando...') : isEditing ? t('vehicles.form.save_changes', 'Guardar cambios') : t('vehicles.form.add_submit', 'Agregar vehiculo')}
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function normalizeDate(date) {
    if (!date) return '';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function validateVehicleForm(formData, t) {
    if (!formData.marca_id) return t('vehicles.form.errors.brand', 'Selecciona la marca del vehiculo.');
    if (!formData.matricula.trim()) return t('vehicles.form.errors.plate', 'Indica la matricula del vehiculo.');
    if (!formData.modelo.trim()) return t('vehicles.form.errors.model', 'Indica el modelo del vehiculo.');
    if (!formData.tipo_combustible) return t('vehicles.form.errors.fuel', 'Selecciona el tipo de combustible.');

    const km = Number(formData.km_recorridos || 0);
    if (Number.isNaN(km) || km < 0) return t('vehicles.form.errors.mileage', 'La distancia recorrida debe ser un numero mayor o igual a 0.');

    if (formData.ultima_fecha_itv) {
        const itvDate = new Date(formData.ultima_fecha_itv);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (Number.isNaN(itvDate.getTime())) return t('vehicles.form.errors.itv_invalid', 'La fecha de ultima ITV no es valida.');
        if (itvDate > today) return t('vehicles.form.errors.itv_future', 'La fecha de ultima ITV no puede ser posterior a la fecha actual.');
    }

    return null;
}
