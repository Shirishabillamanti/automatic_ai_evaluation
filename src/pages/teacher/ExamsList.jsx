import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import RecentExamsTable from '../../components/dashboard/RecentExamsTable';
import { useAuth } from '../../context/useAuth';
import { fetchTeacherExams } from '../../services/dashboardService';

export const ExamsList = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const teacherUid = currentUser?.uid || userProfile?.uid;

  const loadExams = useCallback(async () => {
    if (!teacherUid) return;
    setLoading(true);
    try {
      const data = await fetchTeacherExams(teacherUid);
      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherUid]);

  useEffect(() => {
    let isMounted = true;
    if (!teacherUid) return;

    fetchTeacherExams(teacherUid)
      .then((data) => {
        if (isMounted) {
          setExams(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load exams:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teacherUid]);

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Examinations Repository</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage and organize all created academic examinations and scoring rubrics.
            </p>
          </div>

          <button
            onClick={() => navigate('/teacher/exams/create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Exam</span>
          </button>
        </div>

        <RecentExamsTable exams={exams} loading={loading} onRefresh={loadExams} />
      </div>
    </TeacherLayout>
  );
};

export default ExamsList;
