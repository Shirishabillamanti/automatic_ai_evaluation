import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

const LOCAL_EXAMS_KEY = 'smarteval_exams_db';
const LOCAL_ACTIVITIES_KEY = 'smarteval_activities_db';
const LOCAL_NOTIFICATIONS_KEY = 'smarteval_notifications_db';

export const getLocalExams = () => {
  try {
    const raw = localStorage.getItem(LOCAL_EXAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalExams = (exams) => {
  try {
    localStorage.setItem(LOCAL_EXAMS_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error('[SmartEval] Local exam storage error:', err);
  }
};

export const getLocalActivities = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalActivities = (activities) => {
  try {
    localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (err) {
    console.error('[SmartEval] Local activity storage error:', err);
  }
};

export const getLocalNotifications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Fetch real-time statistics for the teacher's dashboard.
 * Connects directly to Firestore:
 * - Total Exams (exams collection)
 * - Total Answer Sheets Uploaded (submissions collection)
 * - Pending Reviews (submissions with pending_review or processing)
 * - Approved Evaluations (submissions with approved or completed)
 * @param {string} teacherUid
 */
export const fetchTeacherStats = async (teacherUid) => {
  const defaultStats = {
    totalExams: 0,
    totalAnswerSheetsUploaded: 0,
    pendingReviews: 0,
    approvedEvaluations: 0,
    progress: {
      totalUploaded: 0,
      processed: 0,
      waitingReview: 0,
      approved: 0,
      completionRate: 0,
    },
  };

  if (!teacherUid) return defaultStats;

  // 1. LIVE FIRESTORE MODE
  if (isFirebaseConfigured && db) {
    try {
      // Query exams for this teacher
      const examsQ = query(
        collection(db, 'exams'),
        where('teacherId', '==', teacherUid)
      );
      const examsSnap = await getDocs(examsQ);
      const totalExams = examsSnap.size;

      // Query submissions for this teacher
      const sheetsQ = query(
        collection(db, 'submissions'),
        where('teacherId', '==', teacherUid)
      );
      const sheetsSnap = await getDocs(sheetsQ);
      const answerSheetsUploaded = sheetsSnap.size;

      let pendingReviews = 0;
      let processed = 0;
      let waitingReview = 0;
      let approved = 0;

      sheetsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'completed' || data.status === 'approved') {
          approved++;
        } else if (data.status === 'pending_review') {
          waitingReview++;
          pendingReviews++;
        } else if (data.status === 'processing') {
          processed++;
          pendingReviews++;
        }
      });

      const completionRate =
        answerSheetsUploaded > 0
          ? Math.round((approved / answerSheetsUploaded) * 100)
          : 0;

      return {
        totalExams,
        totalAnswerSheetsUploaded,
        pendingReviews,
        approvedEvaluations: approved,
        progress: {
          totalUploaded: answerSheetsUploaded,
          processed,
          waitingReview,
          approved,
          completionRate,
        },
      };
    } catch (err) {
      console.warn('[SmartEval] Firestore stats fetch note:', err.message);
    }
  }

  // 2. LOCAL PERSISTENT FALLBACK
  const localExams = getLocalExams().filter((e) => e.teacherId === teacherUid);
  const totalExams = localExams.length;

  let answerSheetsUploaded = 0;
  let approved = 0;
  let waitingReview = 0;
  let processed = 0;

  localExams.forEach((exam) => {
    const sheets = Number(exam.uploadedSheets || 0);
    answerSheetsUploaded += sheets;
    if (exam.status === 'Completed') {
      approved += sheets;
    } else if (exam.status === 'Pending Review') {
      waitingReview += sheets;
    } else if (exam.status === 'Processing') {
      processed += sheets;
    }
  });

  const pendingReviews = waitingReview + processed;
  const completionRate =
    answerSheetsUploaded > 0
      ? Math.round((approved / answerSheetsUploaded) * 100)
      : 0;

  return {
    totalExams,
    totalAnswerSheetsUploaded: answerSheetsUploaded,
    pendingReviews,
    approvedEvaluations: approved,
    progress: {
      totalUploaded: answerSheetsUploaded,
      processed,
      waitingReview,
      approved,
      completionRate,
    },
  };
};

/**
 * Fetch list of exams created by this teacher.
 * @param {string} teacherUid
 */
export const fetchTeacherExams = async (teacherUid) => {
  if (!teacherUid) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'exams'),
        where('teacherId', '==', teacherUid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.warn(
        '[SmartEval] Firestore exams fetch note (falling back without index or local):',
        err.message
      );
      try {
        const simpleQ = query(
          collection(db, 'exams'),
          where('teacherId', '==', teacherUid)
        );
        const snap = await getDocs(simpleQ);
        const list = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        return list.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      } catch (innerErr) {
        console.error('[SmartEval] Firestore exams query error:', innerErr);
      }
    }
  }

  // Local fallback
  const localExams = getLocalExams();
  return localExams
    .filter((e) => e.teacherId === teacherUid)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/**
 * Fetch a single exam by ID.
 * @param {string} examId
 * @param {string} teacherUid
 */
export const fetchExamById = async (examId, teacherUid) => {
  if (!examId || !teacherUid) return null;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'exams', examId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.teacherId === teacherUid) {
          return { id: docSnap.id, ...data };
        }
      }
      return null;
    } catch (err) {
      console.warn('[SmartEval] Firestore get exam error:', err.message);
    }
  }

  const local = getLocalExams().find(
    (e) => e.id === examId && e.teacherId === teacherUid
  );
  return local || null;
};

