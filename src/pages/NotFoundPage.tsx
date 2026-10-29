import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested route does not exist in the Accessible Learning Format Request simulation.
        </p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
