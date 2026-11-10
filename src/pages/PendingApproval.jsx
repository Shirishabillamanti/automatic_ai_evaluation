import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Mail,
  User,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import Logo from '../components/auth/Logo';
import { useAuth } from '../context/useAuth';

const CURRENT_YEAR = new Date().getFullYear();

export const PendingApproval = () => {
  const { userProfile, currentUser, logout, refreshProfile, approveAccount } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const isTeacher = userProfile?.role === 'teacher_admin' || userProfile?.role === 'teacher';
  const roleLabel = isTeacher ? 'Teacher / Admin' : 'Student';

  const handleRefresh = async () => {
    setChecking(true);
    setStatusMessage('');
    const updated = await refreshProfile();
    setChecking(false);
    if (updated?.accountStatus === 'active') {
      if (isTeacher) {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setStatusMessage('Your account is waiting for approval. Please check back shortly or refresh once approved.');
    }
  };

  const handleSimulateApproval = async () => {
    const targetUid = userProfile?.uid || currentUser?.uid;
    if (!targetUid) return;
    setApproving(true);
    setStatusMessage('Simulating administrator approval in progress...');
    const res = await approveAccount(targetUid);
    setApproving(false);
    if (res.success) {
      setStatusMessage('Account approved successfully! Redirecting to dashboard...');
      setTimeout(() => {
        if (isTeacher) {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1000);
    } else {
      setStatusMessage(res.error || 'Failed to update approval status.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-10">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <Logo variant="dark" />
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto my-auto w-full py-8">
        <div className="bg-white rounded-2xl p-7 sm:p-10 shadow-card border border-slate-200 text-center">
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ACCOUNT STATUS: PENDING VERIFICATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your account is waiting for approval.
          </h1>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
            Welcome, <span className="font-semibold text-slate-800">{userProfile?.fullName || currentUser?.displayName || 'User'}</span>. Your <span className="font-semibold text-slate-800">{roleLabel}</span> registration has been securely created and is awaiting approval by an institution administrator before full access is activated.
          </p>

          {/* User Registration Details Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <User className="w-3.5 h-3.5" />
                Full Name
              </span>
              <span className="font-semibold text-slate-800">{userProfile?.fullName || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </span>
              <span className="font-mono text-slate-700">{userProfile?.email || currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                {isTeacher ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                Registered Role
              </span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Institutional Security Notice */}
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-800 text-left flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              To preserve examination security and prevent unauthorized access, Teacher/Admin accounts require server-side administrator verification before evaluation dashboards and grading tools can be unlocked.
            </p>
          </div>

          {statusMessage && (
            <p className="text-xs font-medium text-amber-700 mt-4 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              {statusMessage}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking || approving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>

            <button
              onClick={handleSimulateApproval}
              disabled={checking || approving}
              title="Test approval flow directly"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              <CheckCircle className={`w-3.5 h-3.5 ${approving ? 'animate-spin' : ''}`} />
              <span>{approving ? 'Approving...' : 'Simulate Admin Approval'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        &copy; {CURRENT_YEAR} SmartEval. AI-Powered Examination Evaluation.
      </footer>
    </div>
  );
};

export default PendingApproval;
