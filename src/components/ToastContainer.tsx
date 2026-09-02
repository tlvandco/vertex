import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white border-gray-200 text-gray-800';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (toast.type === 'success') {
          bg = 'bg-emerald-50/95 border-emerald-200 text-emerald-950';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bg = 'bg-red-50/95 border-red-200 text-red-950';
          Icon = AlertCircle;
          iconColor = 'text-red-600';
        } else if (toast.type === 'info') {
          bg = 'bg-amber-50/95 border-amber-200 text-amber-950';
          Icon = Info;
          iconColor = 'text-[#D4AF37]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-3 fade-in duration-200 transition-all ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
