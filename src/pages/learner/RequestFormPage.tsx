import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { AccessibleFormatType, UrgencyLevel } from '../../types';
import {
  FileText,
  BookOpen,
  FileCode2,
  Volume2,
  FileSpreadsheet,
  Binary,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  LucideIcon,
} from 'lucide-react';

const FORMAT_OPTIONS: {
  id: AccessibleFormatType;
  title: string;
  description: string;
  icon: LucideIcon;
  recommendation: string;
}[] = [
  {
    id: 'EPUB',
    title: 'EPUB 3 (Reflowable Layout)',
    description: 'Reflowable typography with responsive font scaling, MathML equations, and table of contents bookmarks.',
    icon: BookOpen,
    recommendation: 'Recommended for tablet readers, Apple Books, and Calibre.',
  },
  {
    id: 'ACCESSIBLE_PDF',
    title: 'Accessible PDF (Tagged PDF/UA)',
    description: 'Fully tagged PDF with vector text OCR layer, alt text for diagrams, and strict heading navigation.',
    icon: FileText,
    recommendation: 'Recommended for Adobe Acrobat Pro, Foxit, and PAC 2024 compliance.',
  },
  {
    id: 'SCREEN_READER_HTML',
    title: 'Screen-Reader Semantic HTML5',
    description: 'Clean HTML5 with ARIA landmarks, skip links, table headers (<th scope="col">), and clean semantic markup.',
    icon: FileCode2,
    recommendation: 'Recommended for NVDA, JAWS, and VoiceOver users.',
  },
  {
    id: 'AUDIO_MP3',
    title: 'Human/Neural Audio Narration (MP3)',
    description: '48kHz audio speech narration with chapter-by-chapter tracks and synchronized SRT text transcripts.',
    icon: Volume2,
    recommendation: 'Recommended for auditory learners and visually impaired students.',
  },
  {
    id: 'LARGE_PRINT',
    title: 'Large Print (28pt - 36pt High Contrast)',
    description: 'Enlarged high-contrast sans-serif typography, exaggerated line spacing, and single-column layout.',
    icon: FileSpreadsheet,
    recommendation: 'Recommended for students with low vision or macular degeneration.',
  },
  {
    id: 'BRAILLE_READY_BRF',
    title: 'Braille-Ready File (.BRF format)',
    description: 'UEB (Unified English Braille) Grade 2 formatting compatible with refreshable braille displays and embossers.',
    icon: Binary,
    recommendation: 'Recommended for tactile braille readers and embossers.',
  },
];

const ADDITIONAL_REQUIREMENT_PRESETS = [
  'Full MathML support for mathematical derivations & equations',
  'Vector SVG illustrations with long-form audio/screen-reader alt descriptions',
  'Strict WCAG 2.1 AA color contrast (minimum 4.5:1 / 7:1 ratio)',
  'Multi-column layout flattened to single continuous linear reading order',
  'Synchronized word-level caption transcript (SRT / WebVTT)',
  'Table accessibility with explicit column and row headers',
];

