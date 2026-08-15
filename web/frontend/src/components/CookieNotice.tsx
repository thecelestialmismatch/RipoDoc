'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';

const ACKNOWLEDGEMENT_KEY = 'ripodoc-essential-cookie-notice-v1';

/**
 * RipoDoc presently uses only necessary authentication and CSRF cookies on
 * routes that require them. This component is deliberately a notice—not a
 * misleading consent gate—because optional analytics, advertising, replay,
 * chat, and marketing cookies are not loaded by the public site.
 */
export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Deferring the read avoids a synchronous state update during the effect
    // while retaining deterministic server rendering and a transparent fallback.
    const timer = window.setTimeout(() => {
      try {
        setOpen(window.localStorage.getItem(ACKNOWLEDGEMENT_KEY) !== 'acknowledged');
      } catch {
        // If storage is unavailable, keep the transparent notice visible.
        setOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const acknowledge = () => {
    try {
      window.localStorage.setItem(ACKNOWLEDGEMENT_KEY, 'acknowledged');
    } catch {
      // Closing still respects the visitor's immediate choice if storage fails.
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <aside
      className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-md border border-[#1d1a16]/20 bg-[#fffdf8] p-4 text-[#1d1a16] shadow-[8px_8px_0_#1d1a16] sm:bottom-6 sm:left-6"
      aria-labelledby="cookie-notice-title"
      role="dialog"
      aria-modal="false"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center border border-[#1d1a16] bg-[#1d1a16] text-[#f6f0e5]" aria-hidden="true">
          <ShieldCheck className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="cookie-notice-title" className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f5bea]">Essential cookies, explained</p>
          <p className="mt-2 text-sm leading-6 text-[#4b463e]">
            RipoDoc currently uses only necessary security cookies on routes that need them: an authenticated session and CSRF protection. We do not load advertising, analytics, replay, chat, or marketing cookies on this public site.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#665f56]">
            <Link href="/legal/cookies" className="font-semibold text-[#1d1a16] underline decoration-[#2f5bea] underline-offset-4">Read the cookie status</Link>{' '}
            before using a private workspace or sharing information.
          </p>
        </div>
        <button
          type="button"
          onClick={acknowledge}
          className="grid size-8 shrink-0 place-items-center border border-transparent text-[#665f56] hover:border-[#1d1a16] hover:text-[#1d1a16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
          aria-label="Dismiss essential cookie notice"
        >
          <X className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={acknowledge}
        className="mt-4 inline-flex min-h-10 items-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-3 text-xs font-bold uppercase tracking-[0.12em] text-[#f6f0e5] hover:bg-[#2f5bea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f5bea]"
      >
        <Check className="size-3.5" /> I understand
      </button>
    </aside>
  );
}
