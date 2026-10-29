import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { FormatBadge, UrgencyBadge } from '../../components/common/StatusBadge';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, tasks, readings } = useSimulation();

  const request = requests.find((r) => r.id === id || r.readingId === id);
  const reading = readings.find((r) => r.id === request?.readingId);
  const task = tasks.find((t) => t.requestId === request?.id || t.readingId === request?.readingId);

  if (!request) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 max-w-md mx-auto my-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500">The requested ID does not exist in the simulation store.</p>
        <Link
          to="/learner/readings"
          className="inline-block px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-xs"
        >
          Back to Readings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/learner/readings" className="text-xs text-violet-600 hover:underline font-semibold">
            ← Back to Readings
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Request {request.id}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
              {request.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted {new Date(request.createdAt).toLocaleString()} by {request.learnerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reading?.deliveryStatus === 'DELIVERED' && (
            <Link
              to={`/learner/review/${reading.id}`}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>Review Delivery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Target Reading Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400">Target Academic Material</span>
          <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
            {request.courseCode}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{request.readingTitle}</h2>
        {reading && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            {reading.shortDescription}
          </p>
        )}
      </div>

      {/* Request Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Format & Priority</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Requested Format:</span>
              <FormatBadge format={request.format} />
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Urgency Level:</span>
              <UrgencyBadge urgency={request.urgency} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Submitted By:</span>
              <span className="font-semibold text-slate-800">{request.learnerName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Additional Specifications</h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {request.additionalRequirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {request.notes && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-500">Pedagogical Notes:</span>
              <p className="text-slate-700 italic mt-0.5">"{request.notes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Linked Task Timeline if available */}
      {task && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Conversion Pipeline Progress</h3>
              <span className="font-mono text-xs text-slate-400">({task.id})</span>
            </div>
            <span className="text-xs font-bold text-violet-700">{task.status}</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-violet-600 h-full transition-all duration-300"
              style={{ width: `${task.progressPercent}%` }}
            />
          </div>

          <div className="space-y-3 pt-2">
            {task.history.map((h, i) => (
              <div key={h.id} className="text-xs flex items-start gap-3 border-l-2 border-violet-200 pl-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{h.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{h.notes || `State transitioned from ${h.fromStatus} to ${h.toStatus}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
