'use client';

import { SlidersHorizontal } from 'lucide-react';
import { OPEN_COOKIE_SETTINGS_EVENT } from '@/components/CookieNotice.tsx';

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="inline-flex items-center gap-1.5 text-left text-xs text-white/55 underline decoration-white/30 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#efd66b]"
    >
      <SlidersHorizontal className="size-3.5" aria-hidden="true" /> Cookie settings
    </button>
  );
}
