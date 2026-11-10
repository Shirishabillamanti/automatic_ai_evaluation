import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import TeacherLayout from '../components/dashboard/TeacherLayout';
import StatCards from '../components/dashboard/StatCards';
import QuickActions from '../components/dashboard/QuickActions';
import RecentExamsTable from '../components/dashboard/RecentExamsTable';
import EvaluationProgress from '../components/dashboard/EvaluationProgress';
import RecentActivity from '../components/dashboard/RecentActivity';
import { useAuth } from '../context/useAuth';
import {
  fetchTeacherStats,
  fetchTeacherExams,
  fetchRecentActivities,
} from '../services/dashboardService';

export const TeacherDashboard = () => {
  const { userProfile, currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const teacherUid = currentUser?.uid || userProfile?.uid;
  const displayName = userProfile?.fullName || currentUser?.displayName || 'Teacher';

  const loadDashboardData = useCallback(async () => {
    if (!teacherUid) return;
    setLoading(true);
    try {
      const [statsData, examsData, activitiesData] = await Promise.all([
        fetchTeacherStats(teacherUid),
        fetchTeacherExams(teacherUid),
        fetchRecentActivities(teacherUid),
      ]);

      setStats(statsData);
      setExams(examsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('[SmartEval] Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherUid]);

  useEffect(() => {
    let isMounted = true;
    if (!teacherUid) return;

    Promise.all([
      fetchTeacherStats(teacherUid),
      fetchTeacherExams(teacherUid),
      fetchRecentActivities(teacherUid),
    ])
      .then(([statsData, examsData, activitiesData]) => {
        if (isMounted) {
          setStats(statsData);
          setExams(examsData);
          setActivities(activitiesData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[SmartEval] Error loading dashboard data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teacherUid]);

  return (
    <TeacherLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden mb-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            SmartEval Evaluation Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Monitor real-time exam progress, upload handwritten examination papers, define scoring rubrics, and inspect automated AI evaluation outcomes.
          </p>
        </div>
      </div>

      {/* 1. Real-Time Statistics Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* 2. Quick Actions Section */}
      <QuickActions />

      {/* 3. Recent Examinations Table */}
      <RecentExamsTable exams={exams} loading={loading} onRefresh={loadDashboardData} />

      {/* 4. Two-Column Bottom Grid: Evaluation Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvaluationProgress progress={stats?.progress} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} loading={loading} />
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
