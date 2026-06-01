"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const INITIAL_FORM_DATA = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

const PASSWORD_PLACEHOLDER = '********';

export default function RegisterClient({ dict, lang }) {
    const router = useRouter();
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const updateField = (field) => (event) => {
        setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors(null);

        try {
            if (formData.password !== formData.password_confirmation) {
                setErrors({
                    password_confirmation: ['Las contrasenas no coinciden.'],
                    message: 'Las contrasenas no coinciden.',
                });
                return;
            }

            await registerUser({
                nombre: formData.name,
                email: formData.email,
                password: formData.password,
                rol: 'USER',
                enabled: true,
            });

            router.push(`/${lang}/login`);
        } catch (error) {
            console.error('Error de registro:', error);
            setErrors(error.errors ? { ...error.errors, message: error.message } : { message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
            <RegisterHeader dict={dict} lang={lang} router={router} />

            <div className="flex-1 flex overflow-hidden">
                <BenefitsPanel dict={dict} />

                <main className="flex-1 flex items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-y-auto">
                    <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2">{dict.register.title}</h1>
                                <p className="text-slate-500">{dict.register.subtitle}</p>
                            </div>

                            {errors?.message && <ErrorMessage message={errors.message} />}

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <AuthInput
                                    label={dict.register.label_name}
                                    icon="person"
                                    value={formData.name}
                                    onChange={updateField('name')}
                                    error={errors?.name}
                                    placeholder={dict.register.placeholder_name}
                                    type="text"
                                />
                                <AuthInput
                                    label={dict.register.label_email}
                                    icon="mail"
                                    value={formData.email}
                                    onChange={updateField('email')}
                                    error={errors?.email}
                                    placeholder={dict.register.placeholder_email}
                                    type="email"
                                />
                                <AuthInput
                                    label={dict.register.placeholder_password}
                                    icon="lock"
                                    value={formData.password}
                                    onChange={updateField('password')}
                                    error={errors?.password}
                                    placeholder={PASSWORD_PLACEHOLDER}
                                    type="password"
                                />
                                <AuthInput
                                    label={dict.register.placeholder_repeat_password}
                                    icon="enhanced_encryption"
                                    value={formData.password_confirmation}
                                    onChange={updateField('password_confirmation')}
                                    error={errors?.password_confirmation}
                                    placeholder={PASSWORD_PLACEHOLDER}
                                    type="password"
                                />

                                <TermsCheckbox dict={dict} />

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 px-4 rounded-lg hover:bg-primary/90 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    <span>{loading ? 'Registrando...' : dict.register.submit_button}</span>
                                    {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="py-6 px-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 text-[11px] font-bold uppercase tracking-wider gap-4">
                <span>© 2026 CarHistorial Inc.</span>
            </footer>
        </div>
    );
}

function RegisterHeader({ dict, lang, router }) {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-3 w-full z-10">
            <button onClick={() => router.push(`/${lang}/home`)} className="flex items-center gap-3">
                <div className="text-primary w-8 h-8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">directions_car</span>
                </div>
                <h2 className="text-lg font-bold">CarHistorial</h2>
            </button>
            <div className="flex items-center gap-4">
                <LanguageSwitcher lang={lang} className="hidden md:flex" />
                <span className="hidden sm:inline text-sm text-slate-500">{dict.auth.already_have_account}</span>
                <button onClick={() => router.push(`/${lang}/login`)} className="rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
                    {dict.auth.login_button}
                </button>
            </div>
        </header>
    );
}

function BenefitsPanel({ dict }) {
    const benefits = [
        ['Analytics', dict.register.benefit1_title, dict.register.benefit1_desc],
        ['Cloud', dict.register.benefit3_title, dict.register.benefit3_desc],
        ['Notifications_active', dict.register.benefit5_title, dict.register.benefit5_desc],
    ];

    return (
        <aside className="hidden lg:flex lg:w-[40%] flex-col justify-center bg-slate-50 dark:bg-slate-900/50 p-20 border-r border-slate-200 dark:border-slate-800">
            <div className="max-w-md space-y-6">
                {benefits.map(([icon, title, description]) => (
                    <BenefitItem key={icon} icon={icon} title={title} description={description} />
                ))}
            </div>
        </aside>
    );
}

function BenefitItem({ icon, title, description }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
            <div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function AuthInput({ label, icon, value, onChange, error, placeholder, type }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">{icon}</span>
                <input
                    required
                    value={value}
                    onChange={onChange}
                    className={`block w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:border-primary outline-none transition-all`}
                    placeholder={placeholder}
                    type={type}
                />
            </div>
            {error && <span className="text-xs text-red-500">{error[0]}</span>}
        </div>
    );
}

function ErrorMessage({ message }) {
    return (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-bold">{message}</p>
            </div>
        </div>
    );
}

function TermsCheckbox({ dict }) {
    return (
        <div className="flex items-start gap-3 py-1">
            <input required className="mt-1 h-4 w-4 rounded border-slate-300 text-primary cursor-pointer" id="terms" type="checkbox" />
            <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">
                {dict.register.terms_text} <a className="text-primary font-bold hover:underline" href="#">{dict.register.terms_link}</a>.
            </label>
        </div>
    );
}
