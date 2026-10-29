import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Code,
  Layers,
  Users,
  Compass,
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
            College SOA Project Evaluation
          </span>
          <span className="text-xs text-slate-400 font-mono">Semester Fall 2026</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Accessible Learning Format Request
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Project ID:</span>
            <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              SOA-S09-T17
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Team:</span>
            <span className="font-bold text-slate-800">Group 17</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Course:</span>
            <span className="text-slate-700">Service-Oriented Architecture & Distributed Systems</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
          This web application provides a complete, interactive, frontend-only business workflow simulation for accessible learning format transformations. It models how higher-education accessibility centers intake syllabus readings, convert complex equations and figures into WCAG 2.1 AA compliant formats (EPUB, Accessible PDF, Audio, Screen-Reader HTML, Braille), enforce state machine transitions, and require explicit learner review before marking degree requirements as complete.
        </p>
      </div>

      {/* 10-Step Evaluation Scenario Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-600" />
            10-Step Guided Evaluation Walkthrough
          </h2>
          <p className="text-xs text-slate-500">
            Follow this scenario during project demonstrations or click "Auto-Run Step" in the top Guided Demo drawer:
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              step: 1,
              role: 'Learner',
              title: 'Log in as Learner Maya Lin',
              desc: 'Enter the student accessibility portal and observe course readings.',
            },
            {
              step: 2,
              role: 'Learner',
              title: 'Select Required Reading (RDG-105)',
              desc: 'Observe that Graph Theory & Network Optimization is in status "Not Requested".',
            },
            {
              step: 3,
              role: 'Learner',
              title: 'Submit Format Request',
              desc: 'Select Large Print or EPUB, specify high contrast and MathML criteria, and submit.',
            },
            {
              step: 4,
              role: 'Editor',
              title: 'Switch to Accessibility Editor David Chen',
              desc: 'Use the quick role toggle in the navbar to enter the editor workspace.',
            },
            {
              step: 5,
              role: 'Editor',
              title: 'Assign Conversion Task in Queue',
              desc: 'Claim the newly created task from the Conversion Queue.',
            },
            {
              step: 6,
              role: 'Editor',
              title: 'Start Conversion & Progress State Machine',
              desc: 'Transition: ASSIGNED → IN_CONVERSION → QUALITY_CHECK.',
            },
            {
              step: 7,
              role: 'Editor',
              title: 'Pass QA & Record Format Delivery',
              desc: 'Certify WCAG 2.1 AA and record delivery. Emits AccessibleFormatDelivered Kafka event.',
            },
            {
              step: 8,
              role: 'Learner',
              title: 'Switch back to Learner Maya Lin',
              desc: 'Observe the delivery notification and the critical requirement for explicit acceptance.',
            },
            {
              step: 9,
              role: 'Learner',
              title: 'Review Delivered Document & Accept',
              desc: 'Test font scaling and screen-reader preview, then accept with a 5-star rating.',
            },
            {
              step: 10,
              role: 'Learner',
              title: 'Verify Critical Completion Rule',
              desc: 'Verify that when all 5 readings are accepted, the overall workflow status transitions to COMPLETE!',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs"
            >
              <span className="w-6 h-6 rounded-lg bg-violet-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                {item.step}
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-violet-100 text-violet-800">
                    {item.role}
                  </span>
                </div>
                <p className="text-slate-600 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Disclaimer */}
      <div className="bg-amber-50/80 rounded-3xl p-6 border border-amber-200/90 space-y-2 text-xs text-amber-950">
        <h3 className="font-bold flex items-center gap-2 text-sm text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          Simulation Integrity & Scope Boundaries
        </h3>
        <p className="leading-relaxed text-amber-900/90">
          As instructed for this SOA college project evaluation, this application operates 100% in the browser. It stores state in <code className="font-mono bg-white px-1 py-0.5 rounded">localStorage</code> and executes deterministic state transitions in React. No Spring Boot microservices, Docker containers, PostgreSQL databases, or physical Kafka brokers are instantiated.
        </p>
      </div>
    </div>
  );
};
