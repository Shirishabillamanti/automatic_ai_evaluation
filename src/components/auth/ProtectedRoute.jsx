import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

/**
 * Route wrapper that ensures authentication, role matching, and active status.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Verifying SmartEval session...</p>
      </div>
    );
  }

  // 1. Must be logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Must have active accountStatus (pending, disabled, or rejected are denied access)
  const status = userProfile?.accountStatus || 'active';
  if (status !== 'active') {
    return <Navigate to="/login" replace />;
  }

  const role = userProfile?.role;
  const isTeacher = role === 'teacher' || role === 'teacher_admin';

  // 3. Role authorization check
  if (allowedRoles.length > 0) {
    const allowsTeacher = allowedRoles.includes('teacher') || allowedRoles.includes('teacher_admin');
    const allowsStudent = allowedRoles.includes('student');

    // Students must never access teacher dashboard routes
    if (!isTeacher && allowsTeacher) {
      return <Navigate to="/student/dashboard" replace />;
    }

    // Teachers redirected to teacher dashboard if trying to access student-only route
    if (isTeacher && !allowsTeacher && allowsStudent) {
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
