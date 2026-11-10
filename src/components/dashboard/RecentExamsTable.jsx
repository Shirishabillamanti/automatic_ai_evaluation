import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import {
  updateExamRecord,
  deleteDraftExam,
  changeExamStatus,
} from '../../services/dashboardService';

export const RecentExamsTable = ({ exams = [], loading, onRefresh }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const teacherUid = currentUser?.uid || userProfile?.uid;
  const teacherName = userProfile?.fullName || currentUser?.displayName || 'Teacher';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt'); // 'createdAt' | 'examDate' | 'title' | 'maxMarks'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [viewingExam, setViewingExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Status options supported
  const statusOptions = ['All', 'Draft', 'Ready for Upload', 'Archived'];

  // Dynamic unique subjects from exams
  const availableSubjects = useMemo(() => {
    const set = new Set();
    exams.forEach((e) => {
      if (e.subject) set.add(e.subject);
    });
    return ['All', ...Array.from(set)];
  }, [exams]);

  // Filter & Sort
  const processedExams = useMemo(() => {
    let result = [...exams];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.subject?.toLowerCase().includes(q) ||
          e.examCode?.toLowerCase().includes(q)
      );
    }

    // Subject filter
    if (subjectFilter !== 'All') {
      result = result.filter((e) => e.subject === subjectFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((e) => e.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'maxMarks' || sortField === 'totalQuestions') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (sortField === 'createdAt' || sortField === 'examDate') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [exams, searchQuery, subjectFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedExams.length / pageSize) || 1;
  const paginatedExams = processedExams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready for Upload':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Ready for Upload
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Archive className="w-3 h-3 text-slate-400" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Draft
          </span>
        );
    }
  };

  const formatCreatedDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      return String(dateVal).split('T')[0];
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setEditFormData({
      title: exam.title || '',
      subject: exam.subject || '',
      examCode: exam.examCode || '',
      examDate: exam.examDate || '',
      totalQuestions: exam.totalQuestions || 10,
      maxMarks: exam.maxMarks || 100,
      status: exam.status || 'Draft',
      description: exam.description || '',
    });
    setActionFeedback(null);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingExam) return;

    if (!editFormData.title.trim()) {
      setActionFeedback({ type: 'error', message: 'Exam title is required.' });
      return;
    }
    if (!editFormData.subject.trim()) {
      setActionFeedback({ type: 'error', message: 'Subject is required.' });
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);
    try {
      await updateExamRecord({
        examId: editingExam.id,
        teacherId: teacherUid,
        teacherName,
        updates: editFormData,
      });

      setActionFeedback({
        type: 'success',
        message: 'Examination updated successfully!',
      });
      setTimeout(() => {
        setEditingExam(null);
        if (onRefresh) onRefresh();
      }, 800);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to update exam.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm and Execute Delete Draft
  const handleConfirmDelete = async () => {
    if (!deletingExam) return;

    setActionLoading(true);
    setActionFeedback(null);
    try {
      await deleteDraftExam(deletingExam.id, teacherUid, teacherName);
      setDeletingExam(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Failed to delete draft exam.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Change Status
  const handleStatusChange = async (exam, newStatus) => {
    setActionLoading(true);
    try {
      await changeExamStatus(exam.id, teacherUid, newStatus, teacherName);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update exam status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden mb-8">
      {/* Table Header and Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Examinations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real examination records stored in your institutional workspace.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/exams/create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Exam</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh exams list"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by exam title, subject, or code..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Filters Group: Subject, Status, Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by subject"
              className="bg-white text-xs font-semibold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="bg-white text-xs font-semibold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 select-none">
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-5 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Exam Title</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Subject</th>
              <th
                onClick={() => toggleSort('examDate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Exam Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Questions</th>
              <th className="py-3 px-4 text-center">Max Marks</th>
              <th className="py-3 px-4">Status</th>
              <th
                onClick={() => toggleSort('createdAt')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Created Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-xs">Loading examinations from Firestore...</p>
                </td>
              </tr>
            ) : paginatedExams.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No examinations found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {searchQuery || subjectFilter !== 'All' || statusFilter !== 'All'
                        ? 'No exams match your current search or filter criteria.'
                        : 'You haven’t created any examinations yet. Get started by setting up your first exam rubric.'}
                    </p>
                    <button
                      onClick={() => navigate('/teacher/exams/create')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create New Exam</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedExams.map((exam) => {
                const isDraft = exam.status === 'Draft';
                const isArchived = exam.status === 'Archived';
                const isReady = exam.status === 'Ready for Upload';

                return (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      <div className="truncate max-w-xs">{exam.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{exam.examCode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {exam.examDate}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      {exam.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {exam.maxMarks}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(exam.status)}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatCreatedDate(exam.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => setViewingExam(exam)}
                          title="View Exam Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Exam (Only non-archived or active) */}
                        {!isArchived && (
                          <button
                            onClick={() => handleOpenEdit(exam)}
                            title="Edit Exam"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status Quick Action: Publish if Draft */}
                        {isDraft && (
                          <button
                            onClick={() => handleStatusChange(exam, 'Ready for Upload')}
                            title="Publish as Ready for Upload"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status Quick Action: Archive if Ready */}
                        {isReady && (
                          <button
                            onClick={() => handleStatusChange(exam, 'Archived')}
                            title="Archive Exam"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Restore if Archived */}
                        {isArchived && (
                          <button
                            onClick={() => handleStatusChange(exam, 'Draft')}
                            title="Restore Exam to Draft"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Draft Exam only */}
                        {isDraft && (
                          <button
                            onClick={() => setDeletingExam(exam)}
                            title="Delete Draft Exam"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && processedExams.length > pageSize && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedExams.length)} of {processedExams.length} exams
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. VIEW EXAM DETAILS MODAL */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {viewingExam.subject}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {viewingExam.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Code: {viewingExam.examCode}
                </p>
              </div>
              <button
                onClick={() => setViewingExam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Exam Date</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingExam.examDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Questions</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingExam.totalQuestions}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Max Marks</span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">{viewingExam.maxMarks}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Status</span>
                <span className="text-xs font-bold mt-1 block text-indigo-600">{viewingExam.status}</span>
              </div>
            </div>

            {viewingExam.description && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold block mb-1 text-slate-900">Rubric Instructions:</span>
                <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">{viewingExam.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span>Created: {formatCreatedDate(viewingExam.createdAt)}</span>
              <button
                onClick={() => setViewingExam(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT EXAM MODAL */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Examination</h3>
              </div>
              <button
                onClick={() => setEditingExam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editFormData.subject || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Exam Code
                  </label>
                  <input
                    type="text"
                    value={editFormData.examCode || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, examCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.examDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editFormData.totalQuestions || 10}
                    onChange={(e) => setEditFormData({ ...editFormData, totalQuestions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.maxMarks || 100}
                    onChange={(e) => setEditFormData({ ...editFormData, maxMarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status || 'Draft'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                >
                  <option value="Draft">Draft (Editable)</option>
                  <option value="Ready for Upload">Ready for Upload (Active)</option>
                  <option value="Archived">Archived (Read-only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Rubric Guidelines / Instructions
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE DRAFT CONFIRMATION MODAL */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Delete Draft Examination?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete draft exam{' '}
                <strong className="text-slate-900">"{deletingExam.title}"</strong>?
                This action will delete the draft from Firestore and cannot be undone.
              </p>
            </div>

            {actionFeedback && (
              <div className="p-3 rounded-xl text-xs bg-red-50 border border-red-200 text-red-900">
                {actionFeedback.message}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Keep Draft
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentExamsTable;
