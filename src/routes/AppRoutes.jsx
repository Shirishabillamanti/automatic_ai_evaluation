import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import StudentDashboard from '../pages/StudentDashboard';
import MyResults from '../pages/student/MyResults';
import ExamHistory from '../pages/student/ExamHistory';
import MyPerformance from '../pages/student/MyPerformance';
import StudentProfile from '../pages/student/StudentProfile';
import StudentSettings from '../pages/student/StudentSettings';
import TeacherDashboard from '../pages/TeacherDashboard';
import CreateExam from '../pages/teacher/CreateExam';
import ExamsList from '../pages/teacher/ExamsList';
import AnswerSheets from '../pages/teacher/AnswerSheets';
import EvaluationReview from '../pages/teacher/EvaluationReview';
import ResultsReports from '../pages/teacher/ResultsReports';
import TeacherProfile from '../pages/teacher/TeacherProfile';
import TeacherSettings from '../pages/teacher/TeacherSettings';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';

/**
 * SmartEval Application Routing
 * Phase 3: Teacher/Admin Dashboard Suite
 * Phase 4: Student Dashboard Suite
 */
export const AppRoutes = () => {
  const teacherRoles = ['teacher', 'teacher_admin'];
  const studentRoles = ['student'];

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      {/* Student Protected Portal Routes */}
      <Route
        path="/student"
        element={<Navigate to="/student/dashboard" replace />}
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <MyResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/exams"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <ExamHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/performance"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <MyPerformance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={studentRoles}>
            <StudentSettings />
          </ProtectedRoute>
        }
      />

      {/* Teacher/Admin Protected Dashboard Suite */}
      <Route
        path="/teacher"
        element={<Navigate to="/teacher/dashboard" replace />}
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <ExamsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/exams/create"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <CreateExam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/answer-sheets"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <AnswerSheets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/evaluation"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <EvaluationReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/results"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <ResultsReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute allowedRoles={teacherRoles}>
            <TeacherSettings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
