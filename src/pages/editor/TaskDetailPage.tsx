import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { TaskStatus, AccessibleFormatType } from '../../types';
import {
  ListOrdered,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Play,
  ShieldCheck,
  Send,
  FileCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { TaskStatusBadge, FormatBadge, UrgencyBadge } from '../../components/common/StatusBadge';

export const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const {
    tasks,
    readings,
    requests,
    assignTask,
    startConversion,
    submitForQualityCheck,
    passQualityCheck,
    failQualityCheck,
    returnTaskForRevisionByEditor,
    recordDelivery,
    currentUser,
  } = useSimulation();

  const task = tasks.find((t) => t.id === taskId);
  const reading = readings.find((r) => r.id === task?.readingId);
  const request = requests.find((r) => r.id === task?.requestId);

  const [failQcReason, setFailQcReason] = useState('');
  const [showFailQcModal, setShowFailQcModal] = useState(false);
  const [internalRevisionReason, setInternalRevisionReason] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [customFileSize, setCustomFileSize] = useState('6.2 MB');

  if (!task) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 max-w-md mx-auto my-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Task Not Found</h2>
        <p className="text-xs text-slate-500">The requested conversion task does not exist.</p>
        <Link
          to="/editor/queue"
          className="inline-block px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs"
        >
          Return to Queue
        </Link>
      </div>
    );
  }

  // Strict state machine valid transition checks:
  // Delivery is allowed ONLY from QUALITY_CHECK when qualityCheckStatus === 'PASSED'!
  const canAssign = task.status === 'REQUESTED' || task.status === 'REVISION_REQUESTED';
  const canStartConversion = task.status === 'ASSIGNED' || task.status === 'REVISION_REQUESTED';
  const canSubmitQc = task.status === 'IN_CONVERSION';
  const canPassQc = task.status === 'QUALITY_CHECK' && task.qualityCheckStatus !== 'PASSED';
  const canFailQc = task.status === 'QUALITY_CHECK';
  const canReturnRevision = task.status === 'QUALITY_CHECK';
  const canDeliver = task.status === 'QUALITY_CHECK' && task.qualityCheckStatus === 'PASSED';

  const steps: { key: TaskStatus; label: string; desc: string }[] = [
    { key: 'REQUESTED', label: '1. Requested', desc: 'Received via Format Need Service' },
    { key: 'ASSIGNED', label: '2. Assigned', desc: 'Claimed by media specialist' },
    { key: 'IN_CONVERSION', label: '3. In Conversion', desc: 'OCR, tagging, audio/MathML generation' },
    { key: 'QUALITY_CHECK', label: '4. Quality Check', desc: 'WCAG 2.1 AA/AAA compliance audit' },
    { key: 'DELIVERED', label: '5. Delivered', desc: 'Published to learner for explicit sign-off' },
  ];

  const getStepState = (stepKey: TaskStatus) => {
    const order: TaskStatus[] = ['REQUESTED', 'ASSIGNED', 'IN_CONVERSION', 'QUALITY_CHECK', 'DELIVERED'];
    const currentIndex = order.indexOf(task.status);
    const stepIndex = order.indexOf(stepKey);

    if (task.status === 'REVISION_REQUESTED') {
      if (stepKey === 'IN_CONVERSION') return 'current';
      if (stepKey === 'REQUESTED' || stepKey === 'ASSIGNED') return 'completed';
      return 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const handleRecordDeliveryConfirm = () => {
    recordDelivery(task.id, {
      fileName: customFileName || undefined,
      fileSize: customFileSize || undefined,
    });
    setShowDeliveryModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/editor/queue" className="text-xs text-violet-600 hover:underline font-semibold">
            ← Back to Conversion Queue
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Task {task.id}
            </h1>
            <TaskStatusBadge status={task.status} />
            <UrgencyBadge urgency={task.priority} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Reading: <strong>{task.readingTitle}</strong> • Learner: {task.learnerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Assigned Specialist:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-800 text-xs border border-slate-200">
            {task.assignedEditorName || 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Visual State Machine Stepper */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Conversion Workflow State Machine
          </h2>
          <span className="text-xs font-mono text-slate-400">Progress: {task.progressPercent}%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((st) => {
            const state = getStepState(st.key);
            return (
              <div
                key={st.key}
                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                  state === 'completed'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : state === 'current'
                    ? 'bg-violet-50/90 border-violet-400 text-violet-950 ring-2 ring-violet-500/20 shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{st.label}</span>
                  {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {state === 'current' && <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />}
                </div>
                <p className="text-[10px] opacity-80 leading-snug">{st.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Controls for State Machine Transitions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Available State Machine Actions:</span>

          <div className="flex flex-wrap items-center gap-2">
            {canAssign && (
              <button
                onClick={() => assignTask(task.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign to Me</span>
              </button>
            )}

            {canStartConversion && (
              <button
                onClick={() => startConversion(task.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Conversion</span>
              </button>
            )}

            {canSubmitQc && (
              <button
                onClick={() => submitForQualityCheck(task.id, 'Passed automated EPUBCheck and MathPlayer tests.')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Submit for Quality Check</span>
              </button>
            )}

            {canPassQc && (
              <>
                <button
                  onClick={() => passQualityCheck(task.id, 'WCAG 2.1 AA certified with 0 violations.')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Quality Check</span>
                </button>

                <button
                  onClick={() => setShowFailQcModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Reject Quality Check (Fail QA)</span>
                </button>
              </>
            )}

            {task.status === 'QUALITY_CHECK' && task.qualityCheckStatus !== 'PASSED' && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                Delivery Locked until Quality Check is Approved
              </span>
            )}

            {canReturnRevision && (
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Remediation</span>
              </button>
            )}

            {canDeliver && (
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer animate-pulse"
              >
                <FileCheck className="w-4 h-4" />
                <span>Record Format Delivery</span>
              </button>
            )}

            {task.status === 'DELIVERED' && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                ✓ Format Delivered • Awaiting Learner Acceptance
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Reading & Learner Specs + Audit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Target Material Specifications</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Course:</span>
              <span className="font-bold text-slate-900">{reading?.courseCode} - {reading?.courseName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Requested Format:</span>
              <FormatBadge format={task.requestedFormat} />
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Learner Name:</span>
              <span className="font-semibold text-slate-900">{task.learnerName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Source Document:</span>
              <span className="font-semibold text-slate-700">{reading?.originalFormat}</span>
            </div>
          </div>

          {request?.additionalRequirements && request.additionalRequirements.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-700">Special Accessibility Criteria:</span>
              <ul className="space-y-1 text-xs text-slate-600">
                {request.additionalRequirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {request?.notes && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500">Learner Notes:</span>
              <p className="text-slate-700 italic mt-0.5">"{request.notes}"</p>
            </div>
          )}
        </div>

        {/* Quality Audit Record */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Quality Check Verification Audit
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Audit Status:</span>
              <span
                className={`font-bold ${
                  task.status === 'DELIVERED'
                    ? 'text-emerald-700'
                    : task.status === 'QUALITY_CHECK'
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}
              >
                {task.status === 'DELIVERED'
                  ? 'Certified WCAG 2.1 AA'
                  : task.status === 'QUALITY_CHECK'
                  ? 'In Audit Verification'
                  : 'Pending QA Phase'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {task.qualityCheckNotes || 'Automated verification check running against PAC 2024 standards.'}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span>MathML Speech Validation:</span>
              <span className="font-bold text-emerald-600">100% Passed</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span>Contrast Ratio Check:</span>
              <span className="font-bold text-emerald-600">7.1:1 (AAA)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Logical Reading Order:</span>
              <span className="font-bold text-emerald-600">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task History Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Task Audit Trail & State Transitions</h3>

        <div className="space-y-3">
          {task.history.map((h, i) => (
            <div key={h.id || i} className="text-xs flex items-start gap-3 border-l-2 border-violet-400 pl-3">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{h.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    by {h.actor}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {h.notes || `State transitioned: ${h.fromStatus} → ${h.toStatus}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Record Delivery */}
      {showDeliveryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Conversion Pipeline Complete
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Record Delivery & Publish Event
              </h3>
              <p className="text-xs text-slate-500">
                This will publish the simulated Kafka event <code className="font-mono text-violet-700">AccessibleFormatDelivered</code> on topic <code className="font-mono text-violet-700">soa.s09.t17.events</code>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivered Package File Name</label>
                <input
                  type="text"
                  placeholder="e.g., CS401_Distributed_Consensus_Accessible.epub"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Package Size</label>
                <input
                  type="text"
                  value={customFileSize}
                  onChange={(e) => setCustomFileSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Important SOA Rule Reminder:</strong> Delivery does NOT mark the reading as accepted. The learner must independently review and explicitly accept the package.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeliveryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordDeliveryConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Internal Revision */}
      {showRevisionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Return for Quality Fixes</h3>
            <p className="text-xs text-slate-600">
              Provide feedback notes explaining why this file did not pass QA audit. Task will return to <code className="font-mono text-blue-600">IN_CONVERSION</code>.
            </p>
            <textarea
              rows={3}
              value={internalRevisionReason}
              onChange={(e) => setInternalRevisionReason(e.target.value)}
              placeholder="e.g., Heading level 3 skipped after Heading 1 on page 8."
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  returnTaskForRevisionByEditor(task.id, internalRevisionReason || 'Quality check revisions needed.');
                  setShowRevisionModal(false);
                }}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Return to In Conversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fail Quality Check */}
      {showFailQcModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject & Fail Quality Check</h3>
                <p className="text-xs text-slate-500">Task will be returned to IN_CONVERSION</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Delivery will be blocked. State will return to <code className="font-mono text-blue-600 font-bold">IN_CONVERSION</code> and the task must be re-submitted for quality verification once fixed.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Failure / Audit Defect Reason (Required):
              </label>
              <textarea
                rows={3}
                value={failQcReason}
                onChange={(e) => setFailQcReason(e.target.value)}
                placeholder="e.g., Section 2 formulas are missing MathPlayer tags; Figure 1.2 contrast ratio is 3.1:1 (fails minimum 4.5:1 requirement)."
                className="w-full p-3 text-xs rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFailQcModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!failQcReason.trim()}
                onClick={() => {
                  failQualityCheck(task.id, failQcReason);
                  setShowFailQcModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm QC Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
