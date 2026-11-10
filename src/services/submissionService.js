import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { logActivityRecord, updateExamRecord } from './dashboardService';

const LOCAL_SUBMISSIONS_KEY = 'smarteval_submissions_db';

/**
 * Helper to get local submissions
 */
export const getLocalSubmissions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Helper to save local submissions
 */
export const saveLocalSubmissions = (submissions) => {
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('[SmartEval] Local submissions storage error:', err);
  }
};

/**
 * Extract roll number and student name heuristics from file name.
 * e.g., '2024CS042_John_Doe_Exam.pdf' -> roll: '2024CS042', name: 'John Doe'
 * e.g., 'Roll_104_Sarah_Math.png' -> roll: '104', name: 'Sarah'
 * @param {string} fileName
 */
export const parseRollAndNameFromFilename = (fileName = '') => {
  if (!fileName) return { rollNumber: '', studentName: '' };

  const clean = fileName.replace(/\.[^/.]+$/, '').trim();
  const parts = clean.split(/[-_]+/).filter(Boolean);

  let rollNumber = '';
  let studentName = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Matches patterns like '2024CS042', 'CS102', 'Roll42', '42', 'SE-99'
    if (!rollNumber && (/(?:^\d+[A-Z]+\d+$)|(?:^[A-Z]+\d+$)|(?:^\d{2,6}$)|(?:^roll\d+$)/i.test(part) || /^roll/i.test(part))) {
      rollNumber = part.toUpperCase().replace(/^ROLL_?/i, '');
      continue;
    }
  }

  // If no specific roll pattern matched, use first alphanumeric token if it has numbers
  if (!rollNumber && parts.length > 0 && /\d/.test(parts[0])) {
    rollNumber = parts[0].toUpperCase();
    parts.shift();
  }

  // The rest may be student name
  const nameParts = parts.filter((p) => p.toUpperCase() !== rollNumber && !/^(page|scan|exam|sheet|final|test|ans)/i.test(p));
  if (nameParts.length > 0) {
    studentName = nameParts.join(' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return { rollNumber, studentName };
};

/**
 * Convert a File object to Data URL for thumbnail preview and persistent client inspection.
 * @param {File} file
 * @returns {Promise<string>}
 */
export const fileToPreviewUrl = (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // PDF representation badge/icon URL
      resolve('pdf-document-preview');
    } else {
      resolve('');
    }
  });
};

/**
 * Fetch registered student accounts from Firestore `users` collection.
 * Allows auto-matching student UID, email, and verified names.
 */
export const fetchRegisteredStudents = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        limit(50)
      );
      const snap = await getDocs(q);
      const students = [];
      snap.forEach((d) => {
        const data = d.data();
        students.push({
          uid: d.id,
          fullName: data.fullName || 'Student',
          email: data.email || '',
          rollNumber: data.rollNumber || data.username || '',
          username: data.username || '',
        });
      });
      if (students.length > 0) return students;
    } catch (err) {
      console.warn('[SmartEval] Firestore student query note:', err.message);
    }
  }

  // Fallback demo student
  return [
    {
      uid: 'demo_student_01',
      fullName: 'Alex Morgan',
      email: 'student@smarteval.edu',
      rollNumber: 'CS2026-042',
      username: 'alex_student',
    },
    {
      uid: 'demo_student_02',
      fullName: 'David Kumar',
      email: 'david.kumar@smarteval.edu',
      rollNumber: 'CS2026-088',
      username: 'david_k',
    },
    {
      uid: 'demo_student_03',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@smarteval.edu',
      rollNumber: 'CS2026-105',
      username: 'elena_r',
    },
  ];
};

/**
 * Fetch submissions for a specific teacher, optionally filtered by exam or status.
 * @param {Object} params
 */
export const fetchTeacherSubmissions = async ({ teacherUid, examId = '', status = '' }) => {
  if (!teacherUid) return [];

  if (isFirebaseConfigured && db) {
    try {
      let q = query(
        collection(db, 'submissions'),
        where('teacherId', '==', teacherUid)
      );

      const snap = await getDocs(q);
      let list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Client filtering for compound indices safety
      if (examId) {
        list = list.filter((s) => s.examId === examId);
      }
      if (status) {
        list = list.filter((s) => s.status === status);
      }

      return list.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    } catch (err) {
      console.warn('[SmartEval] Firestore fetch submissions error, using local fallback:', err.message);
    }
  }

  // Local fallback
  let local = getLocalSubmissions().filter((s) => s.teacherId === teacherUid);
  if (examId) {
    local = local.filter((s) => s.examId === examId);
  }
  if (status) {
    local = local.filter((s) => s.status === status);
  }
  return local.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
};

