import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Calendar,
  BookOpen,
  Hash,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import TeacherLayout from '../../components/dashboard/TeacherLayout';
import { useAuth } from '../../context/useAuth';
import { createExamRecord } from '../../services/dashboardService';

const DEFAULT_EXAM_DATE = new Date().toISOString().split('T')[0];

export const CreateExam = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    examCode: '',
    examDate: DEFAULT_EXAM_DATE,
    totalQuestions: '10',
    maxMarks: '100',
    status: 'Draft',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Exam title is required';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.examCode.trim()) errs.examCode = 'Exam code is required (e.g. CS-201)';
    if (!formData.examDate) errs.examDate = 'Exam date is required';
    if (!formData.totalQuestions || Number(formData.totalQuestions) <= 0) {
      errs.totalQuestions = 'Must have at least 1 question';
    }
    if (!formData.maxMarks || Number(formData.maxMarks) <= 0) {
      errs.maxMarks = 'Maximum marks must be greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFeedback(null);

    const teacherUid = currentUser?.uid || userProfile?.uid;
    const teacherName = userProfile?.fullName || currentUser?.displayName || 'Teacher';

    try {
      const res = await createExamRecord({
        teacherId: teacherUid,
        teacherName,
        title: formData.title,
        subject: formData.subject,
        examCode: formData.examCode,
        examDate: formData.examDate,
        totalQuestions: formData.totalQuestions,
        maxMarks: formData.maxMarks,
        status: formData.status,
        description: formData.description,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Exam "${formData.title}" created successfully in Firestore!`,
        });

        setTimeout(() => {
          navigate('/teacher/dashboard');
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: 'Failed to save exam to Firestore. Please try again.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while creating the exam.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/teacher/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs text-slate-400 font-medium">Phase 3: Academic Evaluation Set</span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Create New Examination</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the exam structure, subject rubrics, and maximum evaluation criteria.
              </p>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Exam Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Midterm Examination: Data Structures & Algorithms"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Subject and Exam Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject / Discipline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g. Computer Science"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course / Exam Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="examCode"
                    placeholder="e.g. CS-204"
                    value={formData.examCode}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 uppercase"
                  />
                </div>
                {errors.examCode && <p className="text-xs text-red-600 mt-1">{errors.examCode}</p>}
              </div>
            </div>

            {/* Exam Date, Questions, Max Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exam Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                {errors.examDate && <p className="text-xs text-red-600 mt-1">{errors.examDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Questions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  min="1"
                  max="100"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                {errors.totalQuestions && <p className="text-xs text-red-600 mt-1">{errors.totalQuestions}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Max Marks <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="maxMarks"
                    min="1"
                    max="1000"
                    value={formData.maxMarks}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                {errors.maxMarks && <p className="text-xs text-red-600 mt-1">{errors.maxMarks}</p>}
              </div>
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Evaluation Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="Ready for Upload">Ready for Upload (Active)</option>
                <option value="Draft">Draft (Save for Later)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Instructions / Rubric Guidelines (Optional)
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Add special instructions, question breakdown, or keywords for AI evaluation rubrics..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{loading ? 'Saving to Firestore...' : 'Create Examination'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateExam;
