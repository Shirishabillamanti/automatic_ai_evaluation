import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import {
  BrainCircuit,
  Award,
  CheckCircle,
  ScanLine,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/firebase';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Split-screen layout for authentication pages.
 * Left section: SmartEval branding, AI illustration, feature highlights.
 * Right section: Form container for Login, Signup, and Forgot Password.
 */
export const AuthLayout = ({
  children,
  heading,
  subtitle,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}) => {
  const features = [
    {
      title: 'AI Handwriting Recognition',
      description: 'Converts handwritten subjective student exam scripts into accurate digital text.',
      icon: ScanLine,
    },
    {
      title: 'Semantic Answer Evaluation',
      description: 'Understands conceptual nuances and core concepts beyond simple keyword matching.',
      icon: BrainCircuit,
    },
    {
      title: 'Intelligent Mark Prediction',
      description: 'Predicts rubric-aligned scores calibrated against model answer keys.',
      icon: Award,
    },
    {
      title: 'Transparent Teacher Review',
      description: 'Empowers educators to inspect, adjust, and approve final grades with full auditability.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800">
      {/* LEFT SECTION: BRANDING & AI SHOWCASE */}
      <section className="lg:w-1/2 xl:w-5/12 auth-mesh-bg text-white relative flex flex-col justify-between p-8 sm:p-10 lg:p-12 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-r border-slate-800/40">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 custom-grid-pattern opacity-40 pointer-events-none" />

        {/* Ambient glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo & Application Name */}
          <Logo variant="light" showTagline={false} />

          <div className="mt-7 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Next-Gen Automated Exam Evaluation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Smarter Evaluation. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
                Better Learning.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              An intelligent platform that transforms handwritten subjective answers into digital text
              and evaluates student responses using AI-powered semantic similarity.
            </p>
          </div>

          {/* 4 FEATURE HIGHLIGHTS */}
          <div className="mt-8 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Core Platform Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/35 border border-slate-800/60 hover:bg-slate-900/55 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{f.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {f.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>SmartEval &bull; AI Examination Platform</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            ISO 27001 & FERPA Compliant Design
          </span>
        </div>
      </section>

      {/* RIGHT SECTION: FORM CONTAINER */}
      <main className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-h-screen">
        {/* Top Header with Status */}
        <header className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 lg:border-none">
          <div className="lg:hidden">
            <Logo variant="dark" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Firebase Auth Connected
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                title="Add your Firebase keys in .env to connect live Cloud Firestore & Auth"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Auth Simulator Active (.env pending)
              </span>
            )}
          </div>
        </header>

        {/* Form Box */}
        <div className="w-full max-w-xl mx-auto my-auto py-2">
          <div className="mb-5 sm:mb-6 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {heading}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-card border border-slate-200/80">
            {children}
          </div>

          {/* Bottom navigation link */}
          {footerPrompt && footerLinkText && footerLinkHref && (
            <div className="mt-5 text-center text-sm text-slate-600">
              <span>{footerPrompt} </span>
              <Link
                to={footerLinkHref}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
              >
                <span>{footerLinkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Bottom copyright / policy */}
        <footer className="w-full max-w-xl mx-auto pt-4 text-center text-xs text-slate-400">
          <p>
            &copy; {CURRENT_YEAR} SmartEval. All rights reserved. Transforming subjective exam evaluation with AI.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;
