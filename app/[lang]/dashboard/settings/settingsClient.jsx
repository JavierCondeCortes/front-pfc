'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { clearSession, getSessionSnapshot, persistSession, subscribeToSession } from '@/lib/session';
import { uploadFile } from '@/lib/uploadFile';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getDistanceUnit, setDistanceUnit, subscribeToDistanceUnit } from '@/lib/preferences';

const inputClass = 'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-primary';

export default function SettingsClient({ dict, lang }) {
    const sessionSnapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
    const session = useMemo(() => {
        if (!sessionSnapshot) return {};
        try {
            return JSON.parse(sessionSnapshot);
        } catch {
            return {};
        }
    }, [sessionSnapshot]);
    const distanceUnit = useSyncExternalStore(subscribeToDistanceUnit, getDistanceUnit, () => 'km');
    const [message, setMessage] = useState(null);
    const t = (path, fallback) => {
        const keys = path.split('.');
        let result = dict;
        for (const key of keys) {
            if (!result || result[key] === undefined) return fallback;
            result = result[key];
        }
        return result;
    };

    const updateSession = (nextSession) => {
        persistSession(nextSession);
        setMessage(t('settings.messages.saved', 'Ajustes guardados correctamente.'));
    };

    const handlePhoto = async (file) => {
        if (!file) return;
        try {
            const uploaded = await uploadFile(file, 'profiles');
            updateSession({ ...session, photoUrl: uploaded.url });
        } catch (error) {
            setMessage(error.message || t('settings.messages.photo_error', 'No se pudo subir la foto.'));
        }
    };

    return (
        <DashboardShell dict={dict} lang={lang} activePage="settings" contentClassName="max-w-5xl mx-auto p-4 lg:p-8">
            {({ router }) => (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{t('settings.title', 'Ajustes')}</h2>
                        <p className="text-sm text-slate-500 mt-1">{t('settings.subtitle', 'Idioma, usuario y seguridad de tu cuenta.')}</p>
                    </div>

                    {message && <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm font-bold text-primary">{message}</div>}

                    <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                            <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: session.photoUrl ? `url('${session.photoUrl}')` : undefined }}>
                                {!session.photoUrl && <div className="h-full flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-slate-400">account_circle</span></div>}
                            </div>
                            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white">
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                {t('settings.profile.change_photo', 'Cambiar foto')}
                                <input type="file" accept="image/*" className="hidden" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                            </label>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-6">
                            <div>
                                <h3 className="font-black mb-3">{t('settings.language.title', 'Idioma')}</h3>
                                <LanguageSwitcher lang={lang} />
                            </div>

                            <div>
                                <h3 className="font-black mb-3">{t('settings.distance.title', 'Distancia')}</h3>
                                <Field label={t('settings.distance.label', 'Unidad de distancia')}>
                                    <select className={inputClass} value={distanceUnit} onChange={(event) => setDistanceUnit(event.target.value)}>
                                        <option value="km">{t('settings.distance.km', 'Kilometros')}</option>
                                        <option value="mi">{t('settings.distance.mi', 'Millas')}</option>
                                    </select>
                                </Field>
                            </div>

                            <ProfileForm t={t} key={`${session.nombre || session.name || ''}-${session.email || ''}`} session={session} onSubmit={updateSession} />
                            <PasswordForm t={t} onSubmit={(password) => updateSession({ ...session, passwordUpdatedAt: new Date().toISOString(), passwordHint: password.slice(0, 1) })} />

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                                <button onClick={() => { clearSession(); router.push(`/${lang}/login`); }} className="rounded-lg bg-red-50 px-5 py-2 text-sm font-black text-red-600">{t('settings.logout', 'Cerrar sesion')}</button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </DashboardShell>
    );
}

function ProfileForm({ t, session, onSubmit }) {
    const [form, setForm] = useState(() => ({ nombre: session.nombre || session.name || '', email: session.email || '' }));

    return (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...session, nombre: form.nombre, name: form.nombre, email: form.email }); }}>
            <h3 className="md:col-span-2 font-black">{t('settings.profile.title', 'Gestion del usuario')}</h3>
            <Field label={t('settings.profile.name', 'Nombre')}><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
            <Field label={t('settings.profile.email', 'Correo')}><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <div className="md:col-span-2"><button className="rounded-lg bg-primary px-5 py-2 text-sm font-black text-white">{t('settings.profile.save', 'Guardar perfil')}</button></div>
        </form>
    );
}

function PasswordForm({ t, onSubmit }) {
    const [form, setForm] = useState({ current: '', next: '', repeat: '' });
    const [error, setError] = useState(null);

    return (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={(event) => {
            event.preventDefault();
            if (form.next.length < 6) return setError(t('settings.password.min_error', 'La nueva contrasena debe tener al menos 6 caracteres.'));
            if (form.next !== form.repeat) return setError(t('settings.password.match_error', 'Las contrasenas no coinciden.'));
            setError(null);
            onSubmit(form.next);
            setForm({ current: '', next: '', repeat: '' });
        }}>
            <h3 className="md:col-span-3 font-black">{t('settings.password.title', 'Cambiar contrasena')}</h3>
            {error && <div className="md:col-span-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
            <Field label={t('settings.password.current', 'Actual')}><input type="password" className={inputClass} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} /></Field>
            <Field label={t('settings.password.next', 'Nueva')}><input type="password" className={inputClass} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} /></Field>
            <Field label={t('settings.password.repeat', 'Repetir')}><input type="password" className={inputClass} value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })} /></Field>
            <div className="md:col-span-3"><button className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2 text-sm font-black text-white dark:text-slate-900">{t('settings.password.save', 'Actualizar contrasena')}</button></div>
        </form>
    );
}

function Field({ label, children }) {
    return <label className="flex flex-col gap-1 text-xs font-bold uppercase text-slate-400">{label}{children}</label>;
}
