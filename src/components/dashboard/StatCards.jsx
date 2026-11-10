import React from 'react';
import {
  FileText,
  Files,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const StatCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Exams',
      value: stats?.totalExams ?? 0,
      icon: FileText,
      color: 'blue',
      subtitle: (stats?.totalExams ?? 0) === 0 ? 'No exams created yet' : 'Examination sets in workspace',
      tag: 'Academic Sets',
    },
    {
      title: 'Total Answer Sheets Uploaded',
      value: stats?.totalAnswerSheetsUploaded ?? 0,
      icon: Files,
      color: 'indigo',
      subtitle: (stats?.totalAnswerSheetsUploaded ?? 0) === 0 ? 'No sheets uploaded yet' : 'Handwritten answer scripts',
      tag: 'Submissions',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews ?? 0,
      icon: Clock,
      color: 'amber',
      subtitle: (stats?.pendingReviews ?? 0) === 0 ? 'All caught up' : 'Awaiting teacher grading sign-off',
      tag: 'Action Needed',
    },
    {
      title: 'Approved Evaluations',
      value: stats?.approvedEvaluations ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      subtitle: (stats?.approvedEvaluations ?? 0) === 0 ? 'No approved grades yet' : 'Finalized & verified evaluations',
      tag: 'Completed',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;

        const colorMap = {
          blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100',
            tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
          },
          emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          },
          indigo: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            border: 'border-indigo-100',
            tagBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          },
          amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
          },
        };

        const theme = colorMap[card.color];

        return (
          <div
            key={card.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`w-9 h-9 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.tagBg}`}>
                {card.tag}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
