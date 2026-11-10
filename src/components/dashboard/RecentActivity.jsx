import React from 'react';
import {
  Activity,
  PlusCircle,
  UploadCloud,
  Sparkles,
  Edit,
  Archive,
  Trash2,
  FileCheck2,
} from 'lucide-react';

export const RecentActivity = ({ activities = [], loading }) => {
  const getActivityIcon = (action) => {
    switch (action) {
      case 'exam_created':
        return <PlusCircle className="w-4 h-4 text-blue-600" />;
      case 'exam_updated':
        return <Edit className="w-4 h-4 text-indigo-600" />;
      case 'exam_archived':
        return <Archive className="w-4 h-4 text-slate-500" />;
      case 'exam_deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'sheet_uploaded':
        return <UploadCloud className="w-4 h-4 text-indigo-600" />;
      case 'evaluation_completed':
      case 'result_approved':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatActivityTime = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle mb-8 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-slate-100">
          <Activity className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No activity recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            When you create, edit, or archive examinations, real events will be logged here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((act) => {
            const time = act.createdAt || act.timestamp;
            const action = act.action || act.type;

            return (
              <div key={act.id || act.activityId || time} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{act.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed truncate">{act.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                  {formatActivityTime(time)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
