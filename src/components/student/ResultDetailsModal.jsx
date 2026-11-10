import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const ResultDetailsModal = ({ result, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const percentage = Number(result.percentage) || Math.round((Number(result.obtainedMarks) / Number(result.maximumMarks)) * 100);

  const getScoreBadge = (pct) => {
    if (pct >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (pct >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const hasQuestions = Array.isArray(result.questionResults) && result.questionResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                {result.subject || 'Subject'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {result.examDate || 'Date Not Specified'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {result.examTitle || 'Exam Result Report'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Score Ribbon */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Marks Obtained
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                {result.obtainedMarks ?? 0}
              </span>
              <span className="text-[11px] text-slate-400">Score Achieved</span>
            </div>

            <div className="border-x border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Maximum Marks
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                {result.maximumMarks ?? 100}
              </span>
              <span className="text-[11px] text-slate-400">Total Available</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Percentage
              </span>
              <div className="mt-1 flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black border ${getScoreBadge(
                    percentage
                  )}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {percentage}%
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                Status: Published
              </span>
            </div>
          </div>

          {/* Teacher Feedback (if available) */}
          {result.teacherFeedback && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Instructor Feedback & Remarks
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-blue-100">
                "{result.teacherFeedback}"
              </p>
            </div>
          )}

          {/* Question-wise Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Question-Wise Evaluation Breakdown
              </h3>
              {hasQuestions && (
                <span className="text-xs text-slate-500 font-medium">
                  {result.questionResults.length} Questions Evaluated
                </span>
              )}
            </div>

            {hasQuestions ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Q#</th>
                      <th className="py-2.5 px-3">Question / Topic</th>
                      <th className="py-2.5 px-3 text-right">Max</th>
                      <th className="py-2.5 px-3 text-right">Scored</th>
                      <th className="py-2.5 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {result.questionResults.map((q, idx) => {
                      const qMax = Number(q.maxMarks) || 10;
                      const qObtained = Number(q.obtainedMarks) || 0;
                      const qPct = Math.round((qObtained / qMax) * 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            Q{q.questionNumber || idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {q.questionText || q.topic || `Question ${idx + 1}`}
                            {q.remarks && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5">
                                Note: {q.remarks}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {qMax}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {qObtained}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                qPct >= 70
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : qPct >= 50
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {qPct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Detailed question-wise rubric marks are currently being formatted by your instructor. Overall aggregate score is verified and final.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified evaluation report &bull; SmartEval AI Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsModal;
