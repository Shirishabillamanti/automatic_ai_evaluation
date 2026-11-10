import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Info } from 'lucide-react';
import TeacherLayout from '../../components/dashboard/TeacherLayout';

export const ResultsReports = () => {
  const navigate = useNavigate();

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Results & Analytics Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort performance summaries, score distributions, and exportable grade registers.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            Phase 6 Upcoming Feature
          </span>

          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Class Analytics & Grade Export
          </h2>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            Detailed statistical summaries including class average, highest score, question difficulty index, and CSV/Excel export for institutional grading systems.
          </p>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 mb-6">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Planned Capabilities:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px]">
              <li>Question-wise difficulty analytics and weak area detection</li>
              <li>Export to CSV, Excel, and official university grade sheets</li>
              <li>Individual student report card generation</li>
              <li>Publish scores directly to Student Portal with notification</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default ResultsReports;
