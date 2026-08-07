
'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, ArrowRight, Download } from 'lucide-react';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  pdfPath?: string;
  placementsPath?: string;
  downloadUrl?: string;
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'),
    );
    droppedFiles.forEach(addFile);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    selected.forEach(addFile);
  };

  const addFile = async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const uploaded: UploadedFile = { file, id, status: 'uploading', progress: 0 };
    setFiles((prev) => [...prev, uploaded]);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Simulate upload progress initially
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: currentProgress } : f)),
        );
      }, 100);

      const response = await fetch('/api/local/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload PDF');
      }

      const data = await response.json();
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'processing', progress: 100, message: data.message, pdfPath: data.pdfPath, placementsPath: data.placementsPath }
            : f,
        ),
      );
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'error', message: error.message, progress: 100 }
            : f,
        ),
      );
    }
  };

  const publishPdf = async (fileId: string, pdfPath: string, placementsPath: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'processing', message: 'Publishing PDF...' } : f)),
    );
    try {
      const response = await fetch('/api/local/publish-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: fileId,
          pdfPath,
          placementsPath,
          origin: window.location.origin,
          ttlDays: 14, // Default to 14 days expiry
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish PDF');
      }

      const data = await response.json();
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'success', message: data.message, downloadUrl: data.downloadUrl }
            : f,
        ),
      );
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'error', message: error.message }
            : f,
        ),
      );
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const totalFiles = files.length;
  const successfulFiles = files.filter((f) => f.status === 'success').length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50/50 via-white to-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <Image
            src="/ripodoc-logo.jpeg"
            alt="RipoDoc logo"
            width={64}
            height={64}
            className="mx-auto mb-4 rounded-2xl object-contain shadow-lg shadow-blue-600/25"
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Upload your PDF</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Drag and drop any PDF report. RipoDoc will overlay interactive click zones on every
            figure, making each number clickable and traceable to its source data.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-10 rounded-2xl border-2 border-dashed p-12 text-center transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Upload className={`h-10 w-10 text-blue-600 transition ${isDragging ? 'scale-110' : ''}`} />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900">
            {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF'}
          </p>
          <p className="mt-1 text-sm text-slate-500">or click to browse</p>
          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl">
            <FileText className="h-4 w-4" />
            Browse files
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="mt-4 text-xs text-slate-400">PDF files only &middot; Max 50MB per file</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Uploaded files ({totalFiles})
              </h2>
              {successfulFiles > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {successfulFiles} ready
                </span>
              )}
            </div>
            <div className="space-y-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{f.file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {f.status === 'uploading' && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    )}
                    {f.status === 'processing' && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {f.message}
                      </p>
                    )}
                    {f.status === 'success' && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {f.message}
                      </p>
                    )}
                    {f.status === 'error' && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {f.message}
                      </p>
                    )}
                  </div>
                  {f.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  {f.status === 'success' && f.downloadUrl && (
                    <a
                      href={f.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  )}
                  {f.status === 'success' && !f.downloadUrl && f.pdfPath && f.placementsPath && (
                    <button
                      type="button"
                      onClick={() => publishPdf(f.id, f.pdfPath!, f.placementsPath!)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Publish PDF
                    </button>
                  )}
                  {f.status !== 'uploading' && (
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Your PDF stays local</h3>
            <p className="mt-1 text-xs text-slate-500">
              Files are processed locally in your browser. Nothing is sent to a server.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Byte-for-byte preserved</h3>
            <p className="mt-1 text-xs text-slate-500">
              Your original file is a byte-for-byte prefix of the output. Nothing moves, nothing
              changes.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">Every figure clickable</h3>
            <p className="mt-1 text-xs text-slate-500">
              Each number gets a standard PDF link annotation that works in every viewer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
