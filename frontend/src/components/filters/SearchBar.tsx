'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const SearchBar = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const initial = params?.get('q') ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial);
  }, [params]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const url = query ? `/games?q=${encodeURIComponent(query)}` : '/games';
    router.push(url);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-[30px] border border-white/20 bg-white/10 p-4 text-sm text-white backdrop-blur"
    >
      <label className="text-xs uppercase tracking-[0.2em] text-emerald-200">جستجو در GameClub</label>
      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام بازی، ژانر یا منطقه..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/70 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-emerald-100"
        >
          جستجو
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-emerald-100">
        {['God of War', 'Spider-Man', 'Safe Account', 'EA FC 25'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setQuery(tag)}
            className="rounded-full border border-white/20 px-3 py-1"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};
