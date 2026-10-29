import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Layers,
  Network,
  Database,
  Radio,
  Server,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  Code,
  Sparkles,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const { events } = useSimulation();
  const [selectedService, setSelectedService] = useState<string>('CONVERSION');

  const deliveryEvents = events.filter((e) => e.eventType === 'FORMAT_DELIVERED');

  const services = [
    {
      id: 'EUREKA',
      name: 'Eureka Discovery Server',
      tech: 'Spring Cloud Netflix Eureka',
      role: 'Service registry and health heartbeats',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      description:
        'Maintains a registry of all active microservice instances with client-side load balancing via Spring Cloud LoadBalancer.',
    },
    {
      id: 'GATEWAY',
      name: 'Spring Cloud API Gateway',
      tech: 'Spring Cloud Gateway / Netty',
      role: 'Reverse proxy, JWT token inspection, routing',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      description:
        'Unified edge entry point routing client traffic to downstream microservices, validating authentication claims and applying rate limits.',
    },
    {
      id: 'AUTH',
      name: 'Authentication Service',
      tech: 'Spring Boot + Spring Security JWT',
      role: 'User identity, RBAC, access tokens',
      color: 'bg-slate-50 text-slate-800 border-slate-300',
      description:
        'Manages student and accessibility specialist accounts, issues signed RSA JWT access tokens, and validates user roles (LEARNER vs EDITOR).',
    },
    {
      id: 'READING',
      name: 'Reading List Service',
      tech: 'Spring Boot + Spring Data JPA',
      role: 'Curriculum catalog, reading status',
      color: 'bg-violet-50 text-violet-800 border-violet-300',
      description:
        'Stores course readings, tracks overall semester completion status, and listens to Kafka events for delivery and acceptance updates.',
    },
    {
      id: 'FORMAT',
      name: 'Format Need Service',
      tech: 'Spring Boot REST + PostgreSQL',
      role: 'Student accessibility requests',
      color: 'bg-sky-50 text-sky-800 border-sky-300',
      description:
        'Captures learner format requirements, validates pedagogical and WCAG criteria, and publishes FormatRequestSubmitted events.',
    },
    {
      id: 'CONVERSION',
      name: 'Conversion Service',
      tech: 'Spring Boot + Apache Kafka Producer',
      role: 'Conversion pipeline & state machine',
      color: 'bg-purple-50 text-purple-800 border-purple-300',
      description:
        'Enforces the conversion state machine (REQUESTED → ASSIGNED → IN_CONVERSION → QUALITY_CHECK → DELIVERED). When a delivery is completed, publishes AccessibleFormatDelivered to Kafka topic soa.s09.t17.events.',
    },
    {
      id: 'ACCEPTANCE',
      name: 'Acceptance Service',
      tech: 'Spring Boot + PostgreSQL',
      role: 'Explicit learner verification & ratings',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      description:
        'Separates format delivery from completion. Collects 1-5 star reviews or revision requests. Emits AccessibleFormatAccepted events.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Educational Banner - Clearly Simulated Notice */}
      <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Conceptual SOA Architecture — Simulated
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Target Service-Oriented Architecture Design
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            This diagram illustrates how the Accessible Learning Format Request system would be deployed across containerized Spring Boot microservices, Eureka service discovery, Apache Kafka event streams, and relational PostgreSQL databases in a production SOA infrastructure.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-amber-300 font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Academic Evaluation Note: This presentation application is a pure frontend simulation. No backend microservices or Kafka brokers are active.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SOA Diagram Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Interactive System Topology & Event Flow
            </h2>
            <p className="text-xs text-slate-500">
              Click any microservice node below to inspect its REST API boundaries and asynchronous Kafka responsibilities.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold self-start sm:self-auto">
            Group 17 • SOA-S09-T17
          </span>
        </div>

        {/* Conceptual Diagram SVG / Interactive Nodes */}
        <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 relative overflow-hidden">
          {/* Top Level: Discovery & Gateway */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setSelectedService('EUREKA')}
                className={`px-5 py-3 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                  selectedService === 'EUREKA'
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Server className="w-4 h-4 text-emerald-400" />
                Eureka Service Discovery (8761)
              </button>

              <div className="hidden sm:block text-slate-500 text-xs font-mono">── REST & Health ──</div>

              <button
                onClick={() => setSelectedService('GATEWAY')}
                className={`px-5 py-3 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                  selectedService === 'GATEWAY'
                    ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/40 shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Network className="w-4 h-4 text-indigo-400" />
                Spring Cloud API Gateway (8080)
              </button>
            </div>

            {/* Middle Level: Domain Microservices Grid */}
            <div className="text-center text-[10px] uppercase font-mono tracking-widest text-slate-500">
              ▼ RESTful Synchronous Dispatch & Domain Boundaries ▼
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { id: 'AUTH', title: 'Auth Service', port: '8081', role: 'JWT & RBAC' },
                { id: 'READING', title: 'Reading List', port: '8082', role: 'Catalog & Rule' },
                { id: 'FORMAT', title: 'Format Need', port: '8083', role: 'Needs Form' },
                { id: 'CONVERSION', title: 'Conversion', port: '8084', role: 'State Machine' },
                { id: 'ACCEPTANCE', title: 'Acceptance', port: '8085', role: 'Learner Reviews' },
              ].map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedService(srv.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedService === srv.id
                      ? 'bg-violet-600 text-white border-violet-400 ring-2 ring-violet-400/40 shadow-lg'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{srv.title}</span>
                    <span className="text-[10px] font-mono opacity-70">:{srv.port}</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-1">{srv.role}</p>
                </button>
              ))}
            </div>

            {/* Bottom Level: Apache Kafka Event Bus */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="text-center text-[10px] uppercase font-mono tracking-widest text-violet-400">
                ▲ Asynchronous Event Streaming Bus (Event Sourcing & Sagas) ▲
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/30">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200">Apache Kafka Cluster:</span>
                    <p className="font-mono text-xs text-violet-400 font-bold">
                      Topic: soa.s09.t17.events
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Primary Delivery Event:</span>
                  <span className="text-emerald-400 font-bold">AccessibleFormatDelivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Service Detail Panel */}
        {(() => {
          const srv = services.find((s) => s.id === selectedService);
          if (!srv) return null;
          return (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${srv.color}`}>
                    {srv.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Tech: {srv.tech}</span>
                </div>
                <span className="text-xs font-bold text-violet-700">{srv.role}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{srv.description}</p>
            </div>
          );
        })()}
      </div>

      {/* Simulated Kafka Delivery Event Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Delivery Events on <code className="font-mono text-violet-700 text-sm">soa.s09.t17.events</code>
            </h3>
            <p className="text-xs text-slate-500">
              How the real architecture consumes <code className="font-mono text-slate-700">AccessibleFormatDelivered</code>
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700">
            {deliveryEvents.length} Delivered Events
          </span>
        </div>

        <div className="space-y-3">
          {deliveryEvents.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-900">{evt.title}</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600">{evt.description}</p>

              <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                <p className="text-slate-400 mb-1">// Kafka Event Payload published by Conversion Service:</p>
                {JSON.stringify(evt.kafkaMessage.payload, null, 2)}
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                <strong>Consumer Handling:</strong> The Reading List Service updates reading delivery status to{' '}
                <code className="text-violet-700 font-bold">DELIVERED</code>, while the Acceptance Service prepares an awaiting-acceptance ticket.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