/**
 * Create a new exam document in Firestore.
 */
export const createExamRecord = async ({
  teacherId,
  teacherName,
  title,
  subject,
  examCode,
  examDate,
  totalQuestions,
  maxMarks,
  status = 'Draft',
  description = '',
}) => {
  const newExamData = {
    teacherId,
    teacherName: teacherName || 'Teacher',
    title: title.trim(),
    subject: subject.trim(),
    examCode: examCode.trim().toUpperCase(),
    examDate: examDate || new Date().toISOString().split('T')[0],
    totalQuestions: Number(totalQuestions) || 1,
    maxMarks: Number(maxMarks) || 100,
    uploadedSheets: 0,
    status, // 'Draft', 'Ready for Upload', 'Archived'
    description: description.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'exams'), {
        ...newExamData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await logActivityRecord({
        actorUid: teacherId,
        actorName: teacherName,
        action: 'exam_created',
        entityId: docRef.id,
        entityType: 'exam',
        title: `Exam Created: ${title}`,
        description: `Subject: ${subject} (${examCode}) with ${totalQuestions} questions, max ${maxMarks} marks. Status: ${status}`,
      });

      return {
        success: true,
        id: docRef.id,
        exam: { id: docRef.id, ...newExamData },
      };
    } catch (err) {
      console.warn(
        '[SmartEval] Firestore exam creation error, falling back locally:',
        err.message
      );
    }
  }

  // Local fallback
  const localExams = getLocalExams();
  const id = 'exam_' + Math.random().toString(36).substring(2, 9);
  const exam = { id, ...newExamData };
  localExams.unshift(exam);
  saveLocalExams(localExams);

  // Log local activity
  await logActivityRecord({
    actorUid: teacherId,
    actorName: teacherName,
    action: 'exam_created',
    entityId: id,
    entityType: 'exam',
    title: `Exam Created: ${title}`,
    description: `Subject: ${subject} (${examCode}) with ${totalQuestions} questions, max ${maxMarks} marks. Status: ${status}`,
  });

  return { success: true, id, exam };
};

/**
 * Update an existing examination.
 * @param {Object} params
 */
export const updateExamRecord = async ({
  examId,
  teacherId,
  teacherName,
  updates,
}) => {
  if (!examId || !teacherId) {
    throw new Error('Exam ID and Teacher UID are required.');
  }

  const sanitizedUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (sanitizedUpdates.title) sanitizedUpdates.title = sanitizedUpdates.title.trim();
  if (sanitizedUpdates.subject) sanitizedUpdates.subject = sanitizedUpdates.subject.trim();
  if (sanitizedUpdates.examCode) sanitizedUpdates.examCode = sanitizedUpdates.examCode.trim().toUpperCase();
  if (sanitizedUpdates.totalQuestions) sanitizedUpdates.totalQuestions = Number(sanitizedUpdates.totalQuestions);
  if (sanitizedUpdates.maxMarks) sanitizedUpdates.maxMarks = Number(sanitizedUpdates.maxMarks);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'exams', examId);
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
      });

      await logActivityRecord({
        actorUid: teacherId,
        actorName: teacherName || 'Teacher',
        action: 'exam_updated',
        entityId: examId,
        entityType: 'exam',
        title: `Exam Updated: ${sanitizedUpdates.title || 'Exam details'}`,
        description: `Updated examination configurations and rubrics.`,
      });

      return { success: true, id: examId };
    } catch (err) {
      console.warn('[SmartEval] Firestore exam update error, trying local fallback:', err.message);
    }
  }

  // Local fallback
  const localExams = getLocalExams();
  const idx = localExams.findIndex((e) => e.id === examId && e.teacherId === teacherId);
  if (idx !== -1) {
    localExams[idx] = { ...localExams[idx], ...sanitizedUpdates };
    saveLocalExams(localExams);

    await logActivityRecord({
      actorUid: teacherId,
      actorName: teacherName || 'Teacher',
      action: 'exam_updated',
      entityId: examId,
      entityType: 'exam',
      title: `Exam Updated: ${sanitizedUpdates.title || 'Exam details'}`,
      description: `Updated examination configurations and rubrics.`,
    });

    return { success: true, id: examId };
  }

  throw new Error('Examination not found or unauthorized.');
};

/**
 * Delete a draft exam.
 * Only draft exams can be deleted. Active or published exams must be archived.
 * @param {string} examId
 * @param {string} teacherId
 * @param {string} teacherName
 */
