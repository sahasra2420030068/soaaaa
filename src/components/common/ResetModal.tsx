import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="reset-modal-title" className="text-lg font-bold text-slate-900">
              Reset Simulation State?
            </h3>
            <p className="text-xs text-slate-500">SOA-S09-T17 Demonstration Environment</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          This will reset all five required readings, conversion queue tasks, format deliveries, and simulated Kafka event logs back to their initial seed state.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-6 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">Seed State Summary:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500">
            <li>3 readings accepted</li>
            <li>1 reading delivered (awaiting acceptance review)</li>
            <li>1 reading not yet requested (ready for new request flow)</li>
            <li>Guided tour reset to Step 1</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
};
