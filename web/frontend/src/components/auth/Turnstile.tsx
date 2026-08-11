'use client';

import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'error-callback': () => void; 'expired-callback': () => void; theme: 'light' | 'dark' }) => void };
  }
}

interface Props { readonly siteKey?: string; }

export function Turnstile({ siteKey }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!siteKey || !host.current) return;
    const render = () => {
      if (!host.current || !window.turnstile || host.current.childElementCount > 0) return;
      window.turnstile.render(host.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => { const target = document.getElementById(inputId) as HTMLInputElement | null; if (target) target.value = token; },
        'error-callback': () => { const target = document.getElementById(inputId) as HTMLInputElement | null; if (target) target.value = ''; },
        'expired-callback': () => { const target = document.getElementById(inputId) as HTMLInputElement | null; if (target) target.value = ''; },
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-ripodoc-turnstile]');
    if (existing) { existing.addEventListener('load', render); render(); return () => existing.removeEventListener('load', render); }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.ripodocTurnstile = 'true';
    script.addEventListener('load', render);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', render);
  }, [inputId, siteKey]);

  if (!siteKey) return <input type="hidden" name="captcha" value="development-bypass" />;
  return <><input id={inputId} type="hidden" name="captcha" /><div ref={host} className="overflow-hidden rounded-xl" /></>;
}
