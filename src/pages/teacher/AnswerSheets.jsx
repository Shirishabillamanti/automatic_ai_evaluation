import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import ExamSelector from '../../components/teacher/ExamSelector';
import DropzoneUploader from '../../components/teacher/DropzoneUploader';
import MultiPageStagingList from '../../components/teacher/MultiPageStagingList';
import SubmissionsTable from '../../components/teacher/SubmissionsTable';
import ScriptInspectionModal from '../../components/teacher/ScriptInspectionModal';
import { useAuth } from '../../context/useAuth';
import { fetchTeacherExams } from '../../services/dashboardService';
import {
  fetchTeacherSubmissions,
  fetchRegisteredStudents,
  parseRollAndNameFromFilename,
  fileToPreviewUrl,
  ingestAnswerSheetsBatch,
  deleteSubmission,
} from '../../services/submissionService';

export const AnswerSheets = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetExamParam = searchParams.get('examId');

  // Active Tab: 'upload' | 'repository'
  const [activeTab, setActiveTab] = useState('upload');

  // Data states
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Staging states
  const [stagedBooklets, setStagedBooklets] = useState([]);
  const [ingesting, setIngesting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal inspection state
  const [inspectingSubmission, setInspectingSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teacherUid = currentUser?.uid;
  const teacherName = userProfile?.fullName || currentUser?.displayName || 'Faculty Evaluator';

  // Refresh helper
  const refreshData = useCallback(async () => {
    if (!teacherUid) return;
    setLoadingSubmissions(true);
    try {
      const [examsList, studentsList, subsList] = await Promise.all([
        fetchTeacherExams(teacherUid),
        fetchRegisteredStudents(),
        fetchTeacherSubmissions({ teacherUid }),
      ]);
      setExams(examsList);
      setRegisteredStudents(studentsList);
      setSubmissions(subsList);
      if (examsList.length > 0) {
        setSelectedExamId((prev) => prev || examsList[0].id);
      }
    } catch (err) {
      console.error('[SmartEval] Refresh error:', err);
    } finally {
      setLoadingSubmissions(false);
      setLoadingExams(false);
    }
  }, [teacherUid]);

  useEffect(() => {
    let isSubscribed = true;

    const initData = async () => {
      if (!teacherUid) return;
      try {
        const [examsList, studentsList, subsList] = await Promise.all([
          fetchTeacherExams(teacherUid),
          fetchRegisteredStudents(),
          fetchTeacherSubmissions({ teacherUid }),
        ]);
        if (isSubscribed) {
          setExams(examsList);
          setRegisteredStudents(studentsList);
          setSubmissions(subsList);
          if (targetExamParam && examsList.some((e) => e.id === targetExamParam)) {
            setSelectedExamId(targetExamParam);
          } else if (examsList.length > 0) {
            setSelectedExamId((prev) => prev || examsList[0].id);
          }
          setLoadingExams(false);
          setLoadingSubmissions(false);
        }
      } catch (err) {
        console.error('[SmartEval] Error initializing answer sheets data:', err);
        if (isSubscribed) {
          setLoadingExams(false);
          setLoadingSubmissions(false);
        }
      }
    };

    initData();
    return () => {
      isSubscribed = false;
    };
  }, [teacherUid, targetExamParam]);

  // Show transient banner
  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Handle files selected in dropzone
  const handleFilesSelected = async (files) => {
    const newBooklets = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { rollNumber, studentName } = parseRollAndNameFromFilename(file.name);
      const previewUrl = await fileToPreviewUrl(file);

      // Try matching registered student
      let matchedUid = '';
      let resolvedName = studentName;
      if (rollNumber) {
        const student = registeredStudents.find(
          (s) =>
            (s.rollNumber && s.rollNumber.toUpperCase() === rollNumber.toUpperCase()) ||
            (s.username && s.username.toUpperCase() === rollNumber.toUpperCase())
        );
        if (student) {
          matchedUid = student.uid;
          resolvedName = resolvedName || student.fullName;
        }
      }

      newBooklets.push({
        id: 'staged_' + Math.random().toString(36).substring(2, 9),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        rollNumber: rollNumber || '',
        studentName: resolvedName || 'Student ' + (stagedBooklets.length + i + 1),
        studentUid: matchedUid,
        pages: [
          {
            pageNumber: 1,
            fileName: file.name,
            fileSize: file.size,
            previewUrl,
            rotation: 0,
            contrastEnhanced: false,
          },
        ],
        fileRef: file,
      });
    }

    setStagedBooklets((prev) => [...prev, ...newBooklets]);
    showNotice('success', `Added ${files.length} answer file(s) to pre-flight staging. Check roll numbers below.`);
  };

  // Update staged booklet fields
  const handleUpdateBooklet = (index, updates) => {
    setStagedBooklets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Remove booklet from staging
  const handleRemoveBooklet = (index) => {
    setStagedBooklets((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Rotate a page in staging
  const handleRotatePage = (bIndex, pIndex) => {
    setStagedBooklets((prev) => {
      const next = [...prev];
      const booklet = { ...next[bIndex] };
      const pages = [...booklet.pages];
      pages[pIndex] = {
        ...pages[pIndex],
        rotation: ((pages[pIndex].rotation || 0) + 90) % 360,
      };
      booklet.pages = pages;
      next[bIndex] = booklet;
      return next;
    });
  };

  // Toggle contrast enhancement
  const handleToggleContrast = (bIndex, pIndex) => {
    setStagedBooklets((prev) => {
      const next = [...prev];
      const booklet = { ...next[bIndex] };
      const pages = [...booklet.pages];
      pages[pIndex] = {
        ...pages[pIndex],
        contrastEnhanced: !pages[pIndex].contrastEnhanced,
      };
      booklet.pages = pages;
      next[bIndex] = booklet;
      return next;
    });
  };

  // Ingest all staged booklets
  const handleIngestAll = async () => {
    if (!selectedExamId) {
      showNotice('error', 'Please select a target examination first.');
      return;
    }
    const targetExam = exams.find((e) => e.id === selectedExamId);
    if (!targetExam) {
      showNotice('error', 'Selected examination record not found.');
      return;
    }

    setIngesting(true);
    try {
      const res = await ingestAnswerSheetsBatch({
        teacherId: teacherUid,
        teacherName,
        examId: targetExam.id,
        examTitle: targetExam.title,
        examCode: targetExam.examCode || targetExam.subject,
        booklets: stagedBooklets,
      });

      showNotice(
        'success',
        `Successfully ingested ${res.count} student answer booklets! They are now ready for AI OCR evaluation.`
      );
      setStagedBooklets([]);
      await refreshData();
      setActiveTab('repository');
    } catch (err) {
      console.error('[SmartEval] Ingestion error:', err);
      showNotice('error', err.message || 'Failed to ingest answer sheets.');
    } finally {
      setIngesting(false);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Are you sure you want to permanently delete this answer sheet submission?')) {
      return;
    }
    try {
      await deleteSubmission(submissionId, teacherUid, teacherName);
      showNotice('success', 'Answer sheet submission deleted.');
      await refreshData();
    } catch (err) {
      showNotice('error', err.message || 'Failed to delete submission.');
    }
  };

  // Inspect submission
  const handleInspect = (sub) => {
    setInspectingSubmission(sub);
    setIsModalOpen(true);
  };

  // Calculate quick stats
  const totalSubmissions = submissions.length;
  const pendingReviews = submissions.filter((s) => s.status === 'pending_review' || s.status === 'processing').length;
  const totalExamsActive = exams.length;

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Phase 5 Active
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Answer Sheets Ingestion Engine
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-page scan upload, student roll number auto-detection, pre-flight deskew validation, and OCR staging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => navigate('/teacher/evaluation')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go to AI Evaluation</span>
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

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ingested</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalSubmissions}</p>
            <span className="text-[10px] text-slate-400">Student booklets in database</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ready for OCR Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingReviews}</p>
            <span className="text-[10px] text-amber-600/80">Pending AI scoring pipeline</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Exams</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalExamsActive}</p>
            <span className="text-[10px] text-blue-600/80">Configured with rubrics</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingestion Pipeline</p>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Preflight Active</span>
            </div>
            <span className="text-[10px] text-slate-400">Deskew & 300 DPI check</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload & Ingest Scripts</span>
            {stagedBooklets.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-700 text-[10px] font-bold">
                {stagedBooklets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repository')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'repository'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Submissions Repository ({totalSubmissions})</span>
          </button>
        </div>

        {/* Tab 1: Upload & Ingest Workflow */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Step 1: Target Exam Selection */}
            <ExamSelector
              exams={exams}
              selectedExamId={selectedExamId}
              onSelectExam={setSelectedExamId}
              loading={loadingExams}
            />

            {/* Step 2: Dropzone Uploader */}
            <DropzoneUploader
              onFilesSelected={handleFilesSelected}
              disabled={!selectedExamId || exams.length === 0}
            />

            {/* Step 3: Pre-Flight Staging & Roll Mapping */}
            <MultiPageStagingList
              stagedBooklets={stagedBooklets}
              registeredStudents={registeredStudents}
              onUpdateBooklet={handleUpdateBooklet}
              onRemoveBooklet={handleRemoveBooklet}
              onRotatePage={handleRotatePage}
              onToggleContrast={handleToggleContrast}
              onIngestAll={handleIngestAll}
              onClearAll={() => setStagedBooklets([])}
              ingesting={ingesting}
            />
          </div>
        )}

        {/* Tab 2: Submissions Repository */}
        {activeTab === 'repository' && (
          <div className="space-y-4">
            <SubmissionsTable
              submissions={submissions}
              exams={exams}
              loading={loadingSubmissions}
              onInspectSubmission={handleInspect}
              onDeleteSubmission={handleDeleteSubmission}
            />
          </div>
        )}

        {/* Script Inspection Modal */}
        <ScriptInspectionModal
          submission={inspectingSubmission}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setInspectingSubmission(null);
          }}
        />
      </div>
    </TeacherLayout>
  );
};

export default AnswerSheets;
