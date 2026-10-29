import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  BookOpen,
  Bell,
  RotateCcw,
  UserCheck,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu,
  X,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { ResetModal } from '../common/ResetModal';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    switchRole,
    logout,
    resetToDefaultData,
    events,
    isOverallComplete,
    completionSummaryText,
    deliveredAwaitingAcceptanceCount,
  } = useSimulation();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleToggle = () => {
    const nextRole = currentUser?.role === 'LEARNER' ? 'EDITOR' : 'LEARNER';
    switchRole(nextRole);
    if (nextRole === 'LEARNER') {
      navigate('/learner/dashboard');
    } else {
      navigate('/editor/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Project Tag */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                      Accessible<span className="text-violet-600">Format</span>
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                      Group 17
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono -mt-0.5">
                    SOA-S09-T17 • Academic Workflow Simulation
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle: Critical Completion Live Badge */}
            <div className="hidden lg:flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isOverallComplete
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                    : 'bg-violet-50/80 text-violet-900 border-violet-200/80'
                }`}
              >
                {isOverallComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                )}
                <span>
                  <strong>Critical Rule:</strong> {completionSummaryText}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isOverallComplete ? 'bg-emerald-600 text-white' : 'bg-violet-200/80 text-violet-800'
                  }`}
                >
                  {isOverallComplete ? 'COMPLETE' : 'INCOMPLETE'}
                </span>
              </div>

              {deliveredAwaitingAcceptanceCount > 0 && currentUser?.role === 'LEARNER' && (
                <Link
                  to="/learner/review/RDG-104"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors animate-pulse"
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{deliveredAwaitingAcceptanceCount} Delivery Awaiting Acceptance</span>
                </Link>
              )}
            </div>

            {/* Right: Actions, Reset, Notifications, Persona Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Reset Demo Button */}
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Reset simulation data to baseline seed state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Demo</span>
              </button>

              {/* Event / Notification Center */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="View simulated Kafka activity events"
              >
                <Bell className="w-4 h-4" />
                {events.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white" />
                )}
              </Link>

              {/* Quick Persona Switcher Button */}
              <button
                type="button"
                onClick={handleRoleToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Toggle between Learner and Editor persona"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Switch to:</span>
                <span className="font-bold underline">
                  {currentUser?.role === 'LEARNER' ? 'Editor' : 'Learner'}
                </span>
              </button>

              {/* Profile Avatar / Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="User profile menu"
                >
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-200"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {currentUser?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Logged in simulated role:</p>
                      <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                      <p className="text-xs text-violet-600 font-semibold">{currentUser?.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser?.departmentOrStudentId}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleRoleToggle();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-violet-500" />
                        Switch to {currentUser?.role === 'LEARNER' ? 'Editor (David Chen)' : 'Learner (Maya Lin)'}
                      </button>

                      <Link
                        to="/architecture"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        Conceptual SOA Architecture
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out (Return to Demo Login)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation modal for state reset */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToDefaultData}
      />
    </>
  );
};
