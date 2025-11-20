import Image from 'next/image';
import Link from 'next/link';
import { formatToman } from '@/lib/format';
import type { GameDetail } from '@/data/catalog';

interface Props {
  game: GameDetail;
}

export const CatalogGameCard = ({ game }: Props) => {
  return (
    <article className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl">
        <Image src={game.cover} alt={game.title} fill sizes="360px" className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute right-3 top-3 flex gap-2 text-xs">
          <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-slate-900">{game.region}</span>
          {game.isSafe && <span className="rounded-full bg-emerald-500/90 px-3 py-1 font-semibold text-white">Safe</span>}
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{game.title}</h3>
          <p className="text-xs text-slate-500">{game.features.slice(0, 2).join(' • ')}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {game.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-50 px-3 py-1 font-semibold text-slate-600">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold text-slate-900">
            {formatToman(game.price)}
            <span className="mr-1 text-base font-medium text-slate-500">تومان</span>
          </p>
          {game.safePrice && (
            <p className="text-xs text-slate-500">Safe Account از {formatToman(game.safePrice)} تومان</p>
          )}
        </div>
        <div className="mt-auto flex items-center gap-3">
          <Link href={`/games/${game.slug}`} className="flex-1 rounded-2xl bg-slate-900 py-2 text-center text-sm font-semibold text-white">
            جزییات + خرید
          </Link>
          <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">افزودن</button>
        </div>
      </div>
    </article>
  );
};
