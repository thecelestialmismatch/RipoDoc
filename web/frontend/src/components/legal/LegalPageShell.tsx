import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { legalStatusNotice } from '@/lib/launch/legal.ts';

export function LegalPageShell(input: { readonly eyebrow: string; readonly title: string; readonly summary: string; readonly children: ReactNode }) { return <div className="dense-legal-document"><section className="dense-legal-document-head"><div><Link href="/legal"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Legal status archive</Link><p className="dense-kicker">{input.eyebrow}</p><h1>{input.title}</h1><p>{input.summary}</p></div><aside><span>PUBLIC DOCUMENT</span><b>STATUS / READING MODE</b><i aria-hidden="true" /><p>Long-form operational information remains readable while the surrounding site uses a live product system.</p></aside></section><main><div className="dense-legal-status"><ShieldCheck className="h-5 w-5" aria-hidden="true" /><p><strong>Current status:</strong> {legalStatusNotice}</p></div><article>{input.children}</article></main></div>; }
export function LegalSection(input: { readonly title: string; readonly children: ReactNode }) { return <section className="dense-legal-section"><h2>{input.title}</h2><div>{input.children}</div></section>; }
export function DecisionList(input: { readonly items: readonly string[] }) { return <ul className="dense-decision-list">{input.items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ul>; }
