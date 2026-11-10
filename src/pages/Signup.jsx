import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, AtSign, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import { calculatePasswordStrength } from '../utils/passwordUtils';
import RoleSelector from '../components/auth/RoleSelector';
import AuthButton from '../components/auth/AuthButton';
import { useAuth } from '../context/useAuth';
import emailService from '../services/emailService';

export const Signup = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const validate = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // 2. Email Address
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 3. Username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username.trim())) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscores only)';
    }

    // 4. Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const strength = calculatePasswordStrength(formData.password);
      if (strength.score < 2) {
        newErrors.password = 'Password is too weak. Include uppercase letters, numbers, and symbols.';
      }
    }

    // 5. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // 6. Role Selection
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    // 7. Terms & Conditions
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmissionFeedback(null);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
    };

    const result = await register(payload);

    if (result.success) {
      const isTeacherRole = formData.role === 'teacher' || formData.role === 'teacher_admin';

      setSubmissionFeedback({
        type: 'success',
        title: 'Account Created Successfully (Status: 201 Created)',
        message: isTeacherRole
          ? `Teacher account created successfully for ${formData.email}. Redirecting to Teacher Dashboard...`
          : `Student account created successfully for ${formData.email}. Redirecting to Student Dashboard...`,
      });

      // Dispatch notification emails to BOTH User & Admin
      try {
        await emailService.sendSignupEmails({
          userEmail: formData.email.trim(),
          userName: formData.fullName.trim(),
          role: isTeacherRole ? 'teacher' : 'student',
          accountStatus: 'active',
        });
      } catch (emailErr) {
        console.warn('[SmartEval] Email notification error:', emailErr);
      }

      // Smooth transition after user sees confirmation
      setTimeout(() => {
        if (result.commitSession) {
          result.commitSession();
        }
        if (isTeacherRole) {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1200);
    } else {
      // Reflect Endpoint Failure: Consistency Check / Error
      setSubmissionFeedback({
        type: 'error',
        title: 'Endpoint Registration Failed: Consistency Check Error (Status: 400 Bad Request)',
        message:
          result.error ||
          'Registration could not be completed. The submitted credentials failed endpoint consistency verification.',
      });
    }
  };

  return (
    <AuthLayout
      heading="Create Your Account"
      subtitle="Join SmartEval and experience intelligent examination evaluation."
      footerPrompt="Already have an account?"
      footerLinkText="Sign in to your account"
      footerLinkHref="/login"
      activePage="signup"
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
        {/* Full Name & Username in 2-column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="signup-fullName"
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            icon={User}
            required
            autoComplete="name"
          />

          <InputField
            id="signup-username"
            name="username"
            label="Username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            icon={AtSign}
            required
            autoComplete="username"
          />
        </div>

        {/* Email Address */}
        <InputField
          id="signup-email"
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

        {/* Role Selection (Strictly 2 roles: Teacher/Admin & Student) */}
        <RoleSelector
          selectedRole={formData.role}
          onChange={handleRoleChange}
          error={errors.role}
        />

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <PasswordField
            id="signup-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showStrengthIndicator={true}
            required
            autoComplete="new-password"
          />

          <PasswordField
            id="signup-confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Terms and conditions checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="font-semibold text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="font-semibold text-blue-600 hover:underline">
                Privacy Policy
              </a>
              . I understand that Student accounts require teacher approval.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.agreeTerms}</span>
            </p>
          )}
        </div>

        {/* Create Account Button */}
        <div className="pt-2">
          <AuthButton type="submit" isLoading={isLoading}>
            Create SmartEval Account
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
