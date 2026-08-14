import Image from 'next/image';

interface BrandLockupProps {
  readonly compact?: boolean;
  readonly showDescriptor?: boolean;
  readonly className?: string;
}

export function BrandLockup({ compact = false, showDescriptor = false, className = '' }: BrandLockupProps) {
  const iconSize = compact ? 34 : 42;

  return <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <span className="relative flex shrink-0 items-center justify-center overflow-hidden border border-[#1d1a16] bg-[#fffdf8] shadow-[2px_2px_0_#1d1a16]">
      <Image src="/ripodoc-mark.png" alt="" width={iconSize} height={iconSize} className="h-full w-full object-contain p-0.5" priority />
    </span>
    <span className="min-w-0 leading-none">
      <span className="block whitespace-nowrap font-serif text-[1.25rem] font-bold tracking-[-0.08em] text-[#1d1a16]">Ripo<span className="font-medium text-[#d9503b]">Doc</span></span>
      {showDescriptor && <span className="mt-1 block whitespace-nowrap font-mono text-[0.55rem] font-bold uppercase tracking-[0.13em] text-[#5f594f]">Controlled report evidence</span>}
    </span>
  </span>;
}
