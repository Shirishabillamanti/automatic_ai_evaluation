import React from 'react';
import {
  FileCheck2,
  Award,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

export const StudentStatCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Published Results',
      value: stats?.totalPublishedResults ?? 0,
      subtitle: 'Approved evaluation reports',
      icon: FileCheck2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Total Marks Obtained',
      value: stats ? `${stats.totalMarksObtained} / ${stats.totalMaxMarks}` : '0 / 0',
      subtitle: stats?.totalPublishedResults > 0 ? 'Across published exams' : 'No scored papers yet',
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Average Percentage',
      value: stats?.totalPublishedResults > 0 ? `${stats.averagePercentage}%` : '0%',
      subtitle: stats?.totalPublishedResults > 0 ? `Peak score: ${stats.highestPercentage}%` : 'Awaiting published scores',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Exams Completed',
      value: stats?.examsCompleted ?? 0,
      subtitle: 'Evaluated & finalized',
      icon: GraduationCap,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                {card.title}
              </span>
              <div
                className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>

            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StudentStatCards;