export const deleteDraftExam = async (examId, teacherId, teacherName = 'Teacher') => {
  if (!examId || !teacherId) {
    throw new Error('Exam ID and Teacher UID are required.');
  }

  // 1. Check exam ownership and draft status first
  const exam = await fetchExamById(examId, teacherId);
  if (!exam) {
    throw new Error('Exam not found or you are not authorized to delete it.');
  }

  if (exam.status !== 'Draft') {
    throw new Error('Only draft examinations can be deleted. Published or active exams should be archived instead.');
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'exams', examId);
      await deleteDoc(docRef);

      await logActivityRecord({
        actorUid: teacherId,
        actorName,
        action: 'exam_deleted',
        entityId: examId,
        entityType: 'exam',
        title: `Draft Exam Deleted: ${exam.title}`,
        description: `Draft assessment removed from workspace.`,
      });

      return { success: true };
    } catch (err) {
      console.warn('[SmartEval] Firestore exam delete error, trying local fallback:', err.message);
    }
  }

  // Local fallback
  const localExams = getLocalExams();
  const filtered = localExams.filter((e) => !(e.id === examId && e.teacherId === teacherId));
  saveLocalExams(filtered);

  await logActivityRecord({
    actorUid: teacherId,
    actorName: teacherName,
    action: 'exam_deleted',
    entityId: examId,
    entityType: 'exam',
    title: `Draft Exam Deleted: ${exam.title}`,
    description: `Draft assessment removed from workspace.`,
  });

  return { success: true };
};

/**
 * Change exam status: 'Draft' | 'Ready for Upload' | 'Archived'.
 * @param {string} examId
 * @param {string} teacherId
 * @param {string} newStatus
 * @param {string} teacherName
 */
export const changeExamStatus = async (examId, teacherId, newStatus, teacherName = 'Teacher') => {
  const validStatuses = ['Draft', 'Ready for Upload', 'Archived'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const exam = await fetchExamById(examId, teacherId);
  if (!exam) {
    throw new Error('Exam not found or unauthorized.');
  }

  // Validation rule: Publishing as Ready for Upload requires title, subject, code, and questions
  if (newStatus === 'Ready for Upload') {
    if (!exam.title || !exam.subject || !exam.examCode || !exam.totalQuestions || !exam.maxMarks) {
      throw new Error('Cannot publish to Ready for Upload. Ensure Title, Subject, Code, Questions, and Max Marks are all specified.');
    }
  }

  return updateExamRecord({
    examId,
    teacherId,
    teacherName,
    updates: {
      status: newStatus,
    },
  });
};

/**
 * Log a meaningful activity event in Firestore.
 * Schema adheres to:
 * - activityId
 * - actorUid
 * - actorName
 * - action
 * - entityId
 * - entityType
 * - title
 * - description
 * - createdAt
 */
export const logActivityRecord = async ({
  actorUid,
  actorName = 'Teacher',
  action,
  entityId = null,
  entityType = 'exam',
  title,
  description,
}) => {
  const activityData = {
    teacherId: actorUid, // preserved for backward-compatibility query
    actorUid,
    actorName,
    action,
    type: action, // alias for existing UI
    entityId,
    entityType,
    title,
    description,
    timestamp: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        createdAt: serverTimestamp(),
      });
      return;
    } catch (err) {
      console.warn('[SmartEval] Activity log error:', err.message);
    }
  }

  const localActivities = getLocalActivities();
  localActivities.unshift({
    id: 'act_' + Math.random().toString(36).substring(2, 9),
    ...activityData,
    createdAt: new Date().toISOString(),
  });
  if (localActivities.length > 50) localActivities.pop();
  saveLocalActivities(localActivities);
};

/**
 * Fetch recent activities for this teacher.
 */
export const fetchRecentActivities = async (teacherUid) => {
  if (!teacherUid) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'activities'),
        where('teacherId', '==', teacherUid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch {
      try {
        const simpleQ = query(
          collection(db, 'activities'),
          where('teacherId', '==', teacherUid),
          limit(10)
        );
        const snap = await getDocs(simpleQ);
        const list = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        return list.sort(
          (a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0)
        );
      } catch (innerErr) {
        console.warn('[SmartEval] Firestore activities query note:', innerErr.message);
      }
    }
  }

  const localActivities = getLocalActivities();
  return localActivities
    .filter((a) => a.teacherId === teacherUid || a.actorUid === teacherUid)
    .sort(
      (a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0)
    )
    .slice(0, 10);
};

/**
 * Fetch real notifications for this user from Firestore.
 * @param {string} userUid
 */
export const fetchNotifications = async (userUid) => {
  if (!userUid) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('targetUid', '==', userUid),
        limit(20)
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.warn('[SmartEval] Firestore notifications note:', err.message);
    }
  }

  const local = getLocalNotifications();
  return local.filter((n) => n.targetUid === userUid);
};

export default {
  fetchTeacherStats,
  fetchTeacherExams,
  fetchExamById,
  createExamRecord,
  updateExamRecord,
  deleteDraftExam,
  changeExamStatus,
  fetchRecentActivities,
  logActivityRecord,
  fetchNotifications,
};
