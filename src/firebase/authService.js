import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

/**
 * Demo accounts for quick verification (strictly Teacher and Student)
 */
export const DEMO_ACCOUNTS = [
  {
    role: 'teacher',
    label: 'Teacher (Faculty)',
    email: 'teacher@smarteval.edu',
    password: 'Password@123',
    badge: 'Active Evaluator',
  },
  {
    role: 'student',
    label: 'Student (Learner)',
    email: 'student@smarteval.edu',
    password: 'Password@123',
    badge: 'Active Student',
  },
];

const DEFAULT_USERS_SEED = {
  'teacher@smarteval.edu': {
    password: 'Password@123',
    profile: {
      uid: 'demo_teacher_01',
      fullName: 'Dr. Sarah Connor',
      email: 'teacher@smarteval.edu',
      username: 'sarah_faculty',
      role: 'teacher',
      accountStatus: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  'student@smarteval.edu': {
    password: 'Password@123',
    profile: {
      uid: 'demo_student_01',
      fullName: 'Alex Morgan',
      email: 'student@smarteval.edu',
      username: 'alex_student',
      role: 'student',
      accountStatus: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
};

/**
 * Local persistent store helpers for when live Firebase keys are not in .env.
 */
const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem('smarteval_users_db');
    if (!raw) {
      localStorage.setItem('smarteval_users_db', JSON.stringify(DEFAULT_USERS_SEED));
      return { ...DEFAULT_USERS_SEED };
    }
    const parsed = JSON.parse(raw);
    let needsResave = false;
    for (const email in DEFAULT_USERS_SEED) {
      if (!parsed[email]) {
        parsed[email] = DEFAULT_USERS_SEED[email];
        needsResave = true;
      }
    }
    if (needsResave) {
      localStorage.setItem('smarteval_users_db', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { ...DEFAULT_USERS_SEED };
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem('smarteval_users_db', JSON.stringify(users));
  } catch (err) {
    console.error('[SmartEval] Storage error:', err);
  }
};

const getLocalSession = () => {
  try {
    return JSON.parse(localStorage.getItem('smarteval_session') || 'null');
  } catch {
    return null;
  }
};

const setLocalSession = (session) => {
  try {
    if (session) {
      localStorage.setItem('smarteval_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('smarteval_session');
    }
  } catch (err) {
    console.error('[SmartEval] Session storage error:', err);
  }
};

/**
 * Formats Firebase error codes into user-friendly messages.
 */
export const formatFirebaseError = (error) => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Credentials mismatch: Incorrect email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access temporarily restricted. Try again later.';
    case 'permission-denied':
      return 'Access denied by Cloud Firestore security rules.';
    default:
      return error?.message || 'An unexpected authentication error occurred.';
  }
};

/**
 * Register new user with Firebase Authentication and save profile to Cloud Firestore.
 * Both Student and Teacher roles are directly active upon registration.
 * @param {Object} data - { fullName, email, username, password, role }
 */
export const registerWithEmail = async ({ fullName, email, username, password, role }) => {
  const canonicalRole = (role === 'teacher' || role === 'teacher_admin') ? 'teacher' : 'student';
  const normalizedEmail = email.trim().toLowerCase();
  const accountStatus = 'active'; // Directly active for both Student & Teacher

  // 1. LIVE FIREBASE AUTH & FIRESTORE MODE
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName.trim() });

    const userProfile = {
      uid: user.uid,
      fullName: fullName.trim(),
      email: normalizedEmail,
      username: username.trim().toLowerCase(),
      role: canonicalRole,
      accountStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, userProfile);

    return {
      user,
      profile: {
        ...userProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  // 2. LOCAL PERSISTENT STORE MODE
  const users = getLocalUsers();

  if (users[normalizedEmail]) {
    throw new Error('An account with this email address already exists. Try signing in.');
  }

  const uid = 'smarteval_' + Math.random().toString(36).substring(2, 10);
  const userProfile = {
    uid,
    fullName: fullName.trim(),
    email: normalizedEmail,
    username: username.trim().toLowerCase(),
    role: canonicalRole,
    accountStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users[normalizedEmail] = {
    password,
    profile: userProfile,
  };
  saveLocalUsers(users);

  const sessionUser = {
    uid,
    email: normalizedEmail,
    displayName: fullName.trim(),
  };
  setLocalSession({ user: sessionUser, profile: userProfile });

  return {
    user: sessionUser,
    profile: userProfile,
  };
};

/**
 * Sign in existing user with email and password and fetch their Firestore profile.
 * @param {Object} credentials - { email, password }
 */
export const loginWithEmail = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. LIVE FIREBASE AUTH & FIRESTORE MODE
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let profile = null;
    if (userDocSnap.exists()) {
      profile = userDocSnap.data();
    } else {
      profile = {
        uid: user.uid,
        fullName: user.displayName || 'SmartEval User',
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        role: 'student',
        accountStatus: 'active',
      };
      await setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (profile.accountStatus === 'disabled') {
      await signOut(auth);
      throw new Error('This user account has been disabled. Access denied.');
    }

    return { user, profile };
  }

  // 2. LOCAL PERSISTENT STORE MODE
  const users = getLocalUsers();
  const record = users[normalizedEmail];

  if (!record) {
    throw new Error('No account found with this email address. Please verify or register.');
  }

  if (record.password !== password) {
    throw new Error('Incorrect password for this account. Please verify your credentials.');
  }

  if (record.profile.accountStatus === 'disabled') {
    throw new Error('This user account has been disabled. Access denied.');
  }

  const sessionUser = {
    uid: record.profile.uid,
    email: record.profile.email,
    displayName: record.profile.fullName,
  };
  setLocalSession({ user: sessionUser, profile: record.profile });

  return {
    user: sessionUser,
    profile: record.profile,
  };
};

/**
 * Sign out current authenticated user.
 */
export const logoutUser = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
  }
  setLocalSession(null);
  return { success: true };
};

/**
 * Send password reset email.
 * @param {string} email
 */
export const resetUserPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured && auth) {
    return sendPasswordResetEmail(auth, normalizedEmail);
  }

  const users = getLocalUsers();
  if (!users[normalizedEmail]) {
    throw new Error('No registered account found with this email address.');
  }
  return { success: true };
};

/**
 * Fetch fresh user profile by UID.
 * @param {string} uid
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;

  if (isFirebaseConfigured && db) {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data() : null;
  }

  const session = getLocalSession();
  if (session && session.profile && session.profile.uid === uid) {
    return session.profile;
  }

  const users = getLocalUsers();
  for (const email in users) {
    if (users[email]?.profile?.uid === uid) {
      return users[email].profile;
    }
  }

  return null;
};

/**
 * Get active session if in local mode
 */
export const getActiveLocalSession = () => {
  return getLocalSession();
};

/**
 * Fetch registered students for teacher dashboard
 */
export const getStudentsList = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      console.warn('Failed to query Firestore students:', err.message);
    }
  }

  const users = getLocalUsers();
  const list = [];
  for (const email in users) {
    const profile = users[email]?.profile;
    if (profile && profile.role === 'student') {
      list.push(profile);
    }
  }
  return list;
};

export default {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetUserPassword,
  getUserProfile,
  getStudentsList,
  DEMO_ACCOUNTS,
};