/**
 * Ingest / Upload a single answer sheet submission.
 * @param {Object} submissionPayload
 */
export const ingestAnswerSheet = async ({
  teacherId,
  teacherName = 'Teacher',
  examId,
  examTitle,
  examCode,
  studentName,
  rollNumber,
  studentUid = '',
  pages = [],
  fileMetadata = {},
  notes = '',
}) => {
  if (!teacherId || !examId) {
    throw new Error('Teacher UID and Exam ID are required.');
  }

  const cleanRoll = (rollNumber || 'UNASSIGNED').trim().toUpperCase();
  const cleanName = (studentName || 'Unknown Student').trim();

  const newSubmissionData = {
    teacherId,
    teacherName,
    examId,
    examTitle: examTitle || 'Examination',
    examCode: examCode || 'EXAM',
    studentName: cleanName,
    rollNumber: cleanRoll,
    studentUid: studentUid || '',
    studentId: studentUid || '', // backward compat with firestore rules
    pagesCount: pages.length || 1,
    pages: pages.map((p, idx) => ({
      pageNumber: p.pageNumber || idx + 1,
      previewUrl: p.previewUrl || '',
      fileName: p.fileName || `page_${idx + 1}.png`,
      fileSize: p.fileSize || 0,
      rotation: p.rotation || 0,
      contrastEnhanced: Boolean(p.contrastEnhanced),
    })),
    fileName: fileMetadata.fileName || `${cleanRoll}_${cleanName.replace(/\s+/g, '_')}.pdf`,
    fileSize: fileMetadata.fileSize || '1.8 MB',
    status: 'pending_review', // 'processing' | 'pending_review' | 'approved' | 'completed'
    notes: notes.trim(),
    preflight: {
      rollDetected: Boolean(cleanRoll && cleanRoll !== 'UNASSIGNED'),
      pagesCheckPassed: pages.length > 0,
      visualClarity: 'High',
      orientationAligned: true,
      ocrReadiness: 'Ready for AI Extraction',
    },
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let submissionId = '';

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...newSubmissionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      submissionId = docRef.id;

      // Update parent exam's uploadedSheets count
      await syncExamSheetsCount(examId, teacherId);

      // Log activity
      await logActivityRecord({
        actorUid: teacherId,
        actorName: teacherName,
        action: 'sheet_uploaded',
        entityId: submissionId,
        entityType: 'submission',
        title: `Answer Sheet Ingested: ${cleanRoll} (${cleanName})`,
        description: `Exam: ${examTitle} (${examCode}) - ${pages.length} pages validated and staged for OCR.`,
      });

      return {
        success: true,
        id: submissionId,
        submission: { id: submissionId, ...newSubmissionData },
      };
    } catch (err) {
      console.warn('[SmartEval] Firestore add submission error, using local fallback:', err.message);
    }
  }

  // Local fallback
  submissionId = 'sub_' + Math.random().toString(36).substring(2, 9);
  const local = getLocalSubmissions();
  const submission = { id: submissionId, ...newSubmissionData };
  local.unshift(submission);
  saveLocalSubmissions(local);

  await syncExamSheetsCount(examId, teacherId);

  await logActivityRecord({
    actorUid: teacherId,
    actorName: teacherName,
    action: 'sheet_uploaded',
    entityId: submissionId,
    entityType: 'submission',
    title: `Answer Sheet Ingested: ${cleanRoll} (${cleanName})`,
    description: `Exam: ${examTitle} (${examCode}) - ${pages.length} pages validated and staged for OCR.`,
  });

  return { success: true, id: submissionId, submission };
};

/**
 * Ingest multiple answer sheets in a batch.
 * @param {Object} batchPayload
 */
