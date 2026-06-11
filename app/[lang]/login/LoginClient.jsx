"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { loginUser } from '@/lib/api/auth';

export default function LoginClient({ dict, lang }) {
    const router = useRouter();
    const { login } = useAuth(); 

    // --- Estados del Formulario ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Lógica de Autenticación ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await loginUser({ email, password });
            const userData = {
                ...data.user,
                token: data.access_token || data.token,
                remember: rememberMe
            };

            login(userData);
            router.push(`/${lang}/dashboard/vehicles`);
        } catch (err) {
            setError(err.message || "Error de conexión: Verifica que tu servidor Laravel esté encendido.");
            console.error("Login Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-white">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-3 w-full">
                <div className="flex items-center gap-3">
                    <div onClick={() => router.push(`/${lang}/home`)} className='flex items-center cursor-pointer'>
                        <div className="text-primary w-8 h-8 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-blue-600">directions_car</span>
                        </div>
                        <h2 className="text-lg font-bold">CarHistorial</h2>
                    </div>
                </div>
                <button 
                    onClick={() => router.push(`/${lang}/register`)}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                    <span className="truncate">{dict.auth?.register_button || "Registrarse"}</span>
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mb-2">
                                {dict.login?.title || "Iniciar Sesión"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base">
                                {dict.login?.subtitle || "Bienvenido de nuevo"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                                    {dict.login?.label_email || "Correo electrónico"}
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                    <input
                                        required
                                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-white transition-all outline-none"
                                        placeholder={dict.login?.placeholder_email || "ejemplo@correo.com"}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                                    {dict.login?.label_password || "Contraseña"}
                                </label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-xl">lock</span>
                                    <input
                                        required
                                        className="block w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-white transition-all outline-none"
                                        placeholder={dict.login?.placeholder_password || "••••••••"}
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 text-slate-400 hover:text-slate-600"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between py-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
                                        {dict.login?.remember_me || "Recordarme"}
                                    </span>
                                </label>
                                <a className="text-sm font-semibold text-blue-600 hover:underline" href="#">
                                    {dict.login?.forgot_password || "¿Olvidaste tu contraseña?"}
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    dict.login?.submit_button || "Entrar"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {dict.login?.no_account || "¿No tienes cuenta?"}
                            <button
                                onClick={() => router.push(`/${lang}/register`)}
                                className="ml-1 font-bold text-blue-600 hover:underline"
                            >
                                {dict.login?.signup_link || "Regístrate"}
                            </button>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs gap-4">
                <div className="flex items-center gap-6">
                    <span>© 2026 CarHistorial.</span>
                    <a className="hover:text-slate-600" href="#">{dict.footer?.privacy || "Privacidad"}</a>
                    <a className="hover:text-slate-600" href="#">{dict.footer?.terms || "Términos"}</a>
                </div>
                <LanguageSwitcher lang={lang} />
            </footer>
        </div>
    );
}
