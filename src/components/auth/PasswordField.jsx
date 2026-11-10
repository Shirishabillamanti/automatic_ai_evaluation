import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/passwordUtils';

/**
 * Reusable Password field with show/hide toggle, lock icon, and optional strength indicator.
 */
export const PasswordField = ({
  id,
  name = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  error,
  showStrengthIndicator = false,
  autoComplete = 'current-password',
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const strength = showStrengthIndicator ? calculatePasswordStrength(value) : null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showStrengthIndicator && value && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${strength.textColor}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {strength.label}
          </span>
        )}
      </div>

      <div className="relative rounded-xl shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="h-4 w-4" />
        </div>

        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full block text-sm text-slate-900 bg-white placeholder-slate-400 rounded-xl transition duration-200 border pl-10 pr-11 py-2.5 outline-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
          } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-600" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Password strength visual bar */}
      {showStrengthIndicator && value && (
        <div className="pt-1">
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  strength.score >= step ? strength.color : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Must contain 8+ characters, uppercase letter, number, & special character
          </p>
        </div>
      )}

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordField;
