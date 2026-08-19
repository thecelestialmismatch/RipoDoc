'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const SampleReportFixture = dynamic(
  () => import('./SampleReportFixture.tsx').then((module) => module.SampleReportFixture),
  {
    loading: () => <div className="min-h-80 animate-pulse border border-[#141111]/15 bg-[#f8f0df]" aria-label="Loading the interactive report sample" role="status" />,
  },
);

/**
 * Keep the public proof interaction and its fixture data out of the first
 * client bundle until a reader intentionally reaches it. The surrounding
 * explanation remains server-rendered and visible immediately.
 */
export function DeferredSampleReport() {
  const anchor = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = anchor.current;
    if (!node || shouldLoad) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: '360px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return <div ref={anchor}>{shouldLoad ? <SampleReportFixture /> : <button type="button" onClick={() => setShouldLoad(true)} className="flex min-h-80 w-full flex-col items-center justify-center border border-[#141111]/20 bg-[#f8f0df] px-6 text-center text-[#141111] transition hover:bg-[#f0dfcc] focus:outline-none focus:ring-2 focus:ring-[#141111] focus:ring-offset-4"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#b52e20]">Interactive fixture</span><span className="mt-3 text-xl font-bold tracking-[-0.04em]">Load the live proof experience</span><span className="mt-2 max-w-md text-sm leading-6 text-[#655c55]">The sample uses fixture data only. Open it when you are ready to inspect a selected claim, its approved evidence and its delivery receipt.</span></button>}</div>;
}
