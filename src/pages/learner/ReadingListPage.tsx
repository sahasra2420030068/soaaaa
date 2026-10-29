import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { Reading, ReadingWorkflowStatus } from '../../types';
import {
  Search,
  Filter,
  BookOpen,
  ArrowUpDown,
  PlusCircle,
  FileCheck,
  Eye,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import {
  ReadingStatusBadge,
  FormatBadge,
  AcceptanceStatusBadge,
} from '../../components/common/StatusBadge';

export const ReadingListPage: React.FC = () => {
  const { readings, requests, deliveries } = useSimulation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'course' | 'status'>('id');
  const [activeReadingModal, setActiveReadingModal] = useState<Reading | null>(null);

  // Available courses
  const courses = useMemo(() => {
    const list = Array.from(new Set(readings.map((r) => r.courseCode)));
    return ['ALL', ...list];
  }, [readings]);

  // Filtered and sorted readings
  const filteredReadings = useMemo(() => {
    return readings
      .filter((r) => {
        const matchesSearch =
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = selectedCourse === 'ALL' || r.courseCode === selectedCourse;
        const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'course') return a.courseCode.localeCompare(b.courseCode);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return a.id.localeCompare(b.id);
      });
  }, [readings, searchTerm, selectedCourse, selectedStatus, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Required Reading List
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
              {readings.length} Total Readings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Course curriculum texts configured for multi-modal accessible format transformation.
          </p>
        </div>

        <Link
          to="/learner/request"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Accessibility Request</span>
        </Link>
      </div>

      {/* Search, Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reading title, author, course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Course:</span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Courses' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="NOT_REQUESTED">Not Requested</option>
                <option value="REQUEST_SUBMITTED">Request Submitted</option>
                <option value="IN_CONVERSION">In Conversion</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="DELIVERED">Delivered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REVISION_REQUESTED">Revision Requested</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'id' | 'title' | 'course' | 'status')}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="id">Default (ID)</option>
                <option value="title">Title (A-Z)</option>
                <option value="course">Course Code</option>
                <option value="status">Workflow Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Cards List */}
      <div className="space-y-4">
        {filteredReadings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No matching readings found</h3>
            <p className="text-xs text-slate-500">
              Try modifying your search query or reset the course/status filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourse('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReadings.map((reading) => {
            const hasDelivery = reading.deliveryStatus === 'DELIVERED';
            const isAccepted = reading.acceptanceStatus === 'ACCEPTED';
            const isAwaitingAcceptance = reading.acceptanceStatus === 'AWAITING_ACCEPTANCE';

            return (
              <div
                key={reading.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-violet-200 transition-all space-y-4 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-100">
                        {reading.id}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {reading.courseCode} • {reading.courseName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {reading.year} • {reading.pages} pages
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                      {reading.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium">
                      Author(s): <span className="text-slate-700">{reading.author}</span>
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {reading.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="font-medium">Original Material:</span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {reading.originalFormat}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-500">Target Accessible Format:</span>
                        <FormatBadge format={reading.requiredFormat} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status Badges and Actions */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="space-y-1.5 sm:text-right">
                      <div>
                        <ReadingStatusBadge status={reading.status} />
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Acceptance: <AcceptanceStatusBadge status={reading.acceptanceStatus} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveReadingModal(reading)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Details</span>
                      </button>

                      {reading.status === 'NOT_REQUESTED' && (
                        <Link
                          to={`/learner/request/${reading.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Format</span>
                        </Link>
                      )}

                      {isAwaitingAcceptance && (
                        <Link
                          to={`/learner/review/${reading.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Review Delivery</span>
                        </Link>
                      )}

                      {isAccepted && (
                        <Link
                          to={`/learner/review/${reading.id}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View Accepted Package</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {activeReadingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setActiveReadingModal(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                {activeReadingModal.id} • {activeReadingModal.courseCode}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">{activeReadingModal.title}</h2>
              <p className="text-xs text-slate-500">
                Author: {activeReadingModal.author} ({activeReadingModal.year})
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {activeReadingModal.shortDescription}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium">Source Document Format:</span>
                <p className="font-bold text-slate-800 mt-0.5">{activeReadingModal.originalFormat}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium">Requested Accessible Format:</span>
                <div className="mt-1">
                  <FormatBadge format={activeReadingModal.requiredFormat} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium">Workflow Status:</span>
                <div className="mt-1">
                  <ReadingStatusBadge status={activeReadingModal.status} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium">Learner Acceptance Status:</span>
                <div className="mt-1">
                  <AcceptanceStatusBadge status={activeReadingModal.acceptanceStatus} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveReadingModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              {activeReadingModal.status === 'NOT_REQUESTED' && (
                <Link
                  to={`/learner/request/${activeReadingModal.id}`}
                  onClick={() => setActiveReadingModal(null)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs"
                >
                  Submit Format Request
                </Link>
              )}

              {activeReadingModal.deliveryStatus === 'DELIVERED' && (
                <Link
                  to={`/learner/review/${activeReadingModal.id}`}
                  onClick={() => setActiveReadingModal(null)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  Review Delivery Package
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
