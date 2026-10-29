import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { DEMO_USERS } from '../data/seedData';
import {
  BookOpen,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs, currentUser } = useSimulation();
  const navigate = useNavigate();

  const handleSelectRole = (role: 'LEARNER' | 'EDITOR') => {
    loginAs(role);
    if (role === 'LEARNER') {
      navigate('/learner/dashboard');
    } else {
      navigate('/editor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FE] via-white to-violet-50/40 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Accessible<span className="text-violet-600">Format</span> Request
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Project ID: SOA-S09-T17 • Team: Group 17
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
            Demo Evaluation Mode
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            Frontend-Only Service-Oriented Architecture Simulation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select a Demo Role to Begin Evaluation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Demonstrating end-to-end academic accessibility workflows: format requirement submission, multi-stage conversion state machine, format delivery, and mandatory learner acceptance.
          </p>
        </div>

        {/* Two Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Learner Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <img
                  src={DEMO_USERS.LEARNER.avatar}
                  alt={DEMO_USERS.LEARNER.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-200 shadow-sm"
                />
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  Learner Persona
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                  {DEMO_USERS.LEARNER.name}
                </h3>
                <p className="text-xs font-semibold text-violet-600">{DEMO_USERS.LEARNER.title}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {DEMO_USERS.LEARNER.departmentOrStudentId}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Learner Capabilities:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>View 5 required academic readings & status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Submit accessibility requests (EPUB, PDF, Audio, Braille)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Test delivered files with accessible document viewer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Explicit Acceptance:</strong> Accept with 1-5 rating or request revision</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSelectRole('LEARNER')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md shadow-violet-500/20 transition-all cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Enter as Learner (Maya Lin)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Accessibility Editor Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <img
                  src={DEMO_USERS.EDITOR.avatar}
                  alt={DEMO_USERS.EDITOR.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-sm"
                />
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Editor Persona
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {DEMO_USERS.EDITOR.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-600">{DEMO_USERS.EDITOR.title}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {DEMO_USERS.EDITOR.departmentOrStudentId}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Editor Capabilities:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>View Conversion Queue with priorities & filters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Enforce state machine: REQUESTED → ASSIGNED → IN_CONVERSION</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Conduct WCAG Quality Checks & audits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Record format delivery & publish simulated Kafka events</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSelectRole('EDITOR')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Enter as Editor (David Chen)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Academic Evaluation Notice */}
        <div className="mt-10 max-w-3xl mx-auto bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-center text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Evaluator Note: Simulated Authentication
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            These accounts are simulated client-side for academic SOA evaluation. No backend microservice or external OAuth server is required. State is saved directly in browser storage and can be reset at any point via the "Reset Demo" button.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-slate-400 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Accessible Learning Format Request • SOA College Project Group 17</span>
        <span className="font-mono">Project ID: SOA-S09-T17 • Evaluator Edition</span>
      </footer>
    </div>
  );
};
