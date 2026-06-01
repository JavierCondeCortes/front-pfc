'use client';

export default function NavItem({ icon, label, active = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                active
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
            }`}
        >
            <span className={`material-symbols-outlined ${active ? 'material-symbols-fill' : ''}`}>
                {icon}
            </span>
            <span className="text-sm">{label}</span>
        </button>
    );
}
