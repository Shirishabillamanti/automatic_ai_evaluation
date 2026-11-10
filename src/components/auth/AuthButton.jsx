import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

/**
 * Primary action button for authentication forms.
 * Supports loading states, custom icons, and navy theme styling.
 */
export const AuthButton = ({
  children,
  type = 'submit',
  isLoading = false,
  disabled = false,
  icon: Icon = ArrowRight,
  variant = 'primary',
  className = '',
  onClick,
}) => {
  const isActionDisabled = disabled || isLoading;

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 focus-visible:ring-slate-900',
    accent:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 focus-visible:ring-blue-600',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs focus-visible:ring-slate-400',
  };

  return (
    <button
      type={type}
      disabled={isActionDisabled}
      onClick={onClick}
      className={`w-full relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
        variantStyles[variant] || variantStyles.primary
      } ${
        isActionDisabled ? 'opacity-70 cursor-not-allowed transform-none' : 'active:scale-[0.99] hover:shadow-lg'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
        </>
      )}
    </button>
  );
};

export default AuthButton;
