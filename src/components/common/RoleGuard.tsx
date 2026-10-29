import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { UserRole } from '../../types';
import { UserCheck, ShieldAlert, ArrowRight, LayoutDashboard } from 'lucide-react';

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole, children }) => {
  const { currentUser, switchRole } = useSimulation();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== allowedRole) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Persona Access Notice
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            {allowedRole === 'LEARNER' ? 'Learner Portal' : 'Editor Workspace'} Restricted
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            You are currently active as <strong>{currentUser.name}</strong> ({currentUser.role === 'LEARNER' ? 'Learner' : 'Accessibility Editor'}). This page is configured for the <strong>{allowedRole}</strong> persona.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => switchRole(allowedRole)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {allowedRole === 'LEARNER' ? 'Learner (Maya Lin)' : 'Editor (David Chen)'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(currentUser.role === 'LEARNER' ? '/learner/dashboard' : '/editor/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
