import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';

/**
 * EvaluationQueueSidebar Component
 * Sidebar showing the batch queue of answer sheets with instant selection,
 * status filtering, and search.
 */
export const EvaluationQueueSidebar = ({
  submissions = [],
  selectedSubmissionId = '',
  onSelectSubmission,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (sub.rollNumber && sub.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.studentName && sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (sub.status === 'pending_review' || sub.status === 'processing')) ||
      (statusFilter === 'approved' && (sub.status === 'approved' || sub.status === 'completed'));

    return matchesSearch && matchesStatus;
  });

  const pendingCount = submissions.filter(
    (s) => s.status === 'pending_review' || s.status === 'processing'
  ).length;
  const approvedCount = submissions.filter(
    (s) => s.status === 'approved' || s.status === 'completed'
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 h-[780px] flex flex-col shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800">
            Script Queue ({submissions.length})
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {pendingCount} Pending
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search roll or student..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs' : 'hover:text-amber-700'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          className={`flex-1 py-1 rounded-lg transition-colors ${
            statusFilter === 'approved' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-emerald-700'
          }`}
        >
          Done ({approvedCount})
        </button>
      </div>

      {/* Scrollable Script Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[11px] text-slate-400">Loading queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600">No Scripts In Queue</p>
            <p className="text-[11px] text-slate-400 mt-1">Upload booklets in Answer Sheets tab to populate the queue.</p>
          </div>
        ) : (
          filtered.map((sub) => {
            const isSelected = sub.id === selectedSubmissionId;
            const isApproved = sub.status === 'approved' || sub.status === 'completed';

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {sub.rollNumber || 'Script'}
                  </span>
                  {isApproved ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 truncate">{sub.studentName || 'Student'}</p>

                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>{sub.pagesCount || (sub.pages?.length) || 1} Pages</span>
                  {sub.obtainedMarks !== undefined && (
                    <span className="font-bold text-slate-700">
                      Score: {sub.obtainedMarks}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EvaluationQueueSidebar;
