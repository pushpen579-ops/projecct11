import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toastId = 0;
let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastFn?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (type: ToastType, message: string) => {
      const id = `toast-${++toastId}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg animate-slide-up ${
            t.type === 'success' ? 'bg-white border-l-4 border-success-500' : 'bg-white border-l-4 border-danger-500'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="text-success-500 shrink-0 mt-0.5" size={20} />
          ) : (
            <XCircle className="text-danger-500 shrink-0 mt-0.5" size={20} />
          )}
          <p className="text-sm text-slate-700 flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
