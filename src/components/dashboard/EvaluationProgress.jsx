import React from 'react';
import { CheckCircle2, Clock, RefreshCw, Files, Info } from 'lucide-react';

export const EvaluationProgress = ({ progress, loading }) => {
  const total = progress?.totalUploaded || 0;
  const processed = progress?.processed || 0;
  const waitingReview = progress?.waitingReview || 0;
  const approved = progress?.approved || 0;
  const completionRate = progress?.completionRate || 0;

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle mb-8 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
        <div className="h-3 w-full bg-slate-100 rounded mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Evaluation Pipeline Progress</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of uploaded handwritten answer scripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Completion Rate:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {total > 0 ? `${completionRate}%` : 'Not started'}
          </span>
        </div>
      </div>

      {/* Progress Bar or Not Started Notice */}
      {total > 0 ? (
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex mb-5">
          <div
            style={{ width: `${(approved / total) * 100}%` }}
            title={`Approved: ${approved}`}
            className="bg-emerald-500 transition-all duration-500"
          />
          <div
            style={{ width: `${(waitingReview / total) * 100}%` }}
            title={`Waiting Review: ${waitingReview}`}
            className="bg-amber-400 transition-all duration-500"
          />
          <div
            style={{ width: `${(processed / total) * 100}%` }}
            title={`Processing: ${processed}`}
            className="bg-blue-500 transition-all duration-500"
          />
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-5 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">
              Pipeline Status: Not started (Awaiting Answer Sheet Uploads)
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              OCR extraction and AI subjective evaluation pipelines will activate once student answer scripts are uploaded in upcoming phases.
            </p>
          </div>
        </div>
      )}

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Files className="w-3.5 h-3.5 text-slate-600" />
            <span>Total Uploaded</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{total}</div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Successfully Processed</span>
          </div>
          <div className="text-xl font-bold text-blue-900">{processed}</div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Reviews</span>
          </div>
          <div className="text-xl font-bold text-amber-900">{waitingReview}</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved Results</span>
          </div>
          <div className="text-xl font-bold text-emerald-900">{approved}</div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationProgress;
