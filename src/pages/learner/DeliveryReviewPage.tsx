import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { SimulatedDocumentViewer } from '../../components/common/SimulatedDocumentViewer';
import {
  FileCheck,
  CheckCircle2,
  RotateCcw,
  Star,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  ReadingStatusBadge,
  FormatBadge,
  AcceptanceStatusBadge,
} from '../../components/common/StatusBadge';

export const DeliveryReviewPage: React.FC = () => {
  const { readingId: urlReadingId } = useParams<{ readingId?: string }>();
  const navigate = useNavigate();
  const {
    readings,
    deliveries,
    reviews,
    acceptDelivery,
    requestRevisionByLearner,
    currentUser,
    isOverallComplete,
    completionSummaryText,
  } = useSimulation();

  // Find target reading: if urlReadingId is provided, strictly lookup that reading.
  // Otherwise default to the first reading awaiting acceptance, or first delivered reading.
  const targetReading = urlReadingId
    ? readings.find((r) => r.id === urlReadingId)
    : readings.find((r) => r.deliveryStatus === 'DELIVERED' && r.acceptanceStatus === 'AWAITING_ACCEPTANCE') ||
      readings.find((r) => r.deliveryStatus === 'DELIVERED');

  const delivery = targetReading
    ? deliveries.find((d) => d.id === targetReading.currentDeliveryId || d.readingId === targetReading.id)
    : undefined;

  const existingReview = targetReading ? reviews.find((rev) => rev.readingId === targetReading.id) : undefined;

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [actionTab, setActionTab] = useState<'accept' | 'revise'>('accept');
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReading) return;
    const res = acceptDelivery(targetReading.id, rating, feedback);
    if (res.success) {
      setShowCelebrationModal(true);
    }
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReading) return;
    const trimmed = revisionReason.trim();
    if (trimmed.length < 10) return;
    const res = requestRevisionByLearner(targetReading.id, trimmed);
    if (res.success) {
      navigate('/learner/dashboard');
    }
  };

  // If a specific reading ID was in URL but does not exist in store, show proper Not Found!
  if (urlReadingId && !targetReading) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Reading Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          No course reading found matching ID <code className="font-mono text-violet-700 font-bold">{urlReadingId}</code>.
        </p>
        <Link
          to="/learner/readings"
          className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-xs hover:bg-violet-700"
        >
          Return to Reading List
        </Link>
      </div>
    );
  }

  if (!targetReading || !delivery) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-4 max-w-xl mx-auto my-12">
        <Clock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Delivered Format Available Yet</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {targetReading
            ? `Reading "${targetReading.title}" is currently in status "${targetReading.status}". Conversion and quality checking must complete before delivery.`
            : 'No readings currently have a delivered accessible format ready for review. Switch to the Accessibility Editor persona to progress conversion tasks.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/learner/readings"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
          >
            Back to Reading List
          </Link>
          <Link
            to="/editor/queue"
            className="px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs hover:bg-violet-700"
          >
            Open Editor Queue
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadyAccepted = targetReading.acceptanceStatus === 'ACCEPTED';
  const isRevisionRequested = targetReading.acceptanceStatus === 'REVISION_REQUESTED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Reading Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              {targetReading.courseCode}
            </span>
            <span className="text-xs text-slate-400">• Reference: {targetReading.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Delivery Verification & Learner Acceptance
          </h1>
          <p className="text-xs text-slate-500">
            Section 9 & 10 Protocol: Delivery and explicit learner acceptance are separate workflow milestones.
          </p>
        </div>

        {/* Quick selector between all readings with deliveries */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 text-xs self-start sm:self-auto">
          <span className="text-slate-400 font-medium">Select Delivered Reading:</span>
          <select
            value={targetReading.id}
            onChange={(e) => navigate(`/learner/review/${e.target.value}`)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {readings
              .filter((r) => r.deliveryStatus === 'DELIVERED')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.title.slice(0, 30)}... ({r.acceptanceStatus})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Critical Workflow Notice Banner */}
      <div
        className={`rounded-3xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isAlreadyAccepted
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            : isRevisionRequested
            ? 'bg-rose-50/90 border-rose-200 text-rose-950'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isAlreadyAccepted
                ? 'bg-emerald-200 text-emerald-800'
                : isRevisionRequested
                ? 'bg-rose-200 text-rose-800'
                : 'bg-amber-200 text-amber-800 animate-pulse'
            }`}
          >
            {isAlreadyAccepted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isRevisionRequested ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm">
              {isAlreadyAccepted
                ? 'Explicit Learner Acceptance Recorded'
                : isRevisionRequested
                ? 'Revision Requested by Learner'
                : 'Delivered Format Awaiting Your Explicit Decision'}
            </h3>
            <p className="text-xs opacity-90 leading-relaxed">
              {isAlreadyAccepted
                ? 'You have formally verified this accessible package. This counts toward the critical completion requirement.'
                : isRevisionRequested
                ? 'This task has been returned to the Accessibility Editor queue with your feedback notes.'
                : 'Delivery does NOT automatically complete the course requirement. You must review the document below and explicitly choose Accept or Request Revision.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 sm:text-right">
          <AcceptanceStatusBadge status={targetReading.acceptanceStatus} />
        </div>
      </div>

      {/* Interactive Document Viewer Component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Delivered Accessible Artifact Preview & Audio Synthesis
          </h2>
          <span className="text-xs text-slate-400">Interactive Simulation Engine</span>
        </div>
        <SimulatedDocumentViewer
          delivery={delivery}
          readingTitle={targetReading.title}
          courseCode={targetReading.courseCode}
        />
      </div>

      {/* Decision Section: Accept vs Request Revision */}
      {!isAlreadyAccepted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Learner Acceptance Decision
              </h3>
              <p className="text-xs text-slate-500">
                Please make an explicit determination on whether this format satisfies your academic accessibility needs.
              </p>
            </div>

            {/* Toggle Accept vs Revision */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActionTab('accept')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  actionTab === 'accept'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Accept Accessible Format
              </button>
              <button
                type="button"
                onClick={() => setActionTab('revise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  actionTab === 'revise'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Request Revision
              </button>
            </div>
          </div>

          {actionTab === 'accept' ? (
            <form onSubmit={handleAccept} className="space-y-5 animate-in fade-in duration-150">
              {/* Star Rating 1-5 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Rate Conversion Accessibility & Quality (1 to 5 Stars):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} of 5 Stars ({rating === 5 ? 'Excellent WCAG Compliance' : 'Satisfactory'})
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Optional Learner Comments / Pedagogical Feedback:
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., The MathML tags render smoothly in my screen reader, and the contrast is great."
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">
                  Acceptance updates overall course completion metrics dynamically.
                </p>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Accessible Format</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRequestRevision} className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-1">
                <p className="font-bold">Returning Task to Conversion Queue</p>
                <p className="text-[11px] text-rose-700">
                  Please specify exactly what needs revision so the Accessibility Editor can adjust tagging, OCR layers, contrast ratios, or speech narration.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Reason for Revision Request (Required):
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="e.g., The mathematical equations on page 14 are missing voice descriptions, and Figure 2.1 needs higher contrast for low-vision reading."
                  className="w-full p-3.5 text-xs rounded-xl border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
                />
                {revisionReason.trim().length > 0 && revisionReason.trim().length < 10 && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    Please provide at least 10 characters ({10 - revisionReason.trim().length} more needed).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">
                  Status will change to <span className="font-semibold text-rose-700">REVISION_REQUESTED</span>.
                </p>
                <button
                  type="submit"
                  disabled={revisionReason.trim().length < 10}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Submit Revision Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review Summary if already accepted */}
      {isAlreadyAccepted && existingReview && (
        <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Accepted Review Record
            </h3>
            <span className="text-xs text-emerald-800 font-mono">
              Reviewed: {new Date(existingReview.reviewedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= (existingReview.rating || 5)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-emerald-900 ml-1">
              {existingReview.rating || 5}/5 Stars
            </span>
          </div>

          <p className="text-xs text-emerald-900/90 italic bg-white/80 p-3 rounded-xl border border-emerald-200/60">
            "{existingReview.feedback}"
          </p>
        </div>
      )}

      {/* Celebration Modal when Accepted */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Critical Milestone Recorded
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Format Accepted!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your acceptance has updated the central SOA simulation state.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
              <p className="font-semibold text-slate-700">Course Completion Metric:</p>
              <p className="font-mono text-sm font-bold text-violet-700">{completionSummaryText}</p>
              <p className="text-[11px] text-slate-500">
                {isOverallComplete
                  ? 'All 5 readings are now accepted! Course workflow status is COMPLETE.'
                  : 'Workflow remains INCOMPLETE until all 5 required readings are delivered and accepted.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  navigate('/learner/dashboard');
                }}
                className="w-full px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
