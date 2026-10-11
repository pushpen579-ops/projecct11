import { type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          className={`w-full rounded-lg border ${error ? 'border-danger-400 focus:ring-danger-500' : 'border-slate-300 focus:ring-brand-500'} focus:outline-none focus:ring-2 focus:border-transparent px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        className={`w-full rounded-lg border ${error ? 'border-danger-400 focus:ring-danger-500' : 'border-slate-300 focus:ring-brand-500'} focus:outline-none focus:ring-2 focus:border-transparent px-3.5 py-2.5 text-sm text-slate-800 bg-white transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <textarea
        className={`w-full rounded-lg border ${error ? 'border-danger-400 focus:ring-danger-500' : 'border-slate-300 focus:ring-brand-500'} focus:outline-none focus:ring-2 focus:border-transparent px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
}
