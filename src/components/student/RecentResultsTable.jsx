import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  FileCheck2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const RecentResultsTable = ({
  results,
  loading,
  error,
  onRefresh,
  onSelectResult,
  limit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Extract unique subjects
  const subjects = useMemo(() => {
    if (!results || results.length === 0) return [];
    const set = new Set(results.map((r) => r.subject).filter(Boolean));
    return Array.from(set);
  }, [results]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!results) return [];

    let filtered = results.filter((r) => {
      // Must be published
      if (r.status !== 'published') return false;

      const titleMatch = (r.examTitle || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const subjectMatch = (r.subject || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesSearch = titleMatch || subjectMatch;
      const matchesSubject =
        selectedSubject === 'all' || r.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });

    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [results, searchTerm, selectedSubject, limit]);

  const getScoreBadge = (pct) => {
    if (pct >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (pct >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            {limit ? 'Recent Published Results' : 'All Published Results'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Only instructor-approved and published evaluation reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exam or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                aria-label="Filter results by subject"
                className="text-xs py-1.5 pl-3 pr-7 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh results"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-8 w-24 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Failed to load results</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredResults.length === 0 && (
        <div className="p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Published Results Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            {searchTerm || selectedSubject !== 'all'
              ? 'No evaluation records matched your search or subject filters.'
              : 'Your instructors have not published evaluated results for your account yet. Check back once your handwritten answer scripts have been verified and scored.'}
          </p>
        </div>
      )}

      {/* Results Table */}
      {!loading && !error && filteredResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Exam Name</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredResults.map((result) => {
                const obtained = Number(result.obtainedMarks) || 0;
                const max = Number(result.maximumMarks) || 100;
                const pct =
                  Number(result.percentage) ||
                  Math.round((obtained / max) * 100);

                return (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 truncate max-w-xs">
                        {result.examTitle || 'Untitled Examination'}
                      </div>
                      {result.teacherFeedback && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          Feedback: "{result.teacherFeedback}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                        {result.subject || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {result.examDate || '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-500">
                      {max}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {obtained}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreBadge(
                          pct
                        )}`}
                      >
                        {pct}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Published
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectResult(result)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentResultsTable;
