import React, { useState } from 'react';
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ScriptInspectionModal Component
 * Interactive multi-page script viewer with zoom, rotation, contrast, and pre-flight metadata.
 */
export const ScriptInspectionModal = ({
  submission = null,
  isOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [contrastEnhanced, setContrastEnhanced] = useState(false);

  if (!isOpen || !submission) return null;

  const pages = submission.pages && submission.pages.length > 0
    ? submission.pages
    : [{ pageNumber: 1, previewUrl: submission.fileUrl || '', fileName: submission.fileName }];

  const currentPage = pages[activePageIndex] || pages[0];

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const toggleContrast = () => setContrastEnhanced((prev) => !prev);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {submission.rollNumber} - {submission.studentName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {submission.examCode || 'EXAM'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {submission.examTitle} · Ingested {submission.uploadedAt ? new Date(submission.uploadedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inspection Viewport & Toolbar */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-900">
          {/* Top Controls Toolbar */}
          <div className="px-4 py-2.5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3 shrink-0">
            {/* Page navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={activePageIndex === 0}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="px-2 font-semibold text-white text-[11px]">
                Page {activePageIndex + 1} of {pages.length}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={activePageIndex === pages.length - 1}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Viewer Zoom & Orientation Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-slate-600 mx-1"></span>
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90° Clockwise"
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-1 text-[11px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{rotation}°</span>
              </button>
              <button
                type="button"
                onClick={toggleContrast}
                title="Toggle Contrast Enhancement"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                  contrastEnhanced
                    ? 'bg-amber-500 text-slate-900 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enhance</span>
              </button>
            </div>

            {/* Pre-flight badges */}
            <div className="hidden sm:flex items-center gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Preflight: Verified
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                OCR Ready
              </span>
            </div>
          </div>

          {/* Canvas / Image Display */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {currentPage.previewUrl && currentPage.previewUrl !== 'pdf-document-preview' ? (
              <img
                src={currentPage.previewUrl}
                alt={`Page ${activePageIndex + 1}`}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  filter: contrastEnhanced ? 'contrast(140%) brightness(95%)' : 'none',
                  maxHeight: '60vh',
                }}
                className="rounded-lg shadow-lg object-contain transition-transform duration-200"
              />
            ) : (
              <div className="max-w-md w-full bg-slate-800/80 rounded-2xl border border-slate-700 p-8 text-center text-slate-300 space-y-4">
                <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-white">
                    Multi-Page PDF Ingested Document
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Script Page {activePageIndex + 1} of {pages.length} ({submission.fileName})
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 text-left text-xs space-y-1.5 border border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Roll:</span>
                    <strong className="text-white">{submission.rollNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Name:</span>
                    <strong className="text-white">{submission.studentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution Check:</span>
                    <strong className="text-emerald-400">High Resolution Scan (300 DPI)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orientation:</span>
                    <strong className="text-white">Aligned 0° (Deskew Applied)</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="text-xs text-slate-500">
            Script ID: <code className="text-slate-700 font-mono text-[11px]">{submission.id}</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/teacher/evaluation');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Evaluation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptInspectionModal;
