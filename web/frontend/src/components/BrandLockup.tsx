import Image from 'next/image';

interface BrandLockupProps {
  readonly compact?: boolean;
  readonly showDescriptor?: boolean;
  readonly inverse?: boolean;
  readonly className?: string;
}

export function BrandLockup({ compact = false, showDescriptor = false, inverse = false, className = '' }: BrandLockupProps) {
  const iconSize = compact ? 36 : 44;
  const wordTone = inverse ? 'text-[#fffdf8]' : 'text-[#141111]';
  const mottoTone = inverse ? 'text-[#ff9b88]' : 'text-[#b52e20]';

  return <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden ${inverse ? 'bg-[#e8442e]' : 'bg-[#e8442e]'}`}>
      <Image src="/ripodoc-mark.svg" alt="" width={iconSize} height={iconSize} className="h-full w-full object-contain" priority />
    </span>
    <span className="min-w-0 leading-none">
      <span className={`block whitespace-nowrap text-[1.3rem] font-extrabold tracking-[-0.08em] ${wordTone}`}>RipoDoc</span>
      <span className={`mt-1 block whitespace-nowrap font-mono text-[0.52rem] font-bold uppercase tracking-[0.15em] ${mottoTone}`}>From report to reality.</span>
      {showDescriptor && <span className={`mt-2 block max-w-48 text-[0.68rem] leading-4 ${inverse ? 'text-[#f8f0df]/70' : 'text-[#655c55]'}`}>Controlled evidence delivery for MSP client reports.</span>}
    </span>
  </span>;
}
