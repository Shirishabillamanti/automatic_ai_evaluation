import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

const LOCAL_RESULTS_KEY = 'smarteval_results_db';

export const getLocalResults = () => {
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalResults = (results) => {
  try {
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
  } catch (err) {
    console.error('[SmartEval] Local results storage error:', err);
  }
};

/**
 * Fetch published examination results for the authenticated student.
 * Only returns records where status == 'published'.
 * @param {string} studentUid
 */
export const fetchStudentResults = async (studentUid) => {
  if (!studentUid) return [];

  // 1. LIVE FIRESTORE MODE
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'results'),
        where('studentUid', '==', studentUid),
        where('status', '==', 'published')
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      return list.sort((a, b) => new Date(b.examDate || 0) - new Date(a.examDate || 0));
    } catch (err) {
      console.warn('[SmartEval] Firestore student results fetch note:', err.message);
    }
  }

  // 2. LOCAL PERSISTENT FALLBACK
  const localResults = getLocalResults();
  return localResults
    .filter((r) => r.studentUid === studentUid && r.status === 'published')
    .sort((a, b) => new Date(b.examDate || 0) - new Date(a.examDate || 0));
};

/**
 * Compute student dashboard statistics based exclusively on approved/published results.
 * @param {string} studentUid
 */
export const fetchStudentStats = async (studentUid) => {
  const defaultStats = {
    totalPublishedResults: 0,
    totalMarksObtained: 0,
    totalMaxMarks: 0,
    averagePercentage: 0,
    examsCompleted: 0,
    highestPercentage: 0,
  };

  if (!studentUid) return defaultStats;

  const results = await fetchStudentResults(studentUid);

  if (results.length === 0) {
    return defaultStats;
  }

  let totalObtained = 0;
  let totalMax = 0;
  let percentageSum = 0;
  let highest = 0;

  results.forEach((res) => {
    const obtained = Number(res.obtainedMarks) || 0;
    const max = Number(res.maximumMarks) || 100;
    const pct = Number(res.percentage) || Math.round((obtained / max) * 100);

    totalObtained += obtained;
    totalMax += max;
    percentageSum += pct;
    if (pct > highest) highest = pct;
  });

  const averagePercentage = Math.round(percentageSum / results.length);

  return {
    totalPublishedResults: results.length,
    totalMarksObtained: totalObtained,
    totalMaxMarks: totalMax,
    averagePercentage,
    examsCompleted: results.length,
    highestPercentage: highest,
  };
};

/**
 * Fetch a specific result's details ensuring student UID ownership.
 * @param {string} resultId
 * @param {string} studentUid
 */
export const fetchResultDetails = async (resultId, studentUid) => {
  if (!resultId || !studentUid) return null;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'results', resultId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Prevent student from viewing another student's private result
        if (data.studentUid === studentUid && data.status === 'published') {
          return { id: docSnap.id, ...data };
        }
      }
      return null;
    } catch (err) {
      console.warn('[SmartEval] Firestore result details error:', err.message);
    }
  }

  // Local fallback
  const localResults = getLocalResults();
  const record = localResults.find((r) => r.id === resultId && r.studentUid === studentUid && r.status === 'published');
  return record || null;
};

/**
 * Compute performance breakdown by subject.
 * @param {string} studentUid
 */
export const fetchStudentPerformance = async (studentUid) => {
  const results = await fetchStudentResults(studentUid);
  if (results.length === 0) return { subjects: [], history: [] };

  const subjectMap = {};

  results.forEach((r) => {
    const subj = r.subject || 'General';
    const obtained = Number(r.obtainedMarks) || 0;
    const max = Number(r.maximumMarks) || 100;
    const pct = Number(r.percentage) || Math.round((obtained / max) * 100);

    if (!subjectMap[subj]) {
      subjectMap[subj] = {
        subject: subj,
        count: 0,
        totalPercentage: 0,
        totalObtained: 0,
        totalMax: 0,
      };
    }

    subjectMap[subj].count += 1;
    subjectMap[subj].totalPercentage += pct;
    subjectMap[subj].totalObtained += obtained;
    subjectMap[subj].totalMax += max;
  });

  const subjects = Object.values(subjectMap).map((s) => ({
    subject: s.subject,
    count: s.count,
    averagePercentage: Math.round(s.totalPercentage / s.count),
    totalObtained: s.totalObtained,
    totalMax: s.totalMax,
  }));

  const history = results.map((r) => ({
    id: r.id,
    title: r.examTitle,
    subject: r.subject,
    date: r.examDate,
    percentage: Number(r.percentage) || Math.round((Number(r.obtainedMarks) / Number(r.maximumMarks)) * 100),
    obtained: r.obtainedMarks,
    max: r.maximumMarks,
  }));

  return { subjects, history };
};

export default {
  fetchStudentResults,
  fetchStudentStats,
  fetchResultDetails,
  fetchStudentPerformance,
};
