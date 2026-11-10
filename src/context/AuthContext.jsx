import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebase';
import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetUserPassword,
  getUserProfile,
  getActiveLocalSession,
  getStudentsList,
  formatFirebaseError,
} from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const initialSession = (!isFirebaseConfigured || !auth) ? getActiveLocalSession() : null;
  const [currentUser, setCurrentUser] = useState(() => initialSession?.user || null);
  const [userProfile, setUserProfile] = useState(() => initialSession?.profile || null);
  const [loading, setLoading] = useState(() => Boolean(isFirebaseConfigured && auth));
  const [authError, setAuthError] = useState(null);

  // Subscribe to Firebase Authentication state changes or restore local session
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
          setCurrentUser(firebaseUser);
        } catch (error) {
          console.error('[SmartEval] Failed to fetch Firestore user profile:', error);
          setUserProfile(null);
          setCurrentUser(firebaseUser);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in user using Firebase Authentication or local persistence.
   * @param {Object} credentials - { email, password }
   */
  const login = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user, profile } = await loginWithEmail({ email, password });
      return {
        success: true,
        user,
        profile,
        commitSession: () => {
          setCurrentUser(user);
          setUserProfile(profile);
        },
      };
    } catch (error) {
      const formatted = formatFirebaseError(error);
      setAuthError(formatted);
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user with Firebase Auth and save Firestore profile.
   * @param {Object} userData - { fullName, email, username, password, role }
   */
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user, profile } = await registerWithEmail(userData);
      return {
        success: true,
        user,
        profile,
        commitSession: () => {
          setCurrentUser(user);
          setUserProfile(profile);
        },
      };
    } catch (error) {
      const formatted = formatFirebaseError(error);
      setAuthError(formatted);
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email via Firebase Auth
   * @param {string} email
   */
  const forgotPassword = async (email) => {
    setLoading(true);
    setAuthError(null);
    try {
      await resetUserPassword(email);
      return { success: true };
    } catch (error) {
      const formatted = formatFirebaseError(error);
      setAuthError(formatted);
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out current user from Firebase Auth
   */
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(null);
      return { success: true };
    } catch (error) {
      const formatted = formatFirebaseError(error);
      setAuthError(formatted);
      return { success: false, error: formatted };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manually reload the user profile from Firestore
   */
  const refreshProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
        }
        return profile;
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }
    return null;
  };

  /**
   * Fetch registered students for Teacher Dashboard
   */
  const fetchStudents = async () => {
    return getStudentsList();
  };

  const clearError = () => setAuthError(null);

  const isTeacher = userProfile?.role === 'teacher' || userProfile?.role === 'teacher_admin';
  const isStudent = userProfile?.role === 'student';

  const value = {
    currentUser,
    userProfile,
    isAuthenticated: Boolean(currentUser),
    isTeacher,
    isStudent,
    loading,
    isLoading: loading,
    authError,
    isFirebaseConfigured,
    login,
    register,
    forgotPassword,
    logout,
    refreshProfile,
    fetchStudents,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
