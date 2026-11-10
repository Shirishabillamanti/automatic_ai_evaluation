import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
} from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';
import ResultDetailsModal from '../../components/student/ResultDetailsModal';
import { useAuth } from '../../context/useAuth';
import { fetchStudentResults } from '../../services/studentService';

export const ExamHistory = () => {
  const { userProfile, currentUser } = useAuth();
  const studentUid = userProfile?.uid || currentUser?.uid;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  const loadHistory = useCallback(async (isInitial = false) => {
    if (!studentUid) return;
    if (!isInitial) setLoading(true);
    try {
      const data = await fetchStudentResults(studentUid);
      setHistory(data);
    } catch (err) {
      console.error('[SmartEval] Load exam history error:', err);
    } finally {
      setLoading(false);
    }
  }, [studentUid]);

  useEffect(() => {
    let ignore = false;
    const fetchInit = async () => {
      if (!studentUid) return;
      try {
        const data = await fetchStudentResults(studentUid);
        if (!ignore) setHistory(data);
      } catch (err) {
        if (!ignore) console.error('[SmartEval] Load exam history error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInit();
    return () => {
      ignore = true;
    };
  }, [studentUid]);

  return (
    <StudentLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            Exam History & Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological record of completed and evaluated examinations
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Exam History Recorded
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            You do not have any historical exam evaluations recorded yet. When your instructor submits handwritten papers for evaluation and publishes the final grades, your exam timeline will automatically display here.
          </p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 space-y-6">
          {history.map((item, idx) => {
            const pct =
              Number(item.percentage) ||
              Math.round(
                (Number(item.obtainedMarks) / Number(item.maximumMarks)) * 100
              );

            return (
              <div key={item.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                        {item.subject || 'General'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.examDate || 'Recent'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {item.examTitle || 'Exam Assessment'}
                    </h3>

                    <p className="text-xs text-slate-500">
                      Score Achieved:{' '}
                      <span className="font-semibold text-slate-800">
                        {item.obtainedMarks} / {item.maximumMarks}
                      </span>{' '}
                      &bull; Percentage:{' '}
                      <span className="font-bold text-blue-600">{pct}%</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed & Scored
                    </span>

                    <button
                      onClick={() => setSelectedResult(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ResultDetailsModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </StudentLayout>
  );
};

export default ExamHistory;
