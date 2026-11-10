import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
} from 'lucide-react';
import StudentLayout from '../components/student/StudentLayout';
import StudentStatCards from '../components/student/StudentStatCards';
import RecentResultsTable from '../components/student/RecentResultsTable';
import ResultDetailsModal from '../components/student/ResultDetailsModal';
import { useAuth } from '../context/useAuth';
import { fetchStudentResults, fetchStudentStats } from '../services/studentService';

export const StudentDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const studentUid = userProfile?.uid || currentUser?.uid;

  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (!studentUid) return;
    if (!isInitial) setLoading(true);
    setError(null);
    try {
      const [statsData, resultsData] = await Promise.all([
        fetchStudentStats(studentUid),
        fetchStudentResults(studentUid),
      ]);
      setStats(statsData);
      setResults(resultsData);
    } catch (err) {
      console.error('[SmartEval] Student dashboard load error:', err);
      setError('Unable to fetch your published results. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [studentUid]);

  useEffect(() => {
    let ignore = false;
    const fetchInit = async () => {
      if (!studentUid) return;
      try {
        const [statsData, resultsData] = await Promise.all([
          fetchStudentStats(studentUid),
          fetchStudentResults(studentUid),
        ]);
        if (!ignore) {
          setStats(statsData);
          setResults(resultsData);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[SmartEval] Student dashboard load error:', err);
          setError('Unable to fetch your published results. Please check your network connection.');
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

  const displayName = userProfile?.fullName || currentUser?.displayName || 'Student';

  return (
    <StudentLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden mb-8 border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>SmartEval Academic Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Track your verified evaluation reports, question-wise breakdown scores, and instructor feedback on handwritten answer sheets.
          </p>
        </div>

        {/* Decorative background flair */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Statistics Cards */}
      <StudentStatCards stats={stats} loading={loading} />

      {/* Main Content: Recent Results Table */}
      <div className="space-y-8">
        <RecentResultsTable
          results={results}
          loading={loading}
          error={error}
          onRefresh={loadDashboardData}
          onSelectResult={(res) => setSelectedResult(res)}
          limit={5}
        />

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/student/results"
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-card transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                My Results Archive
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View all past exam papers and question breakdowns
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
          </Link>

          <Link
            to="/student/performance"
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-card transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Subject Performance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Analyze strengths and areas of improvement by topic
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
          </Link>

          <Link
            to="/student/exams"
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-card transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Examination History
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Chronological timeline of all completed assessments
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
          </Link>
        </div>
      </div>

      {/* Result Details Modal */}
      <ResultDetailsModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </StudentLayout>
  );
};

export default StudentDashboard;
