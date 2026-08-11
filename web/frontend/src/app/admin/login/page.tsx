import Link from 'next/link';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { adminAccessConfigured } from '@/lib/admin/session.ts';
import { isAdminSession } from '@/lib/admin/server-session.ts';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  readonly searchParams: Promise<{ readonly error?: string | readonly string[] }>;
}

const messageFor = (error: string | readonly string[] | undefined): string | undefined => {
  const value = Array.isArray(error) ? error[0] : error;
  if (value === 'invalid') return 'The access key was not accepted. Try again.';
  if (value === 'not-configured') return 'Administrator access has not been configured on this deployment.';
  return undefined;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminSession()) redirect('/admin');

  const message = messageFor((await searchParams).error);
  const configured = adminAccessConfigured();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 px-6 py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to RipoDoc
        </Link>
        <main className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Private operations workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Administrator sign in</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This route is intentionally not linked from the public navigation. Use the deployment-specific administrator access key to continue.
          </p>

          {message ? (
            <p className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100" role="alert">
              {message}
            </p>
          ) : null}

          {configured ? (
            <form action="/api/admin/session" method="post" className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">Administrator access key</span>
                <span className="relative mt-2 block">
                  <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <input
                    required
                    name="accessKey"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    placeholder="Enter access key"
                  />
                </span>
              </label>
              <button type="submit" className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-900">
                Open administrator workspace
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
              Set a server-only <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-sky-200">RIPODOC_ADMIN_ACCESS_KEY</code> value of at least 16 characters, then redeploy. The key is never sent to the browser.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
