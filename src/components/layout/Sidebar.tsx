import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileCheck,
  ListOrdered,
  Layers,
  Info,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
  X,
  LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentUser,
    readings,
    tasks,
    totalRequiredReadings,
    acceptedReadingsCount,
    isOverallComplete,
    completionPercentage,
    deliveredAwaitingAcceptanceCount,
  } = useSimulation();

  const location = useLocation();
  const isLearner = currentUser?.role === 'LEARNER';

  // Find a reading awaiting acceptance for direct link
  const awaitingReading = readings.find(
    (r) => r.deliveryStatus === 'DELIVERED' && r.acceptanceStatus === 'AWAITING_ACCEPTANCE'
  );
  const deliveryReviewLink = awaitingReading
    ? `/learner/review/${awaitingReading.id}`
    : `/learner/review/RDG-104`;

  interface NavItem {
    to: string;
    label: string;
    icon: LucideIcon;
    badge: string | null;
    highlight?: boolean;
  }

  const learnerNavItems: NavItem[] = [
    {
      to: '/learner/dashboard',
      label: 'Learner Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/learner/readings',
      label: 'Required Reading List',
      icon: BookOpen,
      badge: `${readings.length}`,
    },
    {
      to: '/learner/request',
      label: 'Submit Format Request',
      icon: PlusCircle,
      badge: null,
    },
    {
      to: deliveryReviewLink,
      label: 'Delivery & Acceptance',
      icon: FileCheck,
      badge: deliveredAwaitingAcceptanceCount > 0 ? `${deliveredAwaitingAcceptanceCount} Review` : null,
      highlight: deliveredAwaitingAcceptanceCount > 0,
    },
  ];

  const editorNavItems: NavItem[] = [
    {
      to: '/editor/dashboard',
      label: 'Editor Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/editor/queue',
      label: 'Conversion Queue',
      icon: ListOrdered,
      badge: `${tasks.length}`,
    },
  ];

  const systemNavItems: NavItem[] = [
    {
      to: '/notifications',
      label: 'Activity & Kafka Stream',
      icon: Bell,
      badge: 'Live',
    },
    {
      to: '/architecture',
      label: 'Conceptual SOA Architecture',
      icon: Layers,
      badge: 'Simulated',
    },
    {
      to: '/about',
      label: 'About Group 17 Project',
      icon: Info,
      badge: null,
    },
  ];

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-6">
      <div className="space-y-6">
        {/* Active Role Indicator Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-100/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
              Active Persona
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-200 text-violet-800">
              {currentUser?.role}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-violet-300"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{currentUser?.title}</p>
            </div>
          </div>
        </div>

        {/* Primary Role Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isLearner ? 'Learner Portal' : 'Editor Operations'}
          </p>
          {(isLearner ? learnerNavItems : editorNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to.includes('/review') && location.pathname.includes('/review'));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Cross-Cutting SOA & Project Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            SOA System Architecture
          </p>
          {systemNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Critical Completion Rule Progress Box */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${isOverallComplete ? 'text-emerald-600' : 'text-violet-600'}`}
            />
            Workflow Rule
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOverallComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isOverallComplete ? 'COMPLETE' : 'INCOMPLETE'}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isOverallComplete ? 'bg-emerald-500' : 'bg-violet-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{acceptedReadingsCount} of {totalRequiredReadings} accepted</span>
          <span className="font-mono font-bold text-slate-700">{completionPercentage}%</span>
        </div>

        <p className="text-[10px] text-slate-500 leading-tight">
          Requires usable delivered format & explicit learner acceptance on all required readings.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200/90 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
