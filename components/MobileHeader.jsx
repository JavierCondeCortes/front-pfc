'use client';

export default function MobileHeader({ onMenuToggle, isMenuOpen, appName = 'CarHistorial' }) {
    return (
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-lg">directions_car</span>
                </div>
                <h1 className="text-slate-900 dark:text-white text-base font-bold">{appName}</h1>
            </div>
            <button
                onClick={onMenuToggle}
                className="text-slate-600 dark:text-slate-400 p-1 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-2xl">
                    {isMenuOpen ? 'close' : 'menu'}
                </span>
            </button>
        </header>
    );
}
