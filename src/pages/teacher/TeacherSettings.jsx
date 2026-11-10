import React, { useState } from 'react';
import { Bell, Sliders, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import { useAuth } from '../../context/useAuth';

export const TeacherSettings = () => {
  const { userProfile, currentUser, forgotPassword } = useAuth();

  const [ocrConfidence, setOcrConfidence] = useState('85');
  const [notifyOnUpload, setNotifyOnUpload] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    const email = userProfile?.email || currentUser?.email;
    if (!email) return;
    setSendingReset(true);
    await forgotPassword(email);
    setSendingReset(false);
    setResetSent(true);
  };

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Workspace Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure evaluation parameters, notification alerts, and institutional security.
          </p>
        </div>

        {resetSent && (
          <div className="p-4 rounded-xl text-xs flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password reset instructions have been dispatched to your email address.</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle divide-y divide-slate-100">
          {/* AI Evaluation Threshold */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">AI Evaluation Sensitivity</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Determine the automated confidence threshold required before a question score requires manual teacher review.
            </p>

            <div className="max-w-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Confidence Threshold:</span>
                <span className="font-bold text-blue-600">{ocrConfidence}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={ocrConfidence}
                onChange={(e) => setOcrConfidence(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Scores with semantic confidence below {ocrConfidence}% will be tagged as &quot;Pending Review&quot;.
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Notification Preferences</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Manage automatic email alerts for examination submissions and evaluation events.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={notifyOnUpload}
                  onChange={(e) => setNotifyOnUpload(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <div>
                  <p className="font-semibold text-slate-800">New Answer Sheet Batch Ingestion</p>
                  <p className="text-slate-500 text-[11px]">Notify me when exam papers are uploaded for my course</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={notifyOnComplete}
                  onChange={(e) => setNotifyOnComplete(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <div>
                  <p className="font-semibold text-slate-800">OCR & Evaluation Processing Completed</p>
                  <p className="text-slate-500 text-[11px]">Receive a summary when AI grading finishes an exam batch</p>
                </div>
              </label>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Account Credentials</h2>
              </div>
              <p className="text-xs text-slate-500">
                Trigger a secure password reset via Firebase Authentication.
              </p>
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={sendingReset || resetSent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{sendingReset ? 'Sending...' : resetSent ? 'Email Sent' : 'Reset Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherSettings;
