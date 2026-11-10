import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit } from 'lucide-react';

/**
 * Reusable SmartEval Logo component.
 * Supports light and dark variations for split-screen branding and headers.
 */
export const Logo = ({ variant = 'dark', showTagline = false }) => {
  const isLight = variant === 'light';

  return (
    <Link to="/" className="inline-flex items-center gap-3 group transition-transform duration-200">
      <div className="relative flex items-center justify-center">
        {/* Glowing badge background */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 ${
            isLight
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/20'
              : 'bg-gradient-to-tr from-navy-900 via-blue-900 to-blue-700 text-white shadow-navy-900/20'
          }`}
        >
          <BrainCircuit className="w-6 h-6 text-blue-200" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <Sparkles className="w-2 h-2 text-navy-950" />
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-extrabold tracking-tight text-2xl font-sans ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            Smart<span className="text-blue-600">Eval</span>
          </span>
        </div>
        {showTagline && (
          <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
            Smarter Evaluation. Better Learning.
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
