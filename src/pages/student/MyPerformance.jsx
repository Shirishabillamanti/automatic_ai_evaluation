import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  BookOpen,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/useAuth';
import { fetchStudentPerformance } from '../../services/studentService';

export const MyPerformance = () => {
  const { userProfile, currentUser } = useAuth();
  const studentUid = userProfile?.uid || currentUser?.uid;

  const [data, setData] = useState({ subjects: [], history: [] });
  const [loading, setLoading] = useState(true);

  const loadPerformance = useCallback(async (isInitial = false) => {
    if (!studentUid) return;
    if (!isInitial) setLoading(true);
    try {
      const res = await fetchStudentPerformance(studentUid);
      setData(res);
    } catch (err) {
      console.error('[SmartEval] Performance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [studentUid]);

  useEffect(() => {
    let ignore = false;
    const fetchInit = async () => {
      if (!studentUid) return;
      try {
        const res = await fetchStudentPerformance(studentUid);
        if (!ignore) setData(res);
      } catch (err) {
        if (!ignore) console.error('[SmartEval] Performance fetch error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInit();
    return () => {
      ignore = true;
    };
  }, [studentUid]);

  const hasData = data.history.length > 0;
  const hasMultipleExams = data.history.length >= 2;

  const getScoreColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (pct >= 50) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getBarColor = (pct) => {
    if (pct >= 85) return 'bg-emerald-500';
    if (pct >= 70) return 'bg-blue-600';
    if (pct >= 50) return 'bg-indigo-600';
    return 'bg-amber-500';
  };

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            My Academic Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Subject-wise breakdown and score trends based exclusively on approved results
          </p>
        </div>

        <button
          onClick={loadPerformance}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-32"
              />
            ))}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-64" />
        </div>
      )}

      {/* Empty State: Insufficient Data */}
      {!loading && !hasData && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Insufficient Data for Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Performance analytics, subject mastery metrics, and longitudinal score trends unlock automatically once your instructor evaluates and publishes your first examination.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Strict data policy: SmartEval does not display simulated or fake charts.</span>
          </div>
        </div>
      )}

      {/* Actual Data View */}
      {!loading && hasData && (
        <div className="space-y-8">
          {/* Subject-Wise Performance Cards */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Subject-Wise Mastery Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.subjects.map((s) => (
                <div
                  key={s.subject}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {s.subject}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getScoreColor(
                        s.averagePercentage
                      )}`}
                    >
                      {s.averagePercentage}% Avg
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getBarColor(
                        s.averagePercentage
                      )}`}
                      style={{ width: `${s.averagePercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Total Scored:{' '}
                      <strong className="text-slate-800">
                        {s.totalObtained} / {s.totalMax}
                      </strong>
                    </span>
                    <span>
                      {s.count} {s.count === 1 ? 'Exam' : 'Exams'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam-Wise Percentage & Real Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Exam-Wise Percentage Comparison
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real evaluation marks recorded across completed examinations
                </p>
              </div>

              {hasMultipleExams && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Trend Active ({data.history.length} Exams)
                </span>
              )}
            </div>

            {/* Clean Real Visual Bar Distribution */}
            <div className="space-y-4">
              {data.history.map((exam, idx) => (
                <div key={exam.id || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>{exam.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {exam.subject}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">
                        {exam.obtained} / {exam.max}
                      </span>
                      <span className="font-extrabold text-blue-600 w-12 text-right">
                        {exam.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${getBarColor(
                        exam.percentage
                      )}`}
                      style={{ width: `${exam.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default MyPerformance;
