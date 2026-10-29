import React from 'react';
import {
  ReadingWorkflowStatus,
  TaskStatus,
  AccessibleFormatType,
  UrgencyLevel,
  AcceptanceStatus,
} from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  FileCheck,
  Send,
  UserCheck,
  BookOpen,
  FileText,
  Volume2,
  FileCode2,
  FileSpreadsheet,
  Binary,
} from 'lucide-react';

export const ReadingStatusBadge: React.FC<{ status: ReadingWorkflowStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Accepted by Learner
        </span>
      );
    case 'DELIVERED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${className}`}
        >
          <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
          Delivered • Awaiting Review
        </span>
      );
    case 'QUALITY_CHECK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          In Quality Check
        </span>
      );
    case 'IN_CONVERSION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          In Conversion
        </span>
      );
    case 'REQUEST_SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 ${className}`}
        >
          <Send className="w-3.5 h-3.5 text-purple-600" />
          Request Submitted
        </span>
      );
    case 'REVISION_REQUESTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          Revision Requested
        </span>
      );
    case 'NOT_REQUESTED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          Not Requested
        </span>
      );
  }
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'REQUESTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-violet-500" />
          Requested (Unassigned)
        </span>
      );
    case 'ASSIGNED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 ${className}`}
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
          Assigned to Editor
        </span>
      );
    case 'IN_CONVERSION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          In Conversion
        </span>
      );
    case 'QUALITY_CHECK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          Quality Check
        </span>
      );
    case 'DELIVERED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          Delivered
        </span>
      );
    case 'REVISION_REQUESTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          Revision Requested
        </span>
      );
    default:
      return null;
  }
};

export const FormatBadge: React.FC<{ format: AccessibleFormatType; className?: string }> = ({
  format,
  className = '',
}) => {
  const getFormatDetails = () => {
    switch (format) {
      case 'ACCESSIBLE_PDF':
        return { label: 'Accessible PDF (Tagged)', icon: FileText, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'EPUB':
        return { label: 'EPUB 3 (Reflowable)', icon: BookOpen, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'SCREEN_READER_HTML':
        return { label: 'Screen-Reader HTML', icon: FileCode2, color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'AUDIO_MP3':
        return { label: 'Audio Narration (MP3)', icon: Volume2, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'LARGE_PRINT':
        return { label: 'Large Print (32pt)', icon: FileSpreadsheet, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'BRAILLE_READY_BRF':
        return { label: 'Braille Ready (BRF)', icon: Binary, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      default:
        return { label: format, icon: FileText, color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  const { label, icon: Icon, color } = getFormatDetails();

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${color} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  switch (urgency) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          Critical Priority
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          High Priority
        </span>
      );
    case 'NORMAL':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Normal
        </span>
      );
  }
};

export const AcceptanceStatusBadge: React.FC<{ status: AcceptanceStatus }> = ({ status }) => {
  switch (status) {
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted
        </span>
      );
    case 'AWAITING_ACCEPTANCE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 text-amber-600" /> Awaiting Learner Acceptance
        </span>
      );
    case 'REVISION_REQUESTED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
          <RotateCcw className="w-3 h-3 text-rose-600" /> Revision Requested
        </span>
      );
    case 'NOT_APPLICABLE':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal text-slate-500">
          Not applicable
        </span>
      );
  }
};
