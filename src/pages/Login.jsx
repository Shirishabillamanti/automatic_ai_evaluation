import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import RoleSelector from '../components/auth/RoleSelector';
import AuthButton from '../components/auth/AuthButton';
import { useAuth } from '../context/useAuth';
import emailService from '../services/emailService';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select your role (Teacher or Student)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submissionFeedback) {
      setSubmissionFeedback(null);
    }
  };

  const handleRoleChange = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
    if (submissionFeedback) {
      setSubmissionFeedback(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmissionFeedback(null);

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      const profile = result.profile;
      const accountRole = (profile?.role === 'teacher' || profile?.role === 'teacher_admin') ? 'teacher' : 'student';

      // Check if selected role matches account role
      if (formData.role && formData.role !== accountRole) {
        setSubmissionFeedback({
          type: 'error',
          title: 'Role Mismatch',
          message: `This account is registered as a ${accountRole === 'teacher' ? 'Teacher' : 'Student'}, but you selected ${formData.role === 'teacher' ? 'Teacher' : 'Student'}. Please select the matching role.`,
        });
        return;
      }

      setSubmissionFeedback({
        type: 'success',
        title: 'Authentication Successful',
        message: 'Credentials verified successfully. Redirecting to workspace...',
      });

      // Dispatch security notification emails to BOTH User & Admin
      try {
        await emailService.sendLoginEmails({
          userEmail: formData.email.trim(),
          userName: profile?.fullName || profile?.username || formData.email.split('@')[0],
          role: accountRole,
        });
      } catch (emailErr) {
        console.warn('[SmartEval] Email notification error:', emailErr);
      }

      // Smooth transition after user sees confirmation
      setTimeout(() => {
        if (result.commitSession) {
          result.commitSession();
        }
        if (accountRole === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 900);
    } else {
      setSubmissionFeedback({
        type: 'error',
        title: 'Authentication Failed',
        message:
          result.error ||
          'Authentication failed. The provided email or password does not match our records. Please verify and try again.',
      });
    }
  };

  return (
    <AuthLayout
      heading="Welcome Back!"
      subtitle="Sign in to access your SmartEval workspace."
      footerPrompt="Don't have an account yet?"
      footerLinkText="Create your account"
      footerLinkHref="/signup"
      activePage="login"
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
        {/* Role Selection (Teacher / Student) */}
        <RoleSelector
          selectedRole={formData.role}
          onChange={handleRoleChange}
          error={errors.role}
        />

        {/* Email Address */}
        <InputField
          id="login-email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
          autoComplete="email"
        />

        {/* Password */}
        <div>
          <PasswordField
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between mt-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span>Remember me on this device</span>
            </label>

            <Link
              to="/forgot-password"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="pt-2">
          <AuthButton type="submit" isLoading={isLoading}>
            Sign In to SmartEval
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
