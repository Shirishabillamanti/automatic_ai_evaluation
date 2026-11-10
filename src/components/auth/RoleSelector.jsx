import React from 'react';
import { GraduationCap, UserRound, CheckCircle2 } from 'lucide-react';

/**
 * Reusable RoleSelector component with strictly TWO roles:
 * 1. TEACHER (role: "teacher")
 * 2. STUDENT (role: "student")
 */
export const RoleSelector = ({ selectedRole, onChange, error }) => {
  const roles = [
    {
      id: 'teacher',
      title: 'Teacher',
      badge: 'Faculty & Evaluator',
      icon: GraduationCap,
      description:
        'Create and manage examinations, upload handwritten answer sheets, configure evaluation rubrics, and grade submissions.',
    },
    {
      id: 'student',
      title: 'Student',
      badge: 'Learner & Examinee',
      icon: UserRound,
      description:
        'View examination results, question-wise score breakdowns, AI evaluation insights, and teacher feedback.',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Select Role <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-slate-400">Choose your workspace access</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id || (role.id === 'teacher' && selectedRole === 'teacher_admin');
          const Icon = role.icon;

          return (
            <div
              key={role.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange(role.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onChange(role.id);
                }
              }}
              className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm shadow-blue-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Radio check icon */}
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">{role.title}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {role.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{role.description}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;
