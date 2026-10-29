import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../common/DemoBanner';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useSimulation } from '../../context/SimulationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { toastMessage, clearToast } = useSimulation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FE] text-slate-900">
      {/* Demo Mode & Guided Scenario Bar */}
      <DemoBanner />

      {/* Main Navigation Header */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Core Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border bg-white animate-in slide-in-from-bottom-5 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-violet-600 shrink-0" />}

          <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-md">{toastMessage.text}</p>

          <button
            onClick={clearToast}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
