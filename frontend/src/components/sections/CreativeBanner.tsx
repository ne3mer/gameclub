import Link from 'next/link';
import type { BannerContent } from '@/data/marketing';
import { defaultBannerContent } from '@/data/marketing';

interface Props {
  content?: BannerContent;
}

export const CreativeBanner = ({ content = defaultBannerContent }: Props) => {
  return (
    <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0f172a] via-[#0c4a6e] to-[#0d9488] p-10 text-white shadow-2xl">
      <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-8 hidden h-32 w-32 rotate-12 rounded-3xl border border-white/20 sm:block" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-emerald-200">{content.subtitle}</p>
          <h3 className="text-3xl font-black leading-tight">{content.title}</h3>
          <p className="max-w-xl text-sm text-slate-200">{content.description}</p>
          <div className="flex flex-wrap gap-3 text-xs">
            {content.perks.map((item) => (
              <span key={item} className="rounded-full border border-white/30 px-4 py-2">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex h-48 w-full max-w-sm flex-col justify-between rounded-3xl bg-white/10 p-6 text-sm shadow-inner">
          <div>
            <p className="text-emerald-200">{content.priceLabel}</p>
            <p className="mt-1 text-3xl font-black">{content.priceValue}</p>
            <p className="text-xs text-white/70">{content.badge}</p>
          </div>
          <Link href={content.ctaHref} className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-900">
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};
