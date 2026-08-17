'use client';

import { useCallback, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileJson2,
  FileText,
  Info,
  Loader2,
  MonitorCog,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { BrandLockup } from '@/components/BrandLockup.tsx';

const MAX_PDF_BYTES = 50 * 1024 * 1024;
const AUTHORING_API = '/api/authoring';

const csrfToken = (): string => {
  if (typeof document === 'undefined') return '';
  const value = document.cookie.split('; ').find((entry) => entry.startsWith('ripodoc_csrf='))?.slice('ripodoc_csrf='.length);
  return value ? decodeURIComponent(value) : '';
};

type UploadStatus = 'uploading' | 'awaiting-review' | 'reviewing' | 'ready-to-publish' | 'publishing' | 'success' | 'error';

interface UploadedFile {
  readonly file: File;
  readonly id: string;
  status: UploadStatus;
  progress: number;
  message?: string;
  draftId?: string;
  proposalUrl?: string;
  downloadUrl?: string;
}

interface LocalUploadReply { readonly draftId?: string; readonly message?: string; }
interface LocalReply { readonly message?: string; readonly downloadUrl?: string; }

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'An unexpected error occurred.';
const isPdf = (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

async function responseData<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
      ? data.error
      : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return data as T;
}


export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [manifest, setManifest] = useState<{ readonly name: string; readonly text: string } | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const chooseManifest = async (file: File | undefined) => {
    if (!file) return;
    setManifestError(null);
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const valid = typeof parsed === 'object' && parsed !== null && 'reportId' in parsed && 'elements' in parsed && Array.isArray(parsed.elements) && parsed.elements.length > 0;
      if (!valid) throw new Error('A RipoDoc manifest needs a reportId and at least one evidence element.');
      setManifest({ name: file.name, text });
    } catch (error: unknown) {
      setManifest(null);
      setManifestError(errorMessage(error));
    }
  };

  const addFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (!isPdf(file)) {
      setFiles((current) => [...current, { file, id, status: 'error', progress: 100, message: 'Choose a PDF file.' }]);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setFiles((current) => [...current, { file, id, status: 'error', progress: 100, message: 'This PDF is larger than the 50 MB local-worker limit.' }]);
      return;
    }
    if (!manifest) {
      setFiles((current) => [...current, { file, id, status: 'error', progress: 100, message: 'Choose a validated RipoDoc manifest before uploading a PDF.' }]);
      return;
    }
    setFiles((current) => [...current, { file, id, status: 'uploading', progress: 0 }]);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('manifest', manifest.text);
    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      let progress = 0;
      interval = setInterval(() => {
        progress = Math.min(progress + 9, 90);
        setFiles((current) => current.map((item) => item.id === id ? { ...item, progress } : item));
      }, 120);
      const response = await fetch(`${AUTHORING_API}/upload`, { method: 'POST', headers: { 'X-RipoDoc-Csrf': csrfToken() }, body: formData });
      const data = await responseData<LocalUploadReply>(response);
      if (!data.draftId) throw new Error('The worker did not return a placement proposal.');
      const draftId = data.draftId;
      setFiles((current) => current.map((item) => item.id === id ? {
        ...item,
        status: 'awaiting-review',
        progress: 100,
        message: data.message ?? 'Overlay proposal generated. Review it before publication.',
        draftId,
        proposalUrl: `${AUTHORING_API}/proposal?draftId=${encodeURIComponent(draftId)}`,
      } : item));
    } catch (error: unknown) {
      const unavailable = error instanceof TypeError;
      setFiles((current) => current.map((item) => item.id === id ? {
        ...item,
        status: 'error',
        progress: 100,
        message: unavailable ? 'Local RipoDoc worker is unavailable. Start it with “npm run dev:local-server” and try again.' : errorMessage(error),
      } : item));
    } finally {
      if (interval) clearInterval(interval);
    }
  }, [manifest]);

  const uploadReviewedProposal = async (fileId: string, draftId: string, proposal: File) => {
    setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'reviewing', message: 'Validating reviewed placement proposal…' } : item));
    try {
      const body = new FormData();
      body.append('draftId', draftId);
      body.append('proposal', proposal);
      const response = await fetch(`${AUTHORING_API}/review`, { method: 'POST', headers: { 'X-RipoDoc-Csrf': csrfToken() }, body });
      const data = await responseData<LocalReply>(response);
      setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'ready-to-publish', message: data.message ?? 'Reviewed placement proposal accepted.' } : item));
    } catch (error: unknown) {
      setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'error', message: errorMessage(error) } : item));
    }
  };

  const publishPdf = async (fileId: string, draftId: string) => {
    setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'publishing', message: 'Publishing clickable PDF…' } : item));
    try {
      const response = await fetch(`${AUTHORING_API}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-RipoDoc-Csrf': csrfToken() },
        body: JSON.stringify({ draftId, ttlDays: 14, csrf: csrfToken() }),
      });
      const data = await responseData<LocalReply>(response);
      setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'success', message: data.message ?? 'Clickable PDF generated.', downloadUrl: `${AUTHORING_API}/artifact?draftId=${encodeURIComponent(draftId)}` } : item));
    } catch (error: unknown) {
      setFiles((current) => current.map((item) => item.id === fileId ? { ...item, status: 'error', message: errorMessage(error) } : item));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    Array.from(event.dataTransfer.files).forEach((file) => { void addFile(file); });
  }, [addFile]);

  const readyFiles = files.filter((file) => file.status === 'ready-to-publish').length;

  return (
    <div className="signal-workspace min-h-[calc(100vh-68px)]">
      <section className="border-b border-[var(--rd-line)] bg-[var(--rd-surface-ink)] text-white"><div className="mx-auto max-w-5xl px-6 py-12 text-center sm:py-16"><div className="flex justify-center"><BrandLockup showDescriptor inverse /></div><div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-[#12B9BE]/25 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#087E84]"><MonitorCog className="h-3.5 w-3.5" aria-hidden="true" />Self-hosted report processor</div><h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Make the PDF you already send accountable.</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--rd-on-ink-soft)]">Use your validated RipoDoc manifest to propose PDF click zones, review each zone, then publish a downloadable evidence-aware report.</p></div></section>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-34px_rgba(17,22,46,0.35)] sm:p-7" aria-labelledby="authoring-title">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#087E84]">Required first step</p><h2 id="authoring-title" className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#11162E]">Choose the approved evidence manifest</h2><p className="mt-1 text-sm text-slate-600">The manifest determines what the PDF can link to; RipoDoc never invents evidence at read time.</p></div><label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#11162E] transition hover:border-[#1769E8] hover:bg-[#EAF5FF]"><FileJson2 className="h-4 w-4" aria-hidden="true" />Choose manifest<input type="file" accept="application/json,.json" className="hidden" onChange={(event) => { void chooseManifest(event.target.files?.[0]); event.target.value = ''; }} /></label></div>
          {manifest ? <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#DDF9F7] px-3 py-2.5 text-sm text-[#087E84]"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate"><strong>{manifest.name}</strong> is ready to use for overlay proposals.</span></div> : <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#EAF5FF] px-3 py-2.5 text-sm leading-6 text-[#0A3E9B]"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Use a schema-valid RipoDoc report manifest. Generate one with the CLI or begin with the repository&apos;s demo fixture.</span></div>}
          {manifestError && <p className="mt-3 flex items-start gap-2 text-sm text-[#B42345]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{manifestError}</p>}

          <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={`mt-6 rounded-2xl border-2 border-dashed px-5 py-12 text-center transition duration-200 sm:px-10 ${isDragging ? 'scale-[1.01] border-[#12B9BE] bg-[#DDF9F7]' : 'border-slate-300 bg-[#F6F8FC] hover:border-[#1769E8]/50 hover:bg-[#EAF5FF]/50'}`}><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EAF5FF] to-[#DDF9F7] text-[#1769E8]"><Upload className={`h-7 w-7 transition ${isDragging ? 'scale-110' : ''}`} aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#11162E]">{isDragging ? 'Drop the PDF to propose overlays' : 'Drop the matching PDF report here'}</h2><p className="mt-2 text-sm text-slate-600">The worker will generate a placement proposal for human review.</p><label className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#11162E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A3E9B] active:scale-[0.98]"><FileText className="h-4 w-4" aria-hidden="true" />Choose PDF<input type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => { void addFile(file); }); event.target.value = ''; }} /></label><p className="mt-4 text-xs text-slate-500">PDF only · 50 MB maximum · processed by your configured local worker</p></div>
          <div className="mt-5 flex gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-left text-sm leading-6 text-cyan-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" aria-hidden="true" /><p><strong>Private authoring boundary:</strong> PDF content is submitted only through your verified workspace session. The browser never receives a worker credential or a direct worker URL; the server issues a short-lived, tenant-bound authorization for every authoring action.</p></div>
        </section>

        {files.length > 0 && <section className="mt-7" aria-labelledby="processing-title"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 id="processing-title" className="text-lg font-bold tracking-[-0.025em] text-[#11162E]">Authoring workflow</h2>{readyFiles > 0 && <span className="rounded-full bg-[#EAF5FF] px-2.5 py-1 text-xs font-semibold text-[#0A3E9B]">{readyFiles} ready to publish</span>}</div><div className="space-y-3">{files.map((file) => <FileRow key={file.id} file={file} onReview={uploadReviewedProposal} onPublish={publishPdf} onRemove={(id) => setFiles((current) => current.filter((item) => item.id !== id))} />)}</div></section>}

        <section className="mt-12 grid gap-4 md:grid-cols-3"><InfoCard icon={MonitorCog} title="Your worker, your data" body="In self-hosted mode, the report is sent only to the RipoDoc worker you operate or explicitly configure." /><InfoCard icon={ShieldCheck} title="Human review is mandatory" body="Publication accepts only a placement proposal with an approver and timestamp on every linked figure." /><InfoCard icon={ArrowRight} title="Original pages preserved" body="The overlay engine appends standard PDF link annotations; it does not redraw the report your client approved." /></section>
      </main>
    </div>
  );
}

function FileRow({ file, onReview, onPublish, onRemove }: { readonly file: UploadedFile; readonly onReview: (id: string, draftId: string, proposal: File) => void; readonly onPublish: (id: string, draftId: string) => void; readonly onRemove: (id: string) => void }) {
  const working = file.status === 'uploading' || file.status === 'reviewing' || file.status === 'publishing';
  const failed = file.status === 'error';
  const success = file.status === 'success';
  return <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#1769E8]"><FileText className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="truncate text-sm font-semibold text-[#11162E]">{file.file.name}</p><p className="shrink-0 text-xs text-slate-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p></div>{file.status === 'uploading' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#1769E8] to-[#12B9BE]" style={{ width: `${file.progress}%` }} /></div>}{file.message && <p className={`mt-1.5 flex items-start gap-1.5 text-xs leading-5 ${failed ? 'text-[#B42345]' : success ? 'text-[#078C68]' : 'text-slate-600'}`}>{failed ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : success ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : working ? <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-[#1769E8]" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1769E8]" aria-hidden="true" />}{file.message}</p>}</div><div className="flex flex-wrap items-center gap-2">{file.status === 'awaiting-review' && file.draftId && <><a href={file.proposalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-[#11162E] transition hover:bg-[#EAF5FF]"><Download className="h-4 w-4" aria-hidden="true" />Proposal</a><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#11162E] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#0A3E9B]"><Upload className="h-4 w-4" aria-hidden="true" />Upload review<input type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const proposal = event.target.files?.[0]; if (proposal) void onReview(file.id, file.draftId!, proposal); event.target.value = ''; }} /></label></>}{file.status === 'ready-to-publish' && file.draftId && <button type="button" onClick={() => onPublish(file.id, file.draftId!)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#1769E8] to-[#12B9BE] px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-105"><ArrowRight className="h-4 w-4" aria-hidden="true" />Publish PDF</button>}{success && file.downloadUrl && <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#11162E] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#0A3E9B]"><Download className="h-4 w-4" aria-hidden="true" />Download</a>}{working && <Loader2 className="h-5 w-5 animate-spin text-[#1769E8]" aria-label="Processing" />}{!working && <button type="button" onClick={() => onRemove(file.id)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={`Remove ${file.file.name}`}><X className="h-4 w-4" aria-hidden="true" /></button>}</div></article>;
}

function InfoCard({ icon: Icon, title, body }: { readonly icon: typeof MonitorCog; readonly title: string; readonly body: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF9F7] text-[#087E84]"><Icon className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-4 text-sm font-bold text-[#11162E]">{title}</h2><p className="mt-2 text-xs leading-5 text-slate-600">{body}</p></article>;
}
