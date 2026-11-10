import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

/**
 * Route wrapper for public auth pages (Login, Signup, Forgot Password).
 * Redirects already authenticated users to their corresponding dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading SmartEval...</p>
      </div>
    );
  }

  if (currentUser) {
    const isTeacher = userProfile?.role === 'teacher_admin' || userProfile?.role === 'teacher';
    if (isTeacher) {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
