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
} from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';
import { useAuth } from '../../context/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase/firebase';

export const StudentProfile = () => {
  const { userProfile, currentUser, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(
    userProfile?.fullName || currentUser?.displayName || ''
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const displayName =
    userProfile?.fullName || currentUser?.displayName || 'Student';
  const displayEmail =
    userProfile?.email || currentUser?.email || 'student@smarteval.edu';
  const username = userProfile?.username || displayEmail.split('@')[0];
  const uid = userProfile?.uid || currentUser?.uid || '—';
  const role = userProfile?.role || 'student';
  const status = userProfile?.accountStatus || 'active';

  // Format creation date
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setFeedback(null);

    // 1. LIVE FIRESTORE UPDATE (Permitted fields only)
    if (isFirebaseConfigured && db && uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          fullName: fullName.trim(),
          updatedAt: serverTimestamp(),
        });
        await refreshProfile();
        setFeedback({
          type: 'success',
          message: 'Profile name successfully updated in Firestore!',
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
            parsed[email].profile.updatedAt = new Date().toISOString();
          }
        }
        localStorage.setItem('smarteval_users_db', JSON.stringify(parsed));
      }
      await refreshProfile();
      setFeedback({
        type: 'success',
        message: 'Profile name updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-blue-600" />
            My Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your verified student identity, credentials, and institutional enrollment records
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

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center gap-4">
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

          {/* Form & Attributes */}
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            {/* Full Name Edit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name (Editable)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This name appears on your published grade sheets and instructor evaluations.
              </p>
            </div>

            {/* Read-Only Profile Details */}
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
                  <span>Username</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={username}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Role & Status & Account Creation Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Assigned Role
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 mt-1 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Immutable by student</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Account Status
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-1 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Managed by administrator</span>
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

            {/* UID */}
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

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Only display name can be altered directly.
              </span>
              <button
                type="submit"
                disabled={saving || !fullName.trim() || fullName === displayName}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Update Name'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
