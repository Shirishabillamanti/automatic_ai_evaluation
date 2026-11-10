import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Hash,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  KeyRound,
} from 'lucide-react';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import { useAuth } from '../../context/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/firebase';

export const TeacherProfile = () => {
  const { userProfile, currentUser, refreshProfile, forgotPassword } = useAuth();

  const [fullName, setFullName] = useState(
    userProfile?.fullName || currentUser?.displayName || ''
  );
  const [username, setUsername] = useState(
    userProfile?.username || (userProfile?.email ? userProfile.email.split('@')[0] : '')
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const displayName = userProfile?.fullName || currentUser?.displayName || 'Teacher';
  const displayEmail = userProfile?.email || currentUser?.email || 'teacher@smarteval.edu';
  const uid = userProfile?.uid || currentUser?.uid || '—';
  const role =
    userProfile?.role === 'teacher_admin'
      ? 'Teacher / Admin'
      : userProfile?.role === 'teacher'
      ? 'Teacher'
      : 'Faculty';
  const status = userProfile?.accountStatus || 'active';

  // Format account creation date
  let creationDate = '—';
  if (userProfile?.createdAt) {
    try {
      const rawDate = userProfile.createdAt.toDate
        ? userProfile.createdAt.toDate()
        : new Date(userProfile.createdAt);
      creationDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(rawDate);
    } catch {
      creationDate = String(userProfile.createdAt);
    }
  } else if (currentUser?.metadata?.creationTime) {
    creationDate = new Date(currentUser.metadata.creationTime).toLocaleString();
  }

  // Handle Profile Update (Full Name & Username permitted)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    // Validate username: alphanumeric and underscore, 3-20 chars
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setFeedback({
        type: 'error',
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    // 1. LIVE FIRESTORE UPDATE
    if (isFirebaseConfigured && db && uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          updatedAt: serverTimestamp(),
        });
        await refreshProfile();
        setFeedback({
          type: 'success',
          message: 'Profile information updated successfully in Firestore!',
        });
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to update profile.',
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    // 2. LOCAL FALLBACK UPDATE
    try {
      const raw = localStorage.getItem('smarteval_users_db');
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const email in parsed) {
          if (parsed[email]?.profile?.uid === uid) {
            parsed[email].profile.fullName = fullName.trim();
            parsed[email].profile.username = username.trim().toLowerCase();
            parsed[email].profile.updatedAt = new Date().toISOString();
          }
        }
        localStorage.setItem('smarteval_users_db', JSON.stringify(parsed));
      }
      await refreshProfile();
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Secure Password Reset / Change
  const handlePasswordChange = async () => {
    if (!displayEmail) return;
    setResettingPassword(true);
    try {
      await forgotPassword(displayEmail);
      setPasswordResetSent(true);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch password reset email.',
      });
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-blue-600" />
            Instructor Profile & Credentials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your teacher identity, authorization credentials, and institutional parameters.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {passwordResetSent && (
          <div className="p-4 rounded-xl text-xs flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              A secure password change link has been sent to{' '}
              <strong className="font-mono">{displayEmail}</strong>. Follow the email instructions to update your password.
            </span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{displayName}</h2>
              <p className="text-xs text-slate-300 font-mono">{displayEmail}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  Role: {role}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 uppercase tracking-wide">
                  Status: {status}
                </span>
              </div>
            </div>
          </div>

          {/* Form & Editable Fields */}
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name (Editable) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name (Editable)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Username (Editable with validation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username (Editable)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  3-20 characters: letters, numbers, and underscores.
                </p>
              </div>
            </div>

            {/* Read-Only Identity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={displayEmail}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono cursor-not-allowed select-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Firebase Authentication UID</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="text"
                  disabled
                  value={uid}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono cursor-not-allowed select-all"
                />
              </div>
            </div>

            {/* Role, Status, Creation Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Assigned Role
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 mt-1 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Immutable authorization</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-1 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Verified academic role</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Account Created
                </span>
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {creationDate}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Registration timestamp</span>
              </div>
            </div>

            {/* Actions: Save Profile Changes & Password Change Trigger */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={resettingPassword || passwordResetSent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {resettingPassword
                    ? 'Sending...'
                    : passwordResetSent
                    ? 'Password Reset Sent'
                    : 'Change Password'}
                </span>
              </button>

              <button
                type="submit"
                disabled={saving || !fullName.trim() || !username.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 self-end sm:self-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherProfile;