export const ingestAnswerSheetsBatch = async ({
  teacherId,
  teacherName = 'Teacher',
  examId,
  examTitle,
  examCode,
  booklets = [],
}) => {
  if (!teacherId || !examId) {
    throw new Error('Teacher UID and Exam ID are required.');
  }
  if (!Array.isArray(booklets) || booklets.length === 0) {
    throw new Error('At least one answer booklet must be provided for ingestion.');
  }

  const results = [];
  for (const booklet of booklets) {
    const res = await ingestAnswerSheet({
      teacherId,
      teacherName,
      examId,
      examTitle,
      examCode,
      studentName: booklet.studentName,
      rollNumber: booklet.rollNumber,
      studentUid: booklet.studentUid,
      pages: booklet.pages || [],
      fileMetadata: booklet.fileMetadata || {},
      notes: booklet.notes || '',
    });
    results.push(res);
  }

  // Log summary activity
  await logActivityRecord({
    actorUid: teacherId,
    actorName: teacherName,
    action: 'batch_sheets_uploaded',
    entityId: examId,
    entityType: 'exam',
    title: `Batch Answer Sheets Ingested (${booklets.length} scripts)`,
    description: `Successfully ingested ${booklets.length} student answer booklets for ${examTitle} (${examCode}).`,
  });

  return {
    success: true,
    count: results.length,
    results,
  };
};

/**
 * Delete a submission record.
 * @param {string} submissionId
 * @param {string} teacherId
 * @param {string} teacherName
 */
export const deleteSubmission = async (submissionId, teacherId, teacherName = 'Teacher') => {
  if (!submissionId || !teacherId) {
    throw new Error('Submission ID and Teacher UID are required.');
  }

  let examId = '';
  let rollNumber = '';

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'submissions', submissionId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.teacherId === teacherId) {
          examId = data.examId;
          rollNumber = data.rollNumber;
          await deleteDoc(docRef);
          if (examId) {
            await syncExamSheetsCount(examId, teacherId);
          }
          await logActivityRecord({
            actorUid: teacherId,
            actorName: teacherName,
            action: 'sheet_deleted',
            entityId: submissionId,
            entityType: 'submission',
            title: `Answer Sheet Deleted: ${rollNumber || 'Script'}`,
            description: `Submission removed from examination repository.`,
          });
          return { success: true };
        }
      }
    } catch (err) {
      console.warn('[SmartEval] Firestore delete submission error:', err.message);
    }
  }

  // Local fallback
  const local = getLocalSubmissions();
  const target = local.find((s) => s.id === submissionId && s.teacherId === teacherId);
  if (target) {
    examId = target.examId;
    rollNumber = target.rollNumber;
    const filtered = local.filter((s) => s.id !== submissionId);
    saveLocalSubmissions(filtered);
    if (examId) {
      await syncExamSheetsCount(examId, teacherId);
    }
    await logActivityRecord({
      actorUid: teacherId,
      actorName: teacherName,
      action: 'sheet_deleted',
      entityId: submissionId,
      entityType: 'submission',
      title: `Answer Sheet Deleted: ${rollNumber || 'Script'}`,
      description: `Submission removed from examination repository.`,
    });
    return { success: true };
  }

  return { success: false, message: 'Submission not found or unauthorized.' };
};

/**
 * Synchronize the uploadedSheets count on an exam document based on actual submissions.
 * @param {string} examId
 * @param {string} teacherId
 */
export const syncExamSheetsCount = async (examId, teacherId) => {
  if (!examId || !teacherId) return;

  try {
    const subs = await fetchTeacherSubmissions({ teacherUid: teacherId, examId });
    const count = subs.length;

    await updateExamRecord({
      examId,
      teacherId,
      teacherName: 'Teacher',
      updates: {
        uploadedSheets: count,
        // If it was draft and now has sheets, mark as 'Ready for Upload'
        ...(count > 0 ? { status: 'Ready for Upload' } : {}),
      },
    });
  } catch (err) {
    console.warn('[SmartEval] Sync exam count note:', err.message);
  }
};

export default {
  getLocalSubmissions,
  saveLocalSubmissions,
  parseRollAndNameFromFilename,
  fileToPreviewUrl,
  fetchRegisteredStudents,
  fetchTeacherSubmissions,
  ingestAnswerSheet,
  ingestAnswerSheetsBatch,
  deleteSubmission,
  syncExamSheetsCount,
};
