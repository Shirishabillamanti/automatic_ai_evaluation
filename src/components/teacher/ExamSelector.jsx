import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ExamSelector Component for Answer Sheet Ingestion
 * Allows teachers to pick an exam target for batch script uploads.
 */
export const ExamSelector = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  loading = false,
}) => {
  const selectedExam = exams.find((e) => e.id === selectedExamId);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-10 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/30 p-6 text-center shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">No Active Exams Found</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
          Before uploading student answer sheets, you need to create an examination record so the AI evaluator knows the questions and rubric.
        </p>
        <Link
          to="/teacher/exams/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New Exam</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label htmlFor="exam-select" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Select Target Examination
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Answer scripts uploaded in this batch will be associated with this examination rubric.
          </p>
        </div>
        <Link
          to="/teacher/exams/create"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create New Exam</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <select
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => onSelectExam(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors shadow-2xs"
          >
            <option value="" disabled>-- Select an examination --</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.examCode || exam.subject}) - Max {exam.maxMarks || 100} Marks [{exam.uploadedSheets || 0} sheets uploaded]
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-200/60 text-blue-900 text-xs">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold truncate">{selectedExam.subject} ({selectedExam.examCode})</p>
              <p className="text-[11px] text-blue-700">
                {selectedExam.totalQuestions} Questions · {selectedExam.maxMarks} Max Marks
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedExam && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-medium text-[11px] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Rubric Configured
          </span>
          <span>Date: <strong className="text-slate-800">{selectedExam.examDate || 'N/A'}</strong></span>
          <span>Current Ingested: <strong className="text-slate-800">{selectedExam.uploadedSheets || 0}</strong> booklets</span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500 italic truncate max-w-sm">
            {selectedExam.description || 'General examination guidelines applied.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ExamSelector;
