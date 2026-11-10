import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sparkles,
} from 'lucide-react';

/**
 * ScriptViewerPane Component
 * Interactive side-by-side script viewer for teacher moderation.
 */
export const ScriptViewerPane = ({ submission }) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [contrastEnhanced, setContrastEnhanced] = useState(false);

  if (!submission) {
    return (
      <div className="h-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 p-8 text-center border border-slate-800">
        <div>
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-xs font-semibold">No Answer Script Selected</p>
          <p className="text-[11px] text-slate-500 mt-1">Select an answer booklet from the queue to start grading.</p>
        </div>
      </div>
    );
  }

  const pages = submission.pages && submission.pages.length > 0
    ? submission.pages
    : [{ pageNumber: 1, previewUrl: submission.fileUrl || '', fileName: submission.fileName }];

  const currentPage = pages[activePageIndex] || pages[0];

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) setActivePageIndex((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) setActivePageIndex((prev) => prev - 1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const toggleContrast = () => setContrastEnhanced((prev) => !prev);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[780px] overflow-hidden shadow-md">
      {/* Viewer Header */}
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300 gap-2 shrink-0">
        <div>
          <span className="font-bold text-white text-xs">
            {submission.rollNumber} — {submission.studentName}
          </span>
          <p className="text-[10px] text-slate-400">
            {submission.examTitle} · {pages.length} Pages
          </p>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1 bg-slate-700/70 px-2 py-1 rounded-xl">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={activePageIndex === 0}
            className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-white px-1">
            {activePageIndex + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={activePageIndex === pages.length - 1}
            className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] ml-1"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{rotation}°</span>
          </button>
          <button
            type="button"
            onClick={toggleContrast}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] ml-1 ${
              contrastEnhanced
                ? 'bg-amber-500 text-slate-900 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Enhance Ink Contrast"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contrast</span>
          </button>
        </div>

        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          OCR Aligned
        </span>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/50">
        {currentPage.previewUrl && currentPage.previewUrl !== 'pdf-document-preview' ? (
          <img
            src={currentPage.previewUrl}
            alt={`Page ${activePageIndex + 1}`}
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              filter: contrastEnhanced ? 'contrast(140%) brightness(95%)' : 'none',
              maxWidth: '95%',
              maxHeight: '90%',
            }}
            className="rounded-lg shadow-xl object-contain transition-transform duration-200 border border-slate-800"
          />
        ) : (
          <div className="max-w-xs text-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
            <FileText className="w-12 h-12 text-blue-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-white">Multi-Page Script Document</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Viewing Page {activePageIndex + 1} of {pages.length} ({submission.fileName})
              </p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl text-left text-[11px] space-y-1 border border-slate-700/60">
              <p className="text-slate-400">Roll: <strong className="text-white">{submission.rollNumber}</strong></p>
              <p className="text-slate-400">Resolution: <strong className="text-emerald-400">300 DPI Clear</strong></p>
              <p className="text-slate-400">OCR Scan: <strong className="text-blue-400">Segmented</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptViewerPane;
