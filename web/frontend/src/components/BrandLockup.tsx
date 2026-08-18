import Image from 'next/image';

interface BrandLockupProps {
  readonly compact?: boolean;
  readonly showDescriptor?: boolean;
  readonly inverse?: boolean;
  readonly className?: string;
}

/**
 * Shared, dimension-bounded brand lockup.
 *
 * The mark always sits inside an explicit square frame. This prevents a
 * percentage-sized image from inheriting an unconstrained flex height in
 * navigation while preserving the full lockup on footer and product surfaces.
 */
export function BrandLockup({ compact = false, showDescriptor = false, inverse = false, className = '' }: BrandLockupProps) {
  const iconSize = compact ? 40 : 48;
  const iconFrame = compact ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-12 w-12';
  const wordTone = inverse ? 'text-[#fffdf8]' : 'text-[#141111]';
  const mottoTone = inverse ? 'text-[#ffb2a3]' : 'text-[#b52e20]';
  const wordSize = compact ? 'text-[1.06rem] sm:text-[1.12rem]' : 'text-[1.35rem]';
  const mottoSize = compact ? 'text-[0.47rem] sm:text-[0.5rem]' : 'text-[0.54rem]';

  return <span className={`inline-flex max-w-full items-center ${compact ? 'gap-2.5' : 'gap-3'} ${className}`}>
    <span className={`grid shrink-0 place-items-center ${iconFrame}`} aria-hidden="true">
      <Image src="/ripodoc-mark.svg" alt="" width={iconSize} height={iconSize} className="block h-full w-full" priority />
    </span>
    <span className="min-w-0 leading-none">
      <span className={`block whitespace-nowrap font-extrabold tracking-[-0.08em] ${wordSize} ${wordTone}`}>RipoDoc</span>
      <span className={`mt-1 block whitespace-nowrap font-mono font-bold uppercase tracking-[0.15em] ${mottoSize} ${mottoTone}`}>From report to reality.</span>
      {showDescriptor && <span className={`mt-2 block max-w-48 text-[0.68rem] leading-4 ${inverse ? 'text-[#f8f0df]/70' : 'text-[#655c55]'}`}>Controlled evidence delivery for MSP client reports.</span>}
    </span>
  </span>;
}
