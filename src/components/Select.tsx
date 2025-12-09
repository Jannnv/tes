import React from 'react';
import { cn } from '../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string }[];
}

export function Select({ className, label, error, options, ...props }: SelectProps) {
    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium leading-none">{label}</label>}
            <select
                className={cn(
                    "flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none",
                    error && "border-destructive focus-visible:ring-destructive",
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
