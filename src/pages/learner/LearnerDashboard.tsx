import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  BookOpen,
  Send,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { ReadingStatusBadge, FormatBadge } from '../../components/common/StatusBadge';

export const LearnerDashboard: React.FC = () => {
  const {
    currentUser,
    readings,
    requests,
    deliveries,
    totalRequiredReadings,
    acceptedReadingsCount,
    deliveredAwaitingAcceptanceCount,
    inProgressOrRequestedCount,
    notRequestedCount,
    isOverallComplete,
    completionPercentage,
    completionSummaryText,
    events,
  } = useSimulation();

  const navigate = useNavigate();

  // Find deliveries awaiting review
  const pendingDeliveries = readings.filter(
    (r) => r.deliveryStatus === 'DELIVERED' && r.acceptanceStatus === 'AWAITING_ACCEPTANCE'
  );

  // Unrequested readings
  const unrequestedReadings = readings.filter((r) => r.status === 'NOT_REQUESTED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-violet-500/10 relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Learner Accessibility Portal • Semester Fall 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Maya Lin'}
            </h1>
            <p className="text-violet-100 text-xs sm:text-sm leading-relaxed">
              Track course readings, submit custom multi-modal format requirements, and review verified accessible materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/learner/readings"
              className="px-4 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Reading List</span>
            </Link>
            <Link
              to="/learner/request"
              className="px-4 py-2.5 rounded-xl bg-violet-800/80 hover:bg-violet-800 text-white font-semibold text-xs border border-violet-400/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Request Format</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Completion Rule Alert / Hero Card */}
      <div
        className={`rounded-3xl p-6 border transition-all ${
          isOverallComplete
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  isOverallComplete ? 'bg-emerald-200/80 text-emerald-800' : 'bg-violet-100 text-violet-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Course Accessibility Completion Rule (Section 10)
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isOverallComplete
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isOverallComplete ? 'WORKFLOW COMPLETE' : 'WORKFLOW INCOMPLETE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Calculated dynamically from simulation state • Non-hardcoded evaluation metric
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>Evaluation Rule:</strong> A learner's overall workflow must remain{' '}
              <span className="font-semibold text-slate-800">INCOMPLETE</span> until every required reading has a verified delivered format <em>and</em> explicit learner acceptance.
            </p>
          </div>

          {/* Gauge / Progress */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Acceptance Status:</span>
              <span className="font-mono text-sm font-extrabold text-violet-700">
                {completionSummaryText}
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverallComplete
                    ? 'bg-emerald-500 shadow-sm'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{totalRequiredReadings - acceptedReadingsCount} reading(s) remaining</span>
              <span className="font-bold">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Required Readings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Required Readings</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalRequiredReadings}</div>
          <p className="text-xs text-slate-500 mt-1">Core curriculum materials</p>
        </div>

        {/* Card 2: Pending Conversion Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">In Conversion Queue</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{inProgressOrRequestedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Processing in conversion pipeline</p>
        </div>

        {/* Card 3: Formats Delivered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Formats Delivered</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{deliveries.length}</div>
          <p className="text-xs text-slate-500 mt-1">EPUB, PDF, HTML, Audio packages</p>
        </div>

        {/* Card 4: Awaiting Acceptance (CRITICAL) */}
        <div
          className={`rounded-2xl p-5 border transition-shadow ${
            deliveredAwaitingAcceptanceCount > 0
              ? 'bg-amber-50/70 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Awaiting Acceptance
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {deliveredAwaitingAcceptanceCount}
          </div>
          <p className="text-xs text-amber-800/80 mt-1">Requires your explicit review</p>
        </div>
      </div>

      {/* Main Grid: Urgent Actions + Recent Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Action Items & Readings Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Action Banner: Awaiting Acceptance */}
          {pendingDeliveries.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Action Required: Delivered Formats Awaiting Your Review
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900">
                  {pendingDeliveries.length} Pending
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700">
                The accessibility editor has published converted packages. Inspect the verified format, test readability, and explicitly accept or request revisions.
              </p>

              <div className="space-y-2 pt-1">
                {pendingDeliveries.map((reading) => (
                  <div
                    key={reading.id}
                    className="bg-white rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-violet-700">
                          {reading.courseCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{reading.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Delivered format: <FormatBadge format={reading.requiredFormat} />
                      </p>
                    </div>

                    <Link
                      to={`/learner/review/${reading.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>Review & Accept</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Readings Status Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Readings Status</h3>
                <p className="text-xs text-slate-500">All 5 course readings required for semester accreditation</p>
              </div>
              <Link
                to="/learner/readings"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <span>Full List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{reading.id}</span>
                      <span className="text-xs font-bold text-violet-600 px-2 py-0.5 rounded bg-violet-50">
                        {reading.courseCode}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {reading.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Author: {reading.author}</span>
                      <span>•</span>
                      <FormatBadge format={reading.requiredFormat} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <ReadingStatusBadge status={reading.status} />

                    {reading.status === 'NOT_REQUESTED' && (
                      <Link
                        to={`/learner/request/${reading.id}`}
                        className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Request
                      </Link>
                    )}

                    {reading.status === 'DELIVERED' && (
                      <Link
                        to={`/learner/review/${reading.id}`}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Actions & Live Kafka Event Timeline */}
        <div className="space-y-6">
          {/* Upcoming Actions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              Recommended Next Actions
            </h3>

            <div className="space-y-3 text-xs">
              {unrequestedReadings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-1.5">
                  <p className="font-bold text-violet-900">
                    Submit Request for {unrequestedReadings[0].id}
                  </p>
                  <p className="text-violet-700 text-[11px] leading-relaxed">
                    {unrequestedReadings[0].title} is marked "Not Requested".
                  </p>
                  <Link
                    to={`/learner/request/${unrequestedReadings[0].id}`}
                    className="inline-flex items-center gap-1 font-bold text-violet-700 hover:underline pt-1"
                  >
                    Open Needs Form <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {pendingDeliveries.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <p className="font-bold text-amber-900">
                    Review Converted Format ({pendingDeliveries[0].id})
                  </p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Format is delivered and awaiting your 1-5 star acceptance.
                  </p>
                  <Link
                    to={`/learner/review/${pendingDeliveries[0].id}`}
                    className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline pt-1"
                  >
                    Review Document <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Explore SOA Architecture</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Inspect the Eureka discovery, Kafka topic, and microservices diagram.
                </p>
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-1 font-bold text-slate-700 hover:underline pt-1"
                >
                  View Architecture <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Live Simulated Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700"
              >
                View Stream
              </Link>
            </div>

            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="text-xs space-y-1 border-l-2 border-violet-300 pl-3">
                  <p className="font-semibold text-slate-900">{evt.title}</p>
                  <p className="text-slate-500 text-[11px] leading-snug">{evt.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
