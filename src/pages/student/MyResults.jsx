import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Search,
  Eye,
  Calendar,
  AlertCircle,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';
import ResultDetailsModal from '../../components/student/ResultDetailsModal';
import { useAuth } from '../../context/useAuth';
import { fetchStudentResults } from '../../services/studentService';

export const MyResults = () => {
  const { userProfile, currentUser } = useAuth();
  const studentUid = userProfile?.uid || currentUser?.uid;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);

  const loadResults = useCallback(async (isInitial = false) => {
    if (!studentUid) return;
    if (!isInitial) setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentResults(studentUid);
      setResults(data);
    } catch (err) {
      console.error('[SmartEval] Load results error:', err);
      setError('Unable to fetch results. Please try again.');
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
        if (!ignore) setResults(data);
      } catch (err) {
        if (!ignore) {
          console.error('[SmartEval] Load results error:', err);
          setError('Unable to fetch results. Please try again.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInit();
    return () => {
      ignore = true;
    };
  }, [studentUid]);

  // Unique subjects
  const subjects = Array.from(
    new Set(results.map((r) => r.subject).filter(Boolean))
  );

  // Filtered results
  const filteredResults = results.filter((r) => {
    if (r.status !== 'published') return false;
    const matchesSearch =
      (r.examTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === 'all' || r.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getScoreBadge = (pct) => {
    if (pct >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (pct >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <StudentLayout>
      {/* Page Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-blue-600" />
            My Published Results
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all verified and instructor-approved evaluation reports
          </p>
        </div>

        <button
          onClick={loadResults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by exam title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>

        {subjects.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter results by subject"
              className="w-full sm:w-auto text-xs py-2 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="all">All Subjects ({results.length})</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900">{error}</p>
          <button
            onClick={loadResults}
            className="mt-3 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredResults.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Published Examination Results Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {searchTerm || selectedSubject !== 'all'
              ? 'No results match your selected filter criteria. Try clearing search keywords.'
              : 'Your teachers have not published any evaluated answer papers for your student account yet. Once published, your question scores and feedback will appear here.'}
          </p>
        </div>
      )}

      {/* Results Grid / Cards */}
      {!loading && !error && filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((res) => {
            const obtained = Number(res.obtainedMarks) || 0;
            const max = Number(res.maximumMarks) || 100;
            const pct =
              Number(res.percentage) || Math.round((obtained / max) * 100);

            return (
              <div
                key={res.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                      {res.subject || 'General'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreBadge(
                        pct
                      )}`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {res.examTitle || 'Examination'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {res.examDate || 'No date'}
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold text-slate-700">
                      Score: {obtained} / {max}
                    </span>
                  </div>

                  {res.teacherFeedback && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 line-clamp-2">
                      "{res.teacherFeedback}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>

                  <button
                    onClick={() => setSelectedResult(res)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Breakdown</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <ResultDetailsModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </StudentLayout>
  );
};

export default MyResults;
