import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import { TaskStatus, UrgencyLevel, ConversionTask } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  ListOrdered,
  Eye,
  UserCheck,
  Play,
  CheckCircle2,
  Send,
  RotateCcw,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { TaskStatusBadge, FormatBadge, UrgencyBadge } from '../../components/common/StatusBadge';

export const ConversionQueuePage: React.FC = () => {
  const {
    tasks,
    assignTask,
    startConversion,
    submitForQualityCheck,
    passQualityCheck,
    recordDelivery,
    currentUser,
  } = useSimulation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'status' | 'priority' | 'lastUpdated'>('lastUpdated');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.readingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.assignedEditorName && task.assignedEditorName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
        const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.readingTitle.localeCompare(b.readingTitle);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'priority') {
          const pOrder: Record<UrgencyLevel, number> = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
          return pOrder[b.priority] - pOrder[a.priority];
        }
        if (sortBy === 'lastUpdated') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        return a.id.localeCompare(b.id);
      });
  }, [tasks, searchTerm, selectedStatus, selectedPriority, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Conversion Queue Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
              {tasks.length} Total Pipeline Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            State Machine Enforced: REQUESTED → ASSIGNED → IN_CONVERSION → QUALITY_CHECK → DELIVERED
          </p>
        </div>
      </div>

      {/* Search, Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Task ID, reading title, learner, editor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-slate-50/50"
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

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="REQUESTED">Requested (Unassigned)</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_CONVERSION">In Conversion</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="DELIVERED">Delivered</option>
                <option value="REVISION_REQUESTED">Revision Requested</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'id' | 'title' | 'status' | 'priority' | 'lastUpdated')}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="lastUpdated">Recently Updated</option>
                <option value="priority">Priority (Highest first)</option>
                <option value="title">Reading Title</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Task / Request</th>
                <th className="py-3.5 px-4">Reading Material</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Learner</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status & Progress</th>
                <th className="py-3.5 px-4">Assigned Editor</th>
                <th className="py-3.5 px-4 text-right">Available Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No conversion tasks match your current filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* ID */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      <div>{task.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Ref: {task.requestId}</div>
                    </td>

                    {/* Reading */}
                    <td className="py-4 px-4 max-w-xs">
                      <Link
                        to={`/editor/task/${task.id}`}
                        className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1"
                      >
                        {task.readingTitle}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">Ref: {task.readingId}</div>
                    </td>

                    {/* Format */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <FormatBadge format={task.requestedFormat} />
                    </td>

                    {/* Learner */}
                    <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {task.learnerName}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <UrgencyBadge urgency={task.priority} />
                    </td>

                    {/* Status & Progress Bar */}
                    <td className="py-4 px-4 whitespace-nowrap space-y-1 min-w-[150px]">
                      <TaskStatusBadge status={task.status} />
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-violet-600 h-full transition-all duration-300"
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Assigned Editor */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      {task.assignedEditorName ? (
                        <span className="font-semibold text-slate-800">{task.assignedEditorName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'REQUESTED' && (
                          <button
                            onClick={() => assignTask(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            title="Assign to active editor"
                          >
                            Assign Task
                          </button>
                        )}

                        {task.status === 'ASSIGNED' && (
                          <button
                            onClick={() => startConversion(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            title="Start conversion pipeline"
                          >
                            Start Work
                          </button>
                        )}

                        {task.status === 'IN_CONVERSION' && (
                          <button
                            onClick={() => submitForQualityCheck(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            title="Submit for Quality Check"
                          >
                            Submit QC
                          </button>
                        )}

                        {task.status === 'QUALITY_CHECK' && (
                          task.qualityCheckStatus === 'PASSED' ? (
                            <button
                              onClick={() => recordDelivery(task.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                              title="Deliver format to learner"
                            >
                              Deliver Format
                            </button>
                          ) : (
                            <Link
                              to={`/editor/task/${task.id}`}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                              title="Review & complete Quality Check"
                            >
                              Review QA
                            </Link>
                          )
                        )}

                        {task.status === 'REVISION_REQUESTED' && (
                          <button
                            onClick={() => startConversion(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            title="Restart conversion for requested fixes"
                          >
                            Fix Revision
                          </button>
                        )}

                        <Link
                          to={`/editor/task/${task.id}`}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Open Task Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
