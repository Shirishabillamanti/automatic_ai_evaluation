import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckSquare,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import ScriptViewerPane from '../../components/evaluation/ScriptViewerPane';
import AiScoringPane from '../../components/evaluation/AiScoringPane';
import EvaluationQueueSidebar from '../../components/evaluation/EvaluationQueueSidebar';
import { useAuth } from '../../context/useAuth';
import { fetchTeacherExams } from '../../services/dashboardService';
import { fetchTeacherSubmissions, ingestAnswerSheet } from '../../services/submissionService';
import { generateAiEvaluation, saveAndPublishEvaluation } from '../../services/evaluationService';

export const EvaluationReview = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetExamParam = searchParams.get('examId');

  // Core data states
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [activeEvaluation, setActiveEvaluation] = useState(null);

  // Loading & operation states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const teacherUid = currentUser?.uid;
  const teacherName = userProfile?.fullName || currentUser?.displayName || 'Faculty Evaluator';

  // Refresh helper
  const refreshData = useCallback(async () => {
    if (!teacherUid) return;
    setLoading(true);
    try {
      const [examsList, subsList] = await Promise.all([
        fetchTeacherExams(teacherUid),
        fetchTeacherSubmissions({ teacherUid }),
      ]);
      setExams(examsList);
      setSubmissions(subsList);

      let currentExamId = selectedExamId;
      if (targetExamParam && examsList.some((e) => e.id === targetExamParam)) {
        currentExamId = targetExamParam;
      } else if (!currentExamId && examsList.length > 0) {
        currentExamId = examsList[0].id;
      }
      setSelectedExamId(currentExamId);

      const examSubs = subsList.filter((s) => s.examId === currentExamId);
      if (examSubs.length > 0) {
        const first = examSubs[0];
        setSelectedSubmissionId(first.id);
        const exam = examsList.find((e) => e.id === currentExamId) || {
          id: currentExamId,
          title: first.examTitle,
          subject: first.examCode || 'Course',
          totalQuestions: 5,
          maxMarks: 100,
        };
        const generated = first.evaluation || generateAiEvaluation({ submission: first, exam });
        setActiveEvaluation(generated);
      }
    } catch (err) {
      console.error('[SmartEval] Error loading evaluation data:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherUid, targetExamParam, selectedExamId]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!teacherUid) return;
      try {
        const [examsList, subsList] = await Promise.all([
          fetchTeacherExams(teacherUid),
          fetchTeacherSubmissions({ teacherUid }),
        ]);
        if (isMounted) {
          setExams(examsList);
          setSubmissions(subsList);

          let currentExamId = '';
          if (targetExamParam && examsList.some((e) => e.id === targetExamParam)) {
            currentExamId = targetExamParam;
          } else if (examsList.length > 0) {
            currentExamId = examsList[0].id;
          }
          setSelectedExamId(currentExamId);

          const examSubs = subsList.filter((s) => s.examId === currentExamId);
          if (examSubs.length > 0) {
            const first = examSubs[0];
            setSelectedSubmissionId(first.id);
            const exam = examsList.find((e) => e.id === currentExamId) || {
              id: currentExamId,
              title: first.examTitle,
              subject: first.examCode || 'Course',
              totalQuestions: 5,
              maxMarks: 100,
            };
            const generated = first.evaluation || generateAiEvaluation({ submission: first, exam });
            setActiveEvaluation(generated);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[SmartEval] Init evaluation error:', err);
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [teacherUid, targetExamParam]);

  // Active exam object
  const activeExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // Submissions filtered by the chosen exam
  const examSubmissions = useMemo(() => {
    if (!selectedExamId) return submissions;
    return submissions.filter((s) => s.examId === selectedExamId);
  }, [submissions, selectedExamId]);

  // Active selected submission
  const activeSubmission = useMemo(() => {
    return submissions.find((s) => s.id === selectedSubmissionId) || null;
  }, [submissions, selectedSubmissionId]);

  // Show banner alert
  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Switch Exam
  const handleExamChange = (newExamId) => {
    setSelectedExamId(newExamId);
    const examSubs = submissions.filter((s) => s.examId === newExamId);
    if (examSubs.length > 0) {
      const first = examSubs[0];
      setSelectedSubmissionId(first.id);
      const exam = exams.find((e) => e.id === newExamId) || {
        id: newExamId,
        title: first.examTitle,
        subject: first.examCode,
        totalQuestions: 5,
        maxMarks: 100,
      };
      setActiveEvaluation(first.evaluation || generateAiEvaluation({ submission: first, exam }));
    } else {
      setSelectedSubmissionId('');
      setActiveEvaluation(null);
    }
  };

  // Switch Submission from Queue
  const handleSelectSubmission = (sub) => {
    setSelectedSubmissionId(sub.id);
    const exam = activeExam || {
      id: sub.examId,
      title: sub.examTitle,
      subject: sub.examCode,
      totalQuestions: 5,
      maxMarks: 100,
    };
    const evalData = sub.evaluation || generateAiEvaluation({ submission: sub, exam });
    setActiveEvaluation(evalData);
  };

  // Update a question score
  const handleUpdateQuestionScore = (questionIndex, newScore) => {
    setActiveEvaluation((prev) => {
      if (!prev) return null;
      const nextQuestions = [...prev.questions];
      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        teacherScore: Number(newScore),
      };
      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  // Update overall teacher feedback
  const handleUpdateOverallFeedback = (feedbackText) => {
    setActiveEvaluation((prev) => (prev ? { ...prev, overallTeacherFeedback: feedbackText } : null));
  };

  // Save Evaluation & Publish to Student Portal
  const handleSaveEvaluation = async (publishToPortal = false) => {
    if (!activeSubmission || !activeEvaluation) return;

    setSaving(true);
    try {
      const res = await saveAndPublishEvaluation({
        teacherUid,
        teacherName,
        submissionId: activeSubmission.id,
        examId: activeSubmission.examId,
        evaluationData: activeEvaluation,
        publishToPortal,
      });

      if (publishToPortal) {
        showNotice(
          'success',
          `Evaluation approved & published to Student Portal! (${activeSubmission.rollNumber} scored ${res.finalScore}/${activeEvaluation.maxMarks}).`
        );
      } else {
        showNotice(
          'success',
          `Teacher moderated evaluation saved successfully (${activeSubmission.rollNumber}: ${res.finalScore} Marks).`
        );
      }

      await refreshData();
    } catch (err) {
      console.error('[SmartEval] Save evaluation error:', err);
      showNotice('error', err.message || 'Failed to save evaluation.');
    } finally {
      setSaving(false);
    }
  };

  // Demo answer sheet seeder if user wants to test right away
  const handleCreateDemoAnswerSheet = async () => {
    if (!activeExam) return;
    try {
      setLoading(true);
      await ingestAnswerSheet({
        teacherId: teacherUid,
        teacherName,
        examId: activeExam.id,
        examTitle: activeExam.title,
        examCode: activeExam.examCode || activeExam.subject,
        studentName: 'Alex Morgan',
        rollNumber: 'CS2026-042',
        studentUid: 'demo_student_01',
        pages: [
          { pageNumber: 1, fileName: 'script_p1.png', rotation: 0, contrastEnhanced: false },
          { pageNumber: 2, fileName: 'script_p2.png', rotation: 0, contrastEnhanced: false },
        ],
        fileMetadata: { fileName: 'CS2026_042_Alex_Morgan_Final.pdf', fileSize: '2.4 MB' },
        notes: 'Handwritten test paper submitted.',
      });
      showNotice('success', 'Generated sample student script (CS2026-042 Alex Morgan) for instant evaluation!');
      await refreshData();
    } catch (err) {
      showNotice('error', err.message || 'Could not seed demo script.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Phase 6 Active
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Evaluation & Moderation Suite
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side handwritten script inspection, OCR transcription, rubric semantic scoring, and student portal publishing.
            </p>
          </div>

          {/* Exam Selector & Sync */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={selectedExamId}
                onChange={(e) => handleExamChange(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.examCode || ex.subject})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => navigate('/teacher/answer-sheets')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload More Scripts</span>
            </button>
          </div>
        </div>

        {/* Transient Notice Banner */}
        {notification && (
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-medium animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Main 3-Column Evaluation Workspace */}
        {examSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CheckSquare className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                No Answer Scripts Uploaded for This Exam
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Before grading, upload student answer sheets in the Ingestion Engine, or generate a sample script right now to experience the AI evaluation pipeline.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateDemoAnswerSheet}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Seed Sample Answer Script (CS2026-042)</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/answer-sheets')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Go to Answer Sheet Upload</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Queue: 3 Cols */}
            <div className="lg:col-span-3">
              <EvaluationQueueSidebar
                submissions={examSubmissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={handleSelectSubmission}
                loading={loading}
              />
            </div>

            {/* Center Script Viewer: 4 Cols */}
            <div className="lg:col-span-4">
              <ScriptViewerPane submission={activeSubmission} />
            </div>

            {/* Right AI Scoring & Rubric Moderation: 5 Cols */}
            <div className="lg:col-span-5">
              <AiScoringPane
                evaluation={activeEvaluation}
                onUpdateQuestionScore={handleUpdateQuestionScore}
                onUpdateOverallFeedback={handleUpdateOverallFeedback}
                onSaveEvaluation={handleSaveEvaluation}
                saving={saving}
              />
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default EvaluationReview;
