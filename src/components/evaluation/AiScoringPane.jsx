import React from 'react';
import {
  Sparkles,
  Send,
  Save,
  MessageSquare,
  Plus,
  Minus,
} from 'lucide-react';

/**
 * AiScoringPane Component
 * Right panel: AI Handwriting evaluation with question breakdown, rubric alignment,
 * instant teacher score overrides, qualitative feedback, and student portal publishing.
 */
export const AiScoringPane = ({
  evaluation,
  onUpdateQuestionScore,
  onUpdateOverallFeedback,
  onSaveEvaluation,
  saving = false,
}) => {
  if (!evaluation) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200/80 p-8 flex items-center justify-center text-center">
        <div className="space-y-2">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No Evaluation Loaded</p>
          <p className="text-xs text-slate-500">Pick a student answer sheet to run AI rubric evaluation.</p>
        </div>
      </div>
    );
  }

  const currentTotal = evaluation.questions.reduce(
    (acc, q) => acc + (Number(q.teacherScore) || 0),
    0
  );
  const maxMarks = Number(evaluation.maxMarks) || 100;
  const currentPct = Math.round((currentTotal / maxMarks) * 100);

  const getGradeColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pct >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (pct >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 flex flex-col h-[780px] overflow-hidden shadow-xs">
      {/* Header Scoring Summary */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 to-indigo-50/40 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                AI Evaluated (Rubric-Matched)
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Confidence: <strong className="text-slate-800">{evaluation.overallConfidence || 91}%</strong>
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {evaluation.rollNumber} — {evaluation.studentName}
            </h3>
            <p className="text-xs text-slate-500">
              Exam: {evaluation.examTitle} ({evaluation.subject})
            </p>
          </div>

          {/* Big Score Pill */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teacher Moderated Score</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-slate-900">{currentTotal}</span>
                <span className="text-xs font-semibold text-slate-500">/ {maxMarks}</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${getGradeColor(currentPct)}`}>
              {currentPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Question-by-Question List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-1">
          <span>Question-Wise Scoring Breakdown ({evaluation.questions.length} Questions)</span>
          <span className="text-[11px] text-slate-400 font-normal">Adjust marks via input or +/- buttons</span>
        </div>

        {evaluation.questions.map((q, idx) => {
          const isOverridden = Number(q.teacherScore) !== Number(q.aiScore);

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-slate-50/70 transition-all space-y-3"
            >
              {/* Question Header & Score Controls */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Q{q.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Max: {q.maxMarks} Marks
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (AI suggested: {q.aiScore})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {q.questionText}
                  </p>
                </div>

                {/* Teacher Score Adjustment Controls */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onUpdateQuestionScore(idx, Math.max(0, Number(q.teacherScore) - 0.5))}
                    title="Deduct 0.5 Marks"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={q.maxMarks}
                      value={q.teacherScore}
                      onChange={(e) => onUpdateQuestionScore(idx, Math.min(q.maxMarks, Math.max(0, Number(e.target.value))))}
                      className={`w-14 text-center py-1 rounded-lg border text-xs font-bold transition-colors ${
                        isOverridden
                          ? 'border-indigo-400 bg-indigo-50/60 text-indigo-900 font-black'
                          : 'border-slate-200 bg-white text-slate-800'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateQuestionScore(idx, Math.min(q.maxMarks, Number(q.teacherScore) + 0.5))}
                    title="Add 0.5 Marks"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* OCR Handwritten Text Transcription Preview */}
              <div className="p-3 rounded-lg bg-white border border-slate-200/70 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    OCR Handwriting Transcription
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] border border-emerald-200">
                    Confidence {q.confidence}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic bg-slate-50/60 p-2 rounded">
                  "{q.ocrTranscription}"
                </p>
              </div>

              {/* Rubric Alignment & Concept Badges */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Identified Concepts:</span>
                  {(q.conceptsIdentified || []).map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  <strong className="text-slate-700">AI Feedback:</strong> {q.aiFeedback}
                </p>
              </div>
            </div>
          );
        })}

        {/* Overall Qualitative Teacher Feedback */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Overall Feedback for Student</span>
          </div>
          <textarea
            rows="3"
            value={evaluation.overallTeacherFeedback || ''}
            onChange={(e) => onUpdateOverallFeedback(e.target.value)}
            placeholder="Provide qualitative feedback, areas of improvement, or commendations..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
          ></textarea>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="text-[11px] text-slate-500">
          Total Moderated: <strong className="text-slate-800">{currentTotal} / {maxMarks}</strong> ({currentPct}%)
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSaveEvaluation(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Moderated Score</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveEvaluation(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish to Student Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiScoringPane;
