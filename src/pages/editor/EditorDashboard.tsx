import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  ListOrdered,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Sliders,
} from 'lucide-react';
import { TaskStatusBadge, FormatBadge, UrgencyBadge } from '../../components/common/StatusBadge';

export const EditorDashboard: React.FC = () => {
  const { tasks, currentUser, assignTask, startConversion, readings } = useSimulation();
  const navigate = useNavigate();

  const totalTasks = tasks.length;
  const pendingRequestedTasks = tasks.filter((t) => t.status === 'REQUESTED');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_CONVERSION' || t.status === 'ASSIGNED');
  const awaitingQcTasks = tasks.filter((t) => t.status === 'QUALITY_CHECK');
  const deliveredTasks = tasks.filter((t) => t.status === 'DELIVERED');
  const revisionRequestedTasks = tasks.filter((t) => t.status === 'REVISION_REQUESTED');

  const pendingAcceptanceReadings = readings.filter(
    (r) => r.deliveryStatus === 'DELIVERED' && r.acceptanceStatus === 'AWAITING_ACCEPTANCE'
  );

  return (
    <div className="space-y-6">
      {/* Editor Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conversion Specialist Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Accessibility Editor Workspace: {currentUser?.name || 'David Chen'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Process document conversion pipelines, enforce WCAG 2.1 AA/AAA compliance, run MathML validation, and dispatch delivered formats to learners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/editor/queue"
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ListOrdered className="w-4 h-4" />
              <span>View Full Queue ({totalTasks})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Tasks</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalTasks}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">All active & completed</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-violet-600">Pending Requests</span>
          <div className="text-2xl font-extrabold text-violet-700 mt-1">
            {pendingRequestedTasks.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Unassigned queue</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-blue-600">In Conversion</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{inProgressTasks.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Pipeline running</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-amber-600">Quality Check</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{awaitingQcTasks.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting QA audit</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Delivered</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {deliveredTasks.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Package published</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-rose-600">Revisions</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">
            {revisionRequestedTasks.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Learner feedback</p>
        </div>
      </div>

      {/* Main Grid: Priority Conversion Queue + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Immediate Conversion Tasks</h2>
                <p className="text-xs text-slate-500">Tasks requiring specialist assignment or status progression</p>
              </div>
              <Link
                to="/editor/queue"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{task.id}</span>
                      <UrgencyBadge urgency={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition-colors">
                      {task.readingTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Learner: <strong className="text-slate-700">{task.learnerName}</strong></span>
                      <span>•</span>
                      <span>Target: <FormatBadge format={task.requestedFormat} /></span>
                      <span>•</span>
                      <span>Editor: {task.assignedEditorName || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {task.status === 'REQUESTED' && (
                      <button
                        onClick={() => assignTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Assign to Me
                      </button>
                    )}

                    {task.status === 'ASSIGNED' && (
                      <button
                        onClick={() => startConversion(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Start Conversion
                      </button>
                    )}

                    <Link
                      to={`/editor/task/${task.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: QA Checklist & Critical Rule reminder */}
        <div className="space-y-6">
          {/* Quality Assurance Standards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Conversion QA Protocols
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Before marking a delivery, all files must pass verification against the following accessibility criteria:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>PAC 2024 / PDF-UA:</strong> Strict tag tree with 0 structural errors.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>MathML MathPlayer:</strong> LaTeX formulas voiced semantically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Vector Alt Descriptions:</strong> Long descriptions for all diagrams.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Explicit Acceptance:</strong> Delivers must await learner sign-off.</span>
              </li>
            </ul>
          </div>

          {/* Pending Acceptance Monitor */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Awaiting Learner Sign-Off</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                {pendingAcceptanceReadings.length} Active
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Deliveries awaiting explicit review by Maya Lin. Delivery alone does not satisfy the completion rule until accepted.
            </p>

            <div className="space-y-2 pt-1">
              {pendingAcceptanceReadings.map((r) => (
                <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{r.title}</span>
                    <span className="text-[10px] font-mono text-amber-700 font-bold">AWAITING</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Delivered: {r.requiredFormat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
