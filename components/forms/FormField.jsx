'use client';

export default function FormField({ label, error, className = '', children }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="font-bold text-[10px] uppercase text-slate-400">{label}</label>
            {children}
            {error && <span className="text-[9px] text-red-500 uppercase font-bold">{error[0]}</span>}
        </div>
    );
}

