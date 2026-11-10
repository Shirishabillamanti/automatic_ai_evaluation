import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/useAuth';

export const StudentSettings = () => {
  const { userProfile, currentUser, forgotPassword } = useAuth();

  const [notifyOnPublished, setNotifyOnPublished] = useState(true);
  const [notifyOnFeedback, setNotifyOnFeedback] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    const email = userProfile?.email || currentUser?.email;
    if (!email) return;
    setSendingReset(true);
    try {
      await forgotPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error('[SmartEval] Password reset error:', err);
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600" />
            Student Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your evaluation notification alerts, credentials, and privacy options
          </p>
        </div>

        {resetSent && (
          <div className="p-4 rounded-xl text-xs flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              A password reset link has been dispatched to{' '}
              <strong className="font-mono">{userProfile?.email || currentUser?.email}</strong>.
            </span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Notification Preferences */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Notification Preferences
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Choose how you want to be notified when instructors complete evaluations
            </p>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={notifyOnPublished}
                  onChange={(e) => setNotifyOnPublished(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    Published Examination Results
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Receive an immediate email notification when an evaluated answer paper is published by your instructor.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={notifyOnFeedback}
                  onChange={(e) => setNotifyOnFeedback(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    Instructor Remarks & Feedback Alerts
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Get alerted when a teacher leaves qualitative feedback or grading notes on your submission.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Password & Security */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Password & Security
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Trigger an authenticated password reset email via Firebase Authentication.
              </p>
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={sendingReset || resetSent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {sendingReset
                  ? 'Sending Link...'
                  : resetSent
                  ? 'Email Sent'
                  : 'Reset Password'}
              </span>
            </button>
          </div>

          {/* Privacy & Academic Integrity Notice */}
          <div className="p-6 sm:p-8 bg-slate-50/70">
            <div className="flex items-center gap-2 mb-1 text-slate-700">
              <Lock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Academic Integrity & Role Security
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your student account is restricted to read-only access for published evaluation reports. Marks and evaluation criteria can only be assigned or altered by verified course instructors under Firestore Security Rules.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentSettings;
