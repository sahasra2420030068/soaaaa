import React, { useState, useEffect, useRef } from 'react';
import { Delivery } from '../../types';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Download,
  Type,
  ShieldCheck,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface SimulatedDocumentViewerProps {
  delivery: Delivery;
  readingTitle: string;
  courseCode: string;
}

const DOCUMENT_TEXT = `Section 1.1: System Architecture Overview. In high-availability distributed systems, consistency guarantees require strict synchronization invariants. The fundamental trade-off formalised by Brewer's CAP theorem mandates that under network partitions, a distributed datastore must prioritize either immediate linearizability or partition tolerance. Confidence Interval Invariant: Probability of sample mean minus true mean less than epsilon is greater than or equal to one minus two times exponential of negative two n epsilon squared. Section 1.2: Asynchronous Event Bus Propagation. When service instances interact through message brokers, state transitions are logged monotonically. Event handlers maintain idempotency tokens, ensuring replay safety even during message redelivery. Section 1.3: Verification of Accessibility Compliance. This document has passed structural checks ensuring compatibility with screen-magnification software, braille displays, and auditory reading aids.`;

export const SimulatedDocumentViewer: React.FC<SimulatedDocumentViewerProps> = ({
  delivery,
  readingTitle,
  courseCode,
}) => {
  const [fontSize, setFontSize] = useState<number>(18);
  const [contrastTheme, setContrastTheme] = useState<'light' | 'sepia' | 'dark' | 'yellowOnBlack'>('light');
  const [speechState, setSpeechState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'preview' | 'audit' | 'transcript'>('preview');
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setHasSpeechSupport(true);
    }
    return () => {
      // Clean up speech synthesis and any interval on unmount
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, []);

  // Update speech playback speed if currently playing
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlayAudio = () => {
    if (hasSpeechSupport && typeof window !== 'undefined') {
      if (speechState === 'paused') {
        window.speechSynthesis.resume();
        setSpeechState('playing');
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(DOCUMENT_TEXT);
      utterance.rate = playbackSpeed;
      utteranceRef.current = utterance;

      utterance.onboundary = (e) => {
        if (e.charIndex) {
          const pct = Math.min(100, Math.round((e.charIndex / DOCUMENT_TEXT.length) * 100));
          setAudioProgress(pct);
        }
      };

      utterance.onend = () => {
        setSpeechState('stopped');
        setAudioProgress(100);
      };

      utterance.onerror = () => {
        setSpeechState('stopped');
      };

      window.speechSynthesis.speak(utterance);
      setSpeechState('playing');
    } else {
      // Fallback timer simulation for environments without Web Speech API
      if (speechState === 'playing') return;
      setSpeechState('playing');
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);

      fallbackIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
            setSpeechState('stopped');
            return 0;
          }
          return Math.min(100, prev + 2 * playbackSpeed);
        });
      }, 300);
    }
  };

  const handlePauseAudio = () => {
    if (hasSpeechSupport && typeof window !== 'undefined') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    } else {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
      setSpeechState('paused');
    }
  };

  const handleStopAudio = () => {
    if (hasSpeechSupport && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    setSpeechState('stopped');
    setAudioProgress(0);
  };

  const handleDownloadPackage = () => {
    const element = document.createElement('a');
    const isHtml = delivery.deliveredFormat === 'SCREEN_READER_HTML';
    const ext = isHtml ? 'html' : 'txt';
    const mimeType = isHtml ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8';

    const safeTitle = readingTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const downloadFileName = isHtml
      ? `${delivery.readingId}_${safeTitle}_ScreenReader_Demo.html`
      : `${delivery.readingId}_${safeTitle}_${delivery.deliveredFormat}_Demo_Package.txt`;

    const fileContent = isHtml
      ? `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${readingTitle} - Accessible Screen-Reader HTML Demo</title>
  <!-- Group 17 - SOA Project (SOA-S09-T17) Simulated Accessible Format -->
</head>
<body>
  <header>
    <p><strong>Course:</strong> ${courseCode}</p>
    <h1>${readingTitle}</h1>
    <p><strong>Delivered Format:</strong> Accessible Screen-Reader HTML (Simulated Demo)</p>
    <p><strong>Delivered By:</strong> ${delivery.deliveredBy}</p>
    <p><strong>Integrity Checksum:</strong> ${delivery.checksum}</p>
    <p><em>Demonstration HTML file containing semantic heading structures, alt text, and ARIA tags.</em></p>
  </header>
  <main>
    <section>
      <h2>Section 1.1: System Architecture Overview</h2>
      <p>In high-availability distributed systems, consistency guarantees require strict synchronization invariants. The fundamental trade-off formalised by Brewer's CAP theorem mandates that under network partitions, a distributed datastore must prioritize either immediate linearizability or partition tolerance.</p>
    </section>
    <section>
      <h2>Section 1.2: Asynchronous Event Bus Propagation</h2>
      <p>When service instances interact through message brokers, state transitions are logged monotonically. Event handlers maintain idempotency tokens, ensuring replay safety even during message redelivery.</p>
    </section>
    <section>
      <h2>Section 1.3: Verification of Accessibility Compliance</h2>
      <p>This document has passed structural checks ensuring compatibility with screen-magnification software, braille displays, and auditory reading aids.</p>
    </section>
  </main>
</body>
</html>`
      : `===============================================================
GROUP 17 SOA PROJECT (SOA-S09-T17)
ACCESSIBLE LEARNING FORMAT DEMONSTRATION PACKAGE (SIMULATED TEXT MANIFEST)
===============================================================

Course: ${courseCode}
Reading Title: ${readingTitle}
Target Format: ${delivery.deliveredFormat}
Delivered Package ID: ${delivery.id}
Delivered Package Artifact Name: ${delivery.fileName}
Delivered By: ${delivery.deliveredBy}
Delivery Timestamp: ${delivery.deliveryTimestamp}
Integrity Checksum: ${delivery.checksum}

NOTE ON FORMAT REPRESENTATION:
This is an accurately labelled plain text demonstration package simulating
the ${delivery.deliveredFormat} release artifact for academic evaluation.
It contains the accessible semantic text layer, MathML transcript, and
verification metadata without misrepresenting plain text as a binary container.

Simulated Verification Audit:
- WCAG Standard: ${delivery.verificationReport.wcagLevel}
- Headings Tagged: ${delivery.verificationReport.structuredHeadings}
- Alt-Text Elements: ${delivery.verificationReport.altTextElements}
- Readability Score: ${delivery.verificationReport.readabilityScore}
- Simulated Audit Status: ${delivery.verificationReport.isSimulatedAudit ? 'Verified (Simulation)' : 'Pending'}

---------------------------------------------------------------
[ACCESSIBLE CONTENT TEXT LAYER & TRANSCRIPT]
---------------------------------------------------------------
${DOCUMENT_TEXT}
`;

    const blob = new Blob([fileContent], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    element.href = blobUrl;
    element.download = downloadFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const getThemeClasses = () => {
    switch (contrastTheme) {
      case 'sepia':
        return 'bg-[#FBF0D9] text-[#433422] border-[#EAD5B8]';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-700';
      case 'yellowOnBlack':
        return 'bg-black text-[#FFFF00] border-yellow-500 font-bold';
      case 'light':
      default:
        return 'bg-white text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar with format info and download action */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{delivery.fileName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800">
                {delivery.deliveredFormat}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Size: {delivery.fileSize} • Delivered: {new Date(delivery.deliveryTimestamp).toLocaleDateString()} by {delivery.deliveredBy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPackage}
            aria-label={`Download ${delivery.deliveredFormat === 'SCREEN_READER_HTML' ? 'HTML demo' : 'text demo package'}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {delivery.deliveredFormat === 'SCREEN_READER_HTML'
              ? 'Download Demo HTML (.html)'
              : 'Download Demo Text Package (.txt)'}
          </button>
        </div>
      </div>

      {/* Accessible toolbar: theme, font sizing, navigation */}
      <div className="bg-slate-100/80 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Navigation tabs with proper role="tab" */}
        <div role="tablist" aria-label="Document viewer sections" className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            role="tab"
            aria-selected={activeTab === 'preview'}
            aria-controls="panel-preview"
            id="tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'preview' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reflowable Preview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'audit'}
            aria-controls="panel-audit"
            id="tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simulated Audit Report
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'transcript'}
            aria-controls="panel-transcript"
            id="tab-transcript"
            onClick={() => setActiveTab('transcript')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'transcript' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Screen-Reader Outline
          </button>
        </div>

        {/* Reader customization controls */}
        {activeTab === 'preview' && (
          <div className="flex items-center gap-3">
            {/* Font size stepper */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Type className="w-3 h-3" /> Size:
              </span>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                aria-label="Decrease text font size"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-slate-800" aria-live="polite">{fontSize}px</span>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                aria-label="Increase text font size"
              >
                +
              </button>
            </div>

            {/* Contrast modes */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200" role="group" aria-label="Color contrast theme selector">
              <button
                type="button"
                onClick={() => setContrastTheme('light')}
                aria-pressed={contrastTheme === 'light'}
                aria-label="Light contrast theme"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  contrastTheme === 'light' ? 'bg-slate-200 text-slate-900 ring-1 ring-slate-400' : 'text-slate-600'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setContrastTheme('sepia')}
                aria-pressed={contrastTheme === 'sepia'}
                aria-label="Sepia low strain contrast theme"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FBF0D9] text-[#553C18] border border-[#EAD5B8] cursor-pointer ${
                  contrastTheme === 'sepia' ? 'ring-1 ring-[#553C18]' : ''
                }`}
              >
                Sepia
              </button>
              <button
                type="button"
                onClick={() => setContrastTheme('dark')}
                aria-pressed={contrastTheme === 'dark'}
                aria-label="Dark mode contrast theme"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 text-white cursor-pointer ${
                  contrastTheme === 'dark' ? 'ring-1 ring-white' : ''
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setContrastTheme('yellowOnBlack')}
                aria-pressed={contrastTheme === 'yellowOnBlack'}
                aria-label="Yellow on black high contrast theme"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold bg-black text-yellow-300 cursor-pointer ${
                  contrastTheme === 'yellowOnBlack' ? 'ring-1 ring-yellow-400' : ''
                }`}
              >
                High Contrast
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Web Speech API Audio Narration Bar */}
      <div className="bg-violet-50/70 border-b border-violet-100 px-5 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {speechState === 'playing' ? (
            <button
              onClick={handlePauseAudio}
              aria-label="Pause audio speech"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Speech</span>
            </button>
          ) : (
            <button
              onClick={handlePlayAudio}
              aria-label="Speak document using Web Speech API"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{speechState === 'paused' ? 'Resume Speech' : 'Listen with Screen Reader Voice'}</span>
            </button>
          )}

          {speechState !== 'stopped' && (
            <button
              onClick={handleStopAudio}
              aria-label="Stop audio speech"
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-violet-100 cursor-pointer"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-violet-900 ml-2">
            <Volume2 className="w-3.5 h-3.5 text-violet-600" />
            <span className="font-semibold">
              {hasSpeechSupport ? 'Browser Web Speech API' : 'Simulated Voice Synthesis'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div
            className="flex-1 bg-violet-200 rounded-full h-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={audioProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Audio speech playback progress"
          >
            <div
              className="bg-violet-600 h-full transition-all duration-200"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-violet-800 font-semibold">{Math.floor(audioProgress)}%</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            aria-label="Speech playback speed multiplier"
            className="bg-white border border-violet-200 rounded px-1.5 py-0.5 text-[11px] font-semibold text-violet-900 cursor-pointer"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      </div>

      {/* Content Panels */}
      <div className="p-6 overflow-y-auto max-h-[500px]">
        {activeTab === 'preview' && (
          <div
            id="panel-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
            className={`p-8 rounded-xl border transition-all duration-150 leading-relaxed ${getThemeClasses()}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="border-b border-current/20 pb-4 mb-6">
              <span className="text-xs uppercase font-mono tracking-wider opacity-75">{courseCode} • Required Reading</span>
              <h2 className="text-2xl font-extrabold mt-1">{readingTitle}</h2>
              <p className="text-sm opacity-80 mt-1">
                Converted into Accessible Format ({delivery.deliveredFormat}) • Tagged Headings, Vector Alt-Text & MathML Included
              </p>
            </div>

            <article className="space-y-4">
              <h3 className="text-xl font-bold border-l-4 border-violet-500 pl-3">
                Section 1.1: System Architecture Overview
              </h3>
              <p>
                In high-availability distributed systems, consistency guarantees require strict synchronization invariants. The fundamental trade-off formalised by Brewer's CAP theorem mandates that under network partitions, a distributed datastore must prioritize either immediate linearizability or partition tolerance.
              </p>

              {/* Sample accessible formula tag */}
              <div className="my-4 p-4 rounded-lg bg-current/5 border border-current/20">
                <p className="text-xs font-mono uppercase tracking-wide opacity-80 mb-1">
                  [MathML Semantic Equation Description for Screen Readers]
                </p>
                <p className="font-mono text-sm">
                  Confidence Interval Invariant: P(|X̄ - μ| &lt; ε) ≥ 1 - 2 · exp(-2nε²)
                </p>
                <p className="text-xs italic opacity-75 mt-1">
                  Spoken description: "Probability of sample mean minus true mean less than epsilon is greater than or equal to one minus two times exponential of negative two n epsilon squared."
                </p>
              </div>

              <h3 className="text-xl font-bold border-l-4 border-violet-500 pl-3">
                Section 1.2: Asynchronous Event Bus Propagation
              </h3>
              <p>
                When service instances interact through message brokers, state transitions are logged monotonically. Event handlers maintain idempotency tokens, ensuring replay safety even during message redelivery.
              </p>

              {/* Sample diagram with full descriptive alt text */}
              <div className="my-6 p-4 rounded-xl border border-current/20 bg-current/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Figure 1.1: Raft Consensus State Transitions</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Alt-Text Verified
                  </span>
                </div>
                <div className="h-28 rounded-lg bg-current/10 flex items-center justify-center font-mono text-xs opacity-75 border border-dashed border-current/30">
                  [Simulated High-Contrast Vector State Diagram: Follower → Candidate → Leader]
                </div>
                <p className="text-xs leading-relaxed opacity-85">
                  <strong>Comprehensive Alt Description:</strong> A directed state diagram depicting three states: Follower, Candidate, and Leader. A follower transitions to Candidate upon election timeout. A candidate transitions to Leader upon securing votes from a quorum majority of nodes. A leader reverts to Follower upon observing a higher term number.
                </p>
              </div>

              <h3 className="text-xl font-bold border-l-4 border-violet-500 pl-3">
                Section 1.3: Verification of Accessibility Compliance
              </h3>
              <p>
                This document has passed simulated structural checks, ensuring compatibility with screen-magnification software, braille displays, and auditory reading aids.
              </p>
            </article>
          </div>
        )}

        {activeTab === 'audit' && (
          <div id="panel-audit" role="tabpanel" aria-labelledby="tab-audit" className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Simulated Accessibility Inspection Report: {delivery.verificationReport.wcagLevel}
                </h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Notice: This is an educational demonstration checklist verifying structural headings, contrast ratios, and MathML tagging criteria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Structural Headings</span>
                <div className="text-2xl font-bold text-slate-900">{delivery.verificationReport.structuredHeadings} Tagged Headings</div>
                <p className="text-xs text-slate-600">
                  Strict H1 through H4 hierarchical tagging with 0 skipped heading levels.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Vector Alt-Text Elements</span>
                <div className="text-2xl font-bold text-slate-900">{delivery.verificationReport.altTextElements} Figures & Math Blocks</div>
                <p className="text-xs text-slate-600">
                  All graphs, schematics, and LaTeX equations include long-form screen-reader descriptions.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Readability & Lexile</span>
                <div className="text-xl font-bold text-slate-900">{delivery.verificationReport.readabilityScore}</div>
                <p className="text-xs text-slate-600">
                  Optimized hyphenation and sentence breaks for synthetic TTS engines.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Package Integrity Checksum</span>
                <div className="text-xs font-mono text-slate-700 break-all bg-white p-2 rounded border border-slate-200">
                  {delivery.checksum}
                </div>
                <p className="text-xs text-slate-500">
                  Simulated SHA-256 package hash ensures untampered delivery from the Conversion Service.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div id="panel-transcript" role="tabpanel" aria-labelledby="tab-transcript" className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">[Screen-Reader Navigation Landmark Outline]</span>
              <span className="text-emerald-400">ARIA Landmarks Validated</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <p className="text-violet-400 font-bold">▶ [Landmark: Document Root] - Title: "{readingTitle}"</p>
              <p className="pl-4 text-emerald-300">├── [Heading 1] Foundations and Architectural Principles</p>
              <p className="pl-8 text-slate-400">├── [Paragraph] 242 words • Reading time: 1 min</p>
              <p className="pl-8 text-amber-300">├── [Math Block] Scaled dot-product confidence bounds (Spoken MathML)</p>
              <p className="pl-4 text-emerald-300">├── [Heading 2] Asynchronous Event Processing Invariants</p>
              <p className="pl-8 text-blue-300">├── [Figure 1.1] Alt-text: "State transition machine from Follower to Leader..."</p>
              <p className="pl-4 text-emerald-300">└── [Heading 2] Proof of Correctness and Liveness</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
