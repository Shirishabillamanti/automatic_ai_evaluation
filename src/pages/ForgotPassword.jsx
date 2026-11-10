import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import AuthButton from '../components/auth/AuthButton';
import { useAuth } from '../context/useAuth';

export const ForgotPassword = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const validate = () => {
    if (!email.trim()) {
      setError('Registered email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmissionFeedback(null);

    const result = await forgotPassword(email.trim());

    if (result.success) {
      setSubmissionFeedback({
        type: 'success',
        title: 'Reset Instructions Sent',
        message: `Password recovery instructions have been sent to ${email.trim()}. Please check your inbox.`,
      });
    } else {
      setSubmissionFeedback({
        type: 'error',
        title: 'Reset Request Failed',
        message: result.error || 'Failed to dispatch reset email. Please try again.',
      });
    }
  };

  return (
    <AuthLayout
      heading="Reset Your Password"
      subtitle="Enter your registered SmartEval email address and we will send password recovery instructions."
      footerPrompt="Remembered your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/login"
      activePage="forgot-password"
    >
      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-3 border ${
            submissionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : submissionFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
          role="status"
        >
          {submissionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : submissionFeedback.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <h4 className="font-bold">{submissionFeedback.title}</h4>
            <p className="leading-relaxed">{submissionFeedback.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField
          id="forgot-email"
          name="email"
          label="Registered Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
            if (submissionFeedback) setSubmissionFeedback(null);
          }}
          error={error}
          icon={Mail}
          required
          autoComplete="email"
          helperText="We'll send an authentication recovery link to this address."
        />

        <div className="pt-2 space-y-3">
          <AuthButton type="submit" isLoading={isLoading}>
            Send Reset Instructions
          </AuthButton>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
