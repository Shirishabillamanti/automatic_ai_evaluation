import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * SubmissionsTable Component
 * Real-time repository of ingested student answer scripts with search, filters,
 * inspection triggers, and navigation to the AI evaluation suite.
 */
export const SubmissionsTable = ({
  submissions = [],
  exams = [],
  loading = false,
  onInspectSubmission,
  onDeleteSubmission,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Filtered list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchSearch =
        !searchTerm.trim() ||
        (sub.studentName && sub.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.rollNumber && sub.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.examTitle && sub.examTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchExam = !selectedExamFilter || sub.examId === selectedExamFilter;
      const matchStatus = !selectedStatusFilter || sub.status === selectedStatusFilter;

      return matchSearch && matchExam && matchStatus;
    });
  }, [submissions, searchTerm, selectedExamFilter, selectedStatusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3 animate-spin" /> Ingestion Processing
          </span>
        );
      case 'pending_review':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Ready for AI Review
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Ingested Answer Booklets Repository ({submissions.length} Total)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse, inspect pages, and launch AI evaluation for ingested student examination papers.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roll, name, exam..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Exam Filter */}
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
          >
            <option value="">All Exams</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.examCode || ex.subject})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Ready for AI Review</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading answer sheets repository...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-700">No Answer Sheets Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedExamFilter || selectedStatusFilter
              ? 'No scripts match your search filters. Try clearing the filter options.'
              : 'No answer sheets uploaded yet. Use the upload dropzone above to ingest student booklets.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Student Identity</th>
                <th className="py-3 px-4">Exam Target</th>
                <th className="py-3 px-4">Pages / File</th>
                <th className="py-3 px-4">Upload Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Student Identity */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {sub.rollNumber ? sub.rollNumber.slice(-2) : 'ST'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sub.rollNumber || 'Unassigned'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{sub.studentName || 'Student Script'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Exam Target */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate max-w-xs">{sub.examTitle}</p>
                      <p className="text-[11px] text-slate-500">{sub.examCode || 'Course Script'}</p>
                    </div>
                  </td>

                  {/* Pages / File */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{sub.pagesCount || (sub.pages?.length) || 1} Pages</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{sub.fileSize || '1.8 MB'}</p>
                  </td>

                  {/* Upload Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                    {sub.uploadedAt ? new Date(sub.uploadedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Just now'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(sub.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspectSubmission(sub)}
                        title="Inspect multi-page script"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/teacher/evaluation')}
                        title="Proceed to AI Evaluation"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Evaluate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSubmission(sub.id)}
                        title="Delete submission"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionsTable;
