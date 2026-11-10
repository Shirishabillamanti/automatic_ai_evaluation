import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image, AlertCircle, Sparkles } from 'lucide-react';

/**
 * DropzoneUploader Component
 * Supports multi-file drag-and-drop ingestion of scanned student answer booklets.
 */
export const DropzoneUploader = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ];
  const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFiles = (fileList) => {
    setErrorMessage('');
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    const errors = [];

    Array.from(fileList).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type) && !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)) {
        errors.push(`"${file.name}" is not a supported file format (only PDF, PNG, JPG accepted).`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds the 15MB size limit.`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
      // Reset input value so same files can be re-uploaded if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : isDragOver
            ? 'border-blue-600 bg-blue-50/60 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/50 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform ${
              isDragOver ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Drag & Drop Student Answer Sheets Here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              or <span className="text-blue-600 font-semibold underline underline-offset-2">browse from your computer</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
              <FileText className="w-3 h-3 text-red-500" /> Multi-page PDF
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
              <Image className="w-3 h-3 text-emerald-500" /> High-res JPG / PNG
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
              Up to 15 MB / file
            </span>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Smart Tip: Filenames formatted like <strong>CS2026_042_John_Doe.pdf</strong> automatically populate roll number & name!</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DropzoneUploader;
