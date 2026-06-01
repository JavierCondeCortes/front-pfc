'use client';

import { useMemo, useState } from 'react';

export default function AutocompleteField({
    label,
    placeholder,
    value,
    selectedId,
    options,
    disabled = false,
    error,
    onInputChange,
    onSelect,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const filteredOptions = useMemo(() => {
        const normalizedValue = value.toLowerCase();
        return options.filter((option) => option.nombre.toLowerCase().includes(normalizedValue));
    }, [options, value]);

    return (
        <div className="flex flex-col gap-1 relative">
            <label className="font-bold text-[10px] uppercase text-slate-400">{label}</label>
            <input
                className={`border rounded-lg p-2.5 text-sm outline-none transition-all ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-50' : error ? 'border-red-500' : 'border-primary/30 focus:border-primary'}`}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                onChange={(event) => onInputChange(event.target.value)}
            />
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border shadow-2xl z-50 max-h-40 overflow-y-auto rounded-b-lg">
                    {filteredOptions.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            className="w-full text-left p-2 hover:bg-primary/10 cursor-pointer text-sm"
                            onMouseDown={() => onSelect(option)}
                        >
                            {option.nombre}
                        </button>
                    ))}
                </div>
            )}
            <input type="hidden" value={selectedId} readOnly />
        </div>
    );
}