export const RequestFormPage: React.FC = () => {
  const { readingId: urlReadingId } = useParams<{ readingId?: string }>();
  const navigate = useNavigate();
  const { readings, submitFormatRequest, currentUser } = useSimulation();

  const [selectedReadingId, setSelectedReadingId] = useState<string>(urlReadingId || '');
  const [selectedFormat, setSelectedFormat] = useState<AccessibleFormatType>('EPUB');
  const [urgency, setUrgency] = useState<UrgencyLevel>('NORMAL');
  const [additionalRequirements, setAdditionalRequirements] = useState<string[]>([
    'Full MathML support for mathematical derivations & equations',
    'Strict WCAG 2.1 AA color contrast (minimum 4.5:1 / 7:1 ratio)',
  ]);
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{ reading?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<{ requestId: string; taskId: string } | null>(null);

  useEffect(() => {
    if (urlReadingId) {
      setSelectedReadingId(urlReadingId);
    } else if (readings.length > 0 && !selectedReadingId) {
      // Default to unrequested reading if available
      const unreq = readings.find((r) => r.status === 'NOT_REQUESTED');
      if (unreq) setSelectedReadingId(unreq.id);
      else setSelectedReadingId(readings[0].id);
    }
  }, [urlReadingId, readings]);

  const toggleRequirement = (req: string) => {
    setAdditionalRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const selectedReading = readings.find((r) => r.id === selectedReadingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReadingId) {
      setErrors({ reading: 'Please select a required reading.' });
      return;
    }
    setErrors({});

    const result = submitFormatRequest({
      readingId: selectedReadingId,
      format: selectedFormat,
      additionalRequirements,
      notes,
      urgency,
    });

    if (result.success) {
      setSubmittedResult(result);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted && submittedResult) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Request Dispatched • Kafka Event Published
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Accessibility Request Created!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your accessibility conversion request has been logged in the simulation state and routed to the Accessibility Editor queue.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Request Reference ID:</span>
              <span className="font-mono font-bold text-violet-700">{submittedResult.requestId}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Assigned Conversion Task ID:</span>
              <span className="font-mono font-bold text-indigo-700">{submittedResult.taskId}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Reading Title:</span>
              <span className="font-bold text-slate-900 truncate max-w-xs">{selectedReading?.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Requested Format:</span>
              <span className="font-bold text-violet-600">{selectedFormat}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/learner/dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Return to Learner Dashboard
            </button>
            <button
              onClick={() => navigate('/editor/queue')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              View in Editor Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            to="/learner/readings"
            className="text-xs text-violet-600 hover:underline font-semibold"
          >
            ← Back to Reading List
          </Link>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Submit Accessibility Format Request
        </h1>
        <p className="text-xs text-slate-500">
          Specify exact assistive format characteristics, WCAG compliance standards, and pedagogical notes for conversion editors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Reading */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              Select Required Reading
            </h3>
            <span className="text-xs text-slate-400">Required</span>
          </div>

          <div>
            <label htmlFor="reading-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Course Reading Title
            </label>
            <select
              id="reading-select"
              value={selectedReadingId}
              onChange={(e) => setSelectedReadingId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="">-- Choose a reading --</option>
              {readings.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.id}] {r.courseCode} - {r.title} ({r.status === 'NOT_REQUESTED' ? 'Ready for Request' : r.status})
                </option>
              ))}
            </select>
            {errors.reading && <p className="text-xs text-rose-600 mt-1">{errors.reading}</p>}
          </div>

          {selectedReading && (
            <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-violet-900">
                  {selectedReading.courseCode}: {selectedReading.title}
                </p>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white font-bold text-violet-800 border border-violet-200">
                  {selectedReading.status}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Original format: <span className="font-semibold">{selectedReading.originalFormat}</span> • Author: {selectedReading.author}
              </p>
              <p className="text-slate-500 text-[11px] line-clamp-1">{selectedReading.shortDescription}</p>

              {selectedReading.status !== 'NOT_REQUESTED' && selectedReading.status !== 'REVISION_REQUESTED' && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>
                    This reading currently has status <strong>{selectedReading.status}</strong>. Duplicate requests are prevented while conversion is in progress or completed.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Choose Target Format */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              Target Accessible Format
            </h3>
            <span className="text-xs text-slate-400">Select one</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedFormat === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedFormat(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/50 shadow-xs ring-2 ring-violet-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{opt.title}</h4>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">{opt.description}</p>
                  <span className="text-[10px] text-violet-700 font-semibold">{opt.recommendation}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Priority & Urgency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              Urgency & Academic Priority
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'NORMAL', label: 'Normal (Standard Curriculum)', desc: 'Converted within 3-5 business days' },
              { id: 'HIGH', label: 'High (Upcoming Lab / Assignment)', desc: 'Prioritized within 48 hours' },
              { id: 'CRITICAL', label: 'Critical (Midterm / Final Exam)', desc: 'Immediate emergency turnaround' },
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setUrgency(lvl.id as UrgencyLevel)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  urgency === lvl.id
                    ? 'border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{lvl.label}</span>
                  {urgency === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Specific Accessibility Requirements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              Specific Technical Requirements
            </h3>
            <span className="text-xs text-slate-400">Check all that apply</span>
          </div>

          <div className="space-y-2">
            {ADDITIONAL_REQUIREMENT_PRESETS.map((req) => {
              const isChecked = additionalRequirements.includes(req);
              return (
                <label
                  key={req}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isChecked ? 'border-violet-300 bg-violet-50/40' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleRequirement(req)}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <span className="font-medium text-slate-800">{req}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Step 5: Notes for Conversion Editor */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
              5
            </span>
            Notes for Accessibility Editor
          </h3>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., I will be using NVDA 2024 on Windows with MathPlayer. Please ensure Figure 3.2 is described thoroughly."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/learner/readings')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !selectedReadingId ||
              (selectedReading &&
                selectedReading.status !== 'NOT_REQUESTED' &&
                selectedReading.status !== 'REVISION_REQUESTED')
            }
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all cursor-pointer"
          >
            <span>
              {selectedReading &&
              selectedReading.status !== 'NOT_REQUESTED' &&
              selectedReading.status !== 'REVISION_REQUESTED'
                ? `Request Already Active (${selectedReading.status})`
                : 'Submit Accessibility Request'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
