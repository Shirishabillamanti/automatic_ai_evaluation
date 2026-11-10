import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  UploadCloud,
  CheckSquare,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create New Exam',
      description: 'Set up questions, rubric keys, and maximum score limits',
      icon: PlusCircle,
      route: '/teacher/exams/create',
      color: 'blue',
      buttonText: 'Create Exam',
    },
    {
      title: 'Upload Answer Sheets',
      description: 'Ingest student handwritten scripts for OCR processing',
      icon: UploadCloud,
      route: '/teacher/answer-sheets',
      color: 'indigo',
      buttonText: 'Upload Sheets',
    },
    {
      title: 'Review Pending Answers',
      description: 'Review AI-suggested marks and finalize subjective grading',
      icon: CheckSquare,
      route: '/teacher/evaluation',
      color: 'amber',
      buttonText: 'Start Review',
    },
    {
      title: 'View Results',
      description: 'Generate performance analytics and class score reports',
      icon: BarChart3,
      route: '/teacher/results',
      color: 'emerald',
      buttonText: 'View Reports',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Quick Actions</h2>
        <span className="text-xs text-slate-400">Core evaluation workflows</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <div
              key={act.title}
              onClick={() => navigate(act.route)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-blue-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>{act.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
