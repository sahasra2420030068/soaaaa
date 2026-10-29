import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EventType, ActivityEvent } from '../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  UserCheck,
  FileCheck,
  Code,
  Filter,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ActivityTimelinePage: React.FC = () => {
  const { events, resetToDefaultData } = useSimulation();
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

  const togglePayload = (id: string) => {
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = events.filter((evt) => {
    if (selectedEventType === 'ALL') return true;
    return evt.eventType === selectedEventType;
  });

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'FORMAT_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'FORMAT_DELIVERED':
        return <FileCheck className="w-4 h-4 text-indigo-600" />;
      case 'QUALITY_CHECK_PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'QUALITY_CHECK_SUBMITTED':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'CONVERSION_STARTED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'TASK_ASSIGNED':
        return <UserCheck className="w-4 h-4 text-sky-500" />;
      case 'REQUEST_SUBMITTED':
        return <Send className="w-4 h-4 text-violet-500" />;
      case 'REVISION_REQUESTED':
        return <RotateCcw className="w-4 h-4 text-rose-500" />;
      case 'SYSTEM_RESET':
      default:
        return <RotateCcw className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Activity Timeline & Kafka Event Stream
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
              {events.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated message broker log capturing event-driven architecture signals on topic <code className="font-mono text-violet-700">soa.s09.t17.events</code>.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter:</span>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            <option value="REQUEST_SUBMITTED">Request Submitted</option>
            <option value="TASK_ASSIGNED">Task Assigned</option>
            <option value="CONVERSION_STARTED">Conversion Started</option>
            <option value="QUALITY_CHECK_PASSED">Quality Check Passed</option>
            <option value="FORMAT_DELIVERED">Format Delivered</option>
            <option value="FORMAT_ACCEPTED">Format Accepted</option>
            <option value="REVISION_REQUESTED">Revision Requested</option>
          </select>
        </div>
      </div>

      {/* Kafka Broker Topic Architecture Pill */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 font-mono">
            KAFKA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Simulated Broker Topic:</span>
              <span className="font-mono text-violet-400 font-bold">soa.s09.t17.events</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Partitions: 3 • Replication Factor: 2 • Retention: Monotonic Event Sourcing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>In-Browser State Stream</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="space-y-6">
          {filteredEvents.map((evt, idx) => {
            const isPayloadOpen = !!expandedPayloads[evt.id];
            return (
              <div key={evt.id} className="relative flex items-start gap-4 group">
                {/* Vertical timeline line */}
                {idx < filteredEvents.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200 -z-0" />
                )}

                {/* Event Icon Bubble */}
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10 group-hover:scale-105 transition-transform">
                  {getEventIcon(evt.eventType)}
                </div>

                {/* Event Content */}
                <div className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{evt.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-semibold">
                        {evt.eventType}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500">
                      <span>Actor: <strong className="text-slate-700">{evt.actor}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-700">{evt.readingTitle}</strong></span>
                    </div>

                    <button
                      onClick={() => togglePayload(evt.id)}
                      className="flex items-center gap-1 font-mono text-[11px] text-violet-700 hover:text-violet-900 font-semibold cursor-pointer"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{isPayloadOpen ? 'Hide Kafka Payload' : 'Inspect Kafka Payload'}</span>
                      {isPayloadOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expandable Simulated Kafka Message Inspector */}
                  {isPayloadOpen && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                        <span>Producer: {evt.kafkaMessage.producerService}</span>
                        <span>Consumers: {evt.kafkaMessage.consumerServices.join(', ')}</span>
                      </div>
                      <pre className="overflow-x-auto text-emerald-400 scrollbar-thin">
                        {JSON.stringify(evt.kafkaMessage, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
