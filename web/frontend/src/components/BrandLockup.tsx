import Image from 'next/image';

interface BrandLockupProps {
  readonly compact?: boolean;
  readonly showDescriptor?: boolean;
  readonly className?: string;
}

export function BrandLockup({ compact = false, showDescriptor = false, className = '' }: BrandLockupProps) {
  const iconSize = compact ? 34 : 42;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <Image
          src="/ripodoc-logo.jpeg"
          alt=""
          width={iconSize}
          height={iconSize}
          className="h-auto w-auto object-contain"
          priority
        />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block whitespace-nowrap text-[1.15rem] font-bold tracking-[-0.065em] text-[#11162E]">
          Ripo<span className="font-medium">Doc</span>
        </span>
        {showDescriptor && (
          <span className="mt-1 block whitespace-nowrap text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            MSP reporting intelligence
          </span>
        )}
      </span>
    </span>
  );
}
