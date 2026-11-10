import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable accessible input field with icon support, validation states, and helper messages.
 */
export const InputField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon,
  autoComplete,
  disabled = false,
  helperText,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helperText && !error && (
            <span className="text-xs text-slate-400">{helperText}</span>
          )}
        </div>
      )}

      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full block text-sm text-slate-900 bg-white placeholder-slate-400 rounded-xl transition duration-200 border ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2.5 outline-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
          } ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1 animate-fadeIn"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default InputField;
