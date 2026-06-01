"use client";


import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LandingClient({ dict, lang }) {
    const router = useRouter();

    const t = (path, fallback) => {
        const keys = path.split('.');
        let result = dict;
        for (const key of keys) {
            if (result[key] === undefined) return fallback;
            result = result[key];
        }
        return result;
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
            
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-slate-800 bg-white/80 dark:dark:bg-slate-900 backdrop-blur-md px-6 lg:px-40 py-4">
                <div className="flex items-center justify-between max-w-[1280px] mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">directions_car</span>
                        </div>
                        <h2 className="text-[#0d121b] dark:text-white text-xl font-bold tracking-tight">CarHistorial</h2>
                    </div>
                    <nav className="hidden md:flex flex-1 justify-center gap-10">
                        <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#features">
                            {t('landing.nav_features', 'Features')}
                        </a>
                        {/* <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#benefits">
                            {t('landing.nav_benefits', 'Benefits')}
                        </a> */}
                        {/* <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#pricing">
                            {t('landing.nav_pricing', 'Pricing')}
                        </a> */}
                    </nav>
                    <div className="flex gap-3">
                        <LanguageSwitcher lang={lang} className="hidden lg:flex" />
                        <button 
                            onClick={() => router.push(`/${lang}/login`)}
                            className="hidden sm:flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold transition-all  hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            {t('auth.login_button', 'Login')}
                        </button>
                        <button 
                            onClick={() => router.push(`/${lang}/register`)}
                            className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-wide transition-all hover:opacity-90 shadow-md shadow-primary/20"
                        >
                            {t('auth.register_button', 'Get Started')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex flex-col flex-1">
                {/* Hero Section */}
                <section className="px-6 lg:px-40 py-16 lg:py-24">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex flex-col gap-8 flex-1 text-center lg:text-left">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-slate-900 dark:text-white text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
                                    {t('landing.hero_title', 'Mantén tu vehículo siempre a punto')}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-[600px] mx-auto lg:mx-0">
                                    {t('landing.hero_subtitle', 'La plataforma integral para el seguimiento de mantenimiento.')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => router.push(`/${lang}/register`)} className="flex h-14 px-8 items-center justify-center rounded-xl bg-primary text-white text-lg font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform">
                                    {t('landing.cta_main', 'Empieza Gratis ahora')}
                                </button>
                                <button className="flex h-14 px-8 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    {t('landing.cta_demo', 'Ver Demo')}
                                </button>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                <div className="flex -space-x-2">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=${i}')` }}></div>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">{t('landing.social_proof', '+2,000 conductores ya confían en nosotros')}</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-[600px]">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                                <img alt="Dashboard Mockup" className="w-full h-auto object-cover" src="/dashboard-mockup.png" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white dark:bg-slate-900/50 px-6 lg:px-40 py-20" id="features">
                    <div className="max-w-[1280px] mx-auto">
                        <div className="text-center mb-16 flex flex-col items-center">
                            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3">{t('landing.features_tag', 'Funcionalidades')}</span>
                            <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold mb-4">{t('landing.features_title', 'Todo lo que necesitas')}</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-[700px]">{t('landing.features_desc', 'Optimizamos la gestión de tu vehículo.')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard icon="history" title={t('features.history_title', 'History')} desc={t('features.history_desc', 'Registro digital.')} />
                            <FeatureCard icon="notifications_active" title={t('features.alerts_title', 'Alerts')} desc={t('features.alerts_desc', 'Recordatorios automáticos.')} />
                            <FeatureCard icon="description" title={t('features.docs_title', 'Docs')} desc={t('features.docs_desc', 'Almacena tus documentos.')} />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                {/* <section className="bg-slate-100 dark:bg-slate-900 px-6 lg:px-40 py-24" id="pricing">
                    <div className="max-w-[1280px] mx-auto text-center">
                        <h2 className="text-4xl font-black dark:text-white mb-12">{t('pricing.main_title', 'Planes')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <PricingCard title={t('pricing.free_name', 'Free')} price="0" features={[t('pricing.feat_1_veh'), t('pricing.feat_basic')]} buttonText={t('pricing.btn_choose')} />
                            <PricingCard title={t('pricing.pro_name', 'Pro')} price="12" features={[t('pricing.feat_3_veh'), t('pricing.feat_alerts')]} recommended buttonText={t('pricing.btn_choose')} />
                            <PricingCard title={t('pricing.ent_name', 'Enterprise')} price="49" features={[t('pricing.feat_unlimited'), t('pricing.feat_api')]} buttonText={t('pricing.btn_contact')} />
                        </div>
                    </div>
                </section> */}
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 px-6 lg:px-40 py-16">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-slate-800 pt-12 text-center md:text-left">
                    <div className="col-span-1 space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                            <h2 className="text-white text-xl font-bold">AutoMaint</h2>
                        </div>
                        <p className="text-sm">{t('landing.footer_desc', 'Gestión vehicular inteligente.')}</p>
                    </div>
                    <p className="col-span-full text-center text-xs mt-8">© 2026 AutoMaint Technologies Inc. {t('landing.all_rights', 'Todos los derechos reservados.')}</p>
                </div>
            </footer>
        </div>
    );
}

// Sub-componentes
function FeatureCard({ icon, title, desc }) {
    return (
        <div className="group p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30 hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}

function PricingCard({ title, price, features, recommended = false, buttonText }) {
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-3xl p-8 border ${recommended ? 'border-2 border-primary scale-105 z-10 shadow-2xl' : 'border-slate-200 dark:border-slate-800'} flex flex-col relative`}>
            {recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">PRO</div>}
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <div className="flex justify-center items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">${price}</span>
                <span className="text-slate-500 text-sm">/mes</span>
            </div>
            <ul className="flex-1 space-y-4 mb-8 text-left">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        {f}
                    </li>
                ))}
            </ul>
            <button className={`w-full py-4 rounded-xl font-bold transition-all ${recommended ? 'bg-primary text-white' : 'border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                {buttonText}
            </button>
        </div>
    );
}
