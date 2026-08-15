'use client';

import Link from 'next/link';
import { Check, ChevronLeft, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const COOKIE_PREFERENCES_KEY = 'ripodoc-cookie-preferences-v1';
export const OPEN_COOKIE_SETTINGS_EVENT = 'ripodoc:open-cookie-settings';

type ConsentChoice = 'accepted' | 'rejected';
type NoticeView = 'hidden' | 'notice' | 'settings';

interface CookiePreferences {
  readonly version: 1;
  readonly choice: ConsentChoice;
  readonly necessary: true;
  readonly analytics: false;
  readonly marketing: false;
  readonly savedAt: string;
}

const preferenceRecord = (choice: ConsentChoice): CookiePreferences => ({
  version: 1,
  choice,
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: new Date().toISOString(),
});

const hasSavedPreference = (): boolean => {
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return false;
    const value: unknown = JSON.parse(raw);
    return typeof value === 'object' && value !== null &&
      'version' in value && value.version === 1 &&
      'choice' in value && (value.choice === 'accepted' || value.choice === 'rejected') &&
      'necessary' in value && value.necessary === true &&
      'analytics' in value && value.analytics === false &&
      'marketing' in value && value.marketing === false;
  } catch {
    return false;
  }
};

/**
 * The public site uses necessary session/CSRF cookies only. This interface keeps
 * the decision legible and persistent while optional analytics or marketing
 * technologies remain disabled. It is deliberately not an inaccurate claim that
 * a visitor can disable identity/security cookies required by a private workspace.
 */
export function CookieNotice() {
  const [view, setView] = useState<NoticeView>('hidden');
  const settingsTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView(hasSavedPreference() ? 'hidden' : 'notice');
    }, 0);

    const openSettings = () => setView('settings');
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  useEffect(() => {
    if (view === 'settings') settingsTitleRef.current?.focus();
  }, [view]);

  const saveChoice = (choice: ConsentChoice) => {
    try {
      window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferenceRecord(choice)));
    } catch {
      // If browser storage is unavailable, the immediate choice still applies for this page view.
    }
    setView('hidden');
  };

  const closeSettings = () => setView(hasSavedPreference() ? 'hidden' : 'notice');

  if (view === 'hidden') return null;

  if (view === 'settings') {
    return (
      <div className="fixed inset-0 z-[60] flex items-end bg-[#1d1a16]/45 p-3 sm:items-center sm:justify-center sm:p-6" role="presentation">
        <section
          className="w-full max-w-xl border border-[#1d1a16] bg-[#fffdf8] text-[#1d1a16] shadow-[10px_10px_0_#1d1a16]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          aria-describedby="cookie-settings-description"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[#1d1a16]/15 px-5 py-4 sm:px-6">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f5bea]">Privacy controls</p>
              <h2 id="cookie-settings-title" ref={settingsTitleRef} tabIndex={-1} className="mt-1 text-xl font-bold tracking-[-0.03em] outline-none">Cookie settings</h2>
            </div>
            <button
              type="button"
              onClick={closeSettings}
              className="inline-flex min-h-10 items-center gap-2 border border-[#1d1a16] px-3 text-xs font-bold uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" /> Back
            </button>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <p id="cookie-settings-description" className="text-sm leading-6 text-[#4b463e]">
              RipoDoc currently operates with necessary security storage only. These controls save your choice locally in this browser; no analytics, advertising, replay, chat, or marketing category is active on the public site.
            </p>
            <PreferenceRow
              title="Necessary security cookies"
              description="Session and CSRF protections are required only when you use a private RipoDoc workspace. They cannot be disabled from this panel."
              status="Always active"
            />
            <PreferenceRow
              title="Analytics and marketing"
              description="No analytics, advertising, replay, support-chat, or marketing cookies are loaded by the reviewed public site."
              status="Not in use"
            />
            <p className="text-xs leading-5 text-[#665f56]">
              Review the current <Link href="/legal/cookies" className="font-semibold text-[#1d1a16] underline decoration-[#2f5bea] underline-offset-4">cookie information</Link>. If RipoDoc introduces an optional provider, this screen and the published data-flow information must change before that provider is activated.
            </p>
          </div>
          <div className="grid gap-2 border-t border-[#1d1a16]/15 bg-[#f6f0e5] px-5 py-4 sm:grid-cols-2 sm:px-6">
            <button
              type="button"
              onClick={() => saveChoice('rejected')}
              className="inline-flex min-h-11 items-center justify-center border border-[#1d1a16] bg-[#fffdf8] px-4 text-sm font-bold text-[#1d1a16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => saveChoice('accepted')}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-4 text-sm font-bold text-[#fffdf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
            >
              <Check className="size-4" aria-hidden="true" /> Accept
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <aside
      className="fixed bottom-3 left-3 z-50 w-[calc(100%-1.5rem)] max-w-xl border border-[#1d1a16] bg-[#fffdf8] p-4 text-[#1d1a16] shadow-[7px_7px_0_#1d1a16] sm:bottom-6 sm:left-6 sm:p-5"
      aria-labelledby="cookie-notice-title"
      role="region"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center border border-[#1d1a16] bg-[#1d1a16] text-[#f6f0e5]" aria-hidden="true">
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f5bea]">Cookie choice</p>
          <h2 id="cookie-notice-title" className="mt-1 text-base font-bold tracking-[-0.02em]">Necessary cookies, explained.</h2>
          <p className="mt-2 text-sm leading-6 text-[#4b463e]">
            RipoDoc uses necessary security cookies only on private-workspace routes: an authenticated session and CSRF protection. The public site does not load analytics, advertising, replay, chat, or marketing cookies.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#665f56]">
            Accept or reject optional categories—none are active today—or <Link href="/legal/cookies" className="font-semibold text-[#1d1a16] underline decoration-[#2f5bea] underline-offset-4">read the cookie information</Link>.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <button
          type="button"
          onClick={() => saveChoice('accepted')}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-4 text-sm font-bold text-[#fffdf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
        >
          <Check className="size-4" aria-hidden="true" /> Accept
        </button>
        <button
          type="button"
          onClick={() => saveChoice('rejected')}
          className="inline-flex min-h-11 items-center justify-center border border-[#1d1a16] bg-[#fffdf8] px-4 text-sm font-bold text-[#1d1a16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => setView('settings')}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#1d1a16]/30 bg-[#f6f0e5] px-4 text-sm font-bold text-[#1d1a16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Cookie settings
        </button>
      </div>
    </aside>
  );
}

function PreferenceRow({ title, description, status }: { readonly title: string; readonly description: string; readonly status: string }) {
  return (
    <section className="border border-[#1d1a16]/20 bg-white/55 p-4" aria-label={title}>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-bold text-[#1d1a16]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#4b463e]">{description}</p>
        </div>
        <span className="shrink-0 border border-[#1d1a16]/20 bg-[#f6f0e5] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#4b463e]">{status}</span>
      </div>
    </section>
  );
}
