import React from 'react';
import { useSimulation, GUIDED_DEMO_STEPS } from '../../context/SimulationContext';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Play,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCheck,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const {
    currentUser,
    switchRole,
    guidedDemoStep,
    setGuidedDemoStep,
    isGuidedDemoOpen,
    setIsGuidedDemoOpen,
    nextDemoStep,
    prevDemoStep,
    performAutoStepAction,
    isOverallComplete,
    completionSummaryText,
  } = useSimulation();

  const navigate = useNavigate();
  const currentStep = GUIDED_DEMO_STEPS[guidedDemoStep - 1] || GUIDED_DEMO_STEPS[0];

  const handleNavigateToRecommended = () => {
    if (currentStep.recommendedRoute) {
      navigate(currentStep.recommendedRoute);
    }
  };

  const handleAutoRun = () => {
    performAutoStepAction(guidedDemoStep);
    if (currentStep.recommendedRoute) {
      navigate(currentStep.recommendedRoute);
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs transition-all">
      {/* Top compact bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DEMO MODE • Group 17 (SOA-S09-T17)
          </div>
          <span className="hidden sm:inline text-slate-400">
            Frontend SOA Workflow Simulation • Browser Persistence Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active persona quick-switch indicator */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400">Role:</span>
            <span className="font-semibold text-slate-200">{currentUser?.name || 'Guest'}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-violet-900/60 text-violet-300 border border-violet-700/50">
              {currentUser?.role === 'LEARNER' ? 'Learner' : 'Accessibility Editor'}
            </span>
            <button
              onClick={() => switchRole(currentUser?.role === 'LEARNER' ? 'EDITOR' : 'LEARNER')}
              className="ml-1 text-violet-400 hover:text-violet-200 underline text-[11px] font-medium cursor-pointer"
              title="Toggle role immediately"
            >
              Switch to {currentUser?.role === 'LEARNER' ? 'Editor' : 'Learner'}
            </button>
          </div>

          {/* Guided Tour toggle */}
          <button
            onClick={() => setIsGuidedDemoOpen(!isGuidedDemoOpen)}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-semibold">Guided Demo ({guidedDemoStep}/10)</span>
            {isGuidedDemoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Guided Demo stepper drawer */}
      {isGuidedDemoOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-3">
          <div className="max-w-7xl mx-auto space-y-3">
            {/* Step badges selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {GUIDED_DEMO_STEPS.map((s) => {
                const isActive = s.step === guidedDemoStep;
                const isPast = s.step < guidedDemoStep;
                return (
                  <button
                    key={s.step}
                    onClick={() => {
                      setGuidedDemoStep(s.step);
                      if (s.recommendedRoute) navigate(s.recommendedRoute);
                    }}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white ring-2 ring-violet-400 shadow-sm'
                        : isPast
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-bold">{s.step}.</span>
                    <span className="truncate max-w-[130px]">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Current Step Instruction Card */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Step {currentStep.step} of 10
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    {currentStep.title}
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Recommended Role: <strong className="text-violet-300">{currentStep.targetRole}</strong>
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
                  {currentStep.description}
                </p>
                <p className="text-violet-300 text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Action Hint: <span className="text-slate-200">{currentStep.actionHint}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={prevDemoStep}
                  disabled={guidedDemoStep <= 1}
                  className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNavigateToRecommended}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 cursor-pointer transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-violet-400" />
                  Go to Screen
                </button>

                <button
                  onClick={handleAutoRun}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
                  title="Simulate this step automatically with realistic data"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Auto-Run Step
                </button>

                <button
                  onClick={nextDemoStep}
                  disabled={guidedDemoStep >= 10}
                  className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
