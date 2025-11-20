import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/filters/SearchBar";
import { CreativeBanner } from "@/components/sections/CreativeBanner";
import { DynamicBanner } from "@/components/banners/DynamicBanner";
import { NewArrivalsSection } from "@/components/sections/NewArrivalsSection";
import { PopularGamesSection } from "@/components/sections/PopularGamesSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { defaultBannerContent, type BannerContent } from "@/data/marketing";
import {
  defaultHomeContent,
  type HomeContent,
  type HeroContent,
  type Spotlight as CMSHighlight,
} from "@/data/homeContent";
import { formatToman } from "@/lib/format";
import { API_BASE_URL } from "@/lib/api";

type MarketingSnapshot = {
  settings: {
    bannerContent: BannerContent;
  };
};

const fetchMarketingSnapshot = async (): Promise<MarketingSnapshot | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/marketing`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) throw new Error("Failed to load marketing settings");
    const payload = await response.json();
    return payload?.data ?? null;
  } catch (error) {
    console.warn("Marketing snapshot unavailable:", error);
    return null;
  }
};

const fetchHomeSettings = async (): Promise<HomeContent | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) throw new Error("Failed to load home content");
    const payload = await response.json();
    return payload?.data?.settings ?? null;
  } catch (error) {
    console.warn("Home content unavailable:", error);
    return null;
  }
};

type BackendGame = {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string[];
  platform: string;
  regionOptions: string[];
  basePrice: number;
  safeAccountAvailable: boolean;
  coverUrl?: string;
  tags: string[];
};

const fetchFeaturedGames = async (): Promise<BackendGame[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/games?sort=-createdAt&limit=3`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!response.ok) throw new Error("Failed to load games");
    const payload = await response.json();
    return payload?.data ?? [];
  } catch (error) {
    console.warn("Games unavailable:", error);
    return [];
  }
};

export default async function HomePage() {
  const [snapshot, homeSettings, featuredGames] = await Promise.all([
    fetchMarketingSnapshot(),
    fetchHomeSettings(),
    fetchFeaturedGames(),
  ]);
  const bannerContent =
    snapshot?.settings?.bannerContent ?? defaultBannerContent;
  const homeContent = homeSettings ?? defaultHomeContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex flex-col gap-16 px-4 py-12 md:px-8 z-10">
        {/* Hero Section */}
        <section className="w-full">
          <HeroShowcase hero={homeContent.hero} />
        </section>

        {/* Dynamic Banners */}
        <section className="w-full">
          <DynamicBanner page="home" />
        </section>

        {/* Search Bar */}
        <section className="relative z-10 w-full">
          <SearchBar />
        </section>

        {/* Spotlight Tiles */}
        <section className="w-full">
          <SpotlightTiles highlights={homeContent.spotlights} />
        </section>

        {/* Featured Games Showcase */}
        <section className="w-full">
          <ProductShowcase games={featuredGames} />
        </section>

        {/* Marketing Banner */}
        <section className="w-full">
          <CreativeBanner content={bannerContent} />
        </section>

        {/* New Arrivals */}
        <section className="w-full">
          <NewArrivalsSection />
        </section>

        {/* Popular Games */}
        <section className="w-full">
          <PopularGamesSection />
        </section>

        {/* Categories */}
        <section className="w-full">
          <CategoriesSection />
        </section>

        {/* Trust Signals */}
        <section className="w-full">
          <TrustSection signals={homeContent.trustSignals} />
        </section>

        {/* Testimonials */}
        <section className="w-full">
          <TestimonialsSection testimonials={homeContent.testimonials} />
        </section>

        {/* Footer */}
        <footer className="w-full">
          <SiteFooter />
        </footer>
      </div>
    </div>
  );
}

const HeroShowcase = ({ hero }: { hero: HeroContent }) => {
  return (
    <section className="relative overflow-hidden rounded-[48px] border-2 border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 p-8 md:p-16 text-white shadow-2xl backdrop-blur-sm">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-emerald-400 blur-3xl animate-pulse" />
        <div className="absolute left-12 -bottom-20 h-80 w-80 rounded-full bg-blue-400 blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-purple-400 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 px-5 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-300">
              {hero.badge}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            {hero.title}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            {hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={hero.primaryCta.href}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                {hero.primaryCta.label}
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md p-6 w-full lg:max-w-md">
          <p className="col-span-2 text-sm font-semibold text-emerald-300 mb-2">
            📊 آمار زنده
          </p>
          {hero.stats.map((stat) => (
            <div
              key={stat.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10"
            >
              <p className="text-xs font-semibold text-slate-400 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SpotlightTiles = ({ highlights }: { highlights: CMSHighlight[] }) => {
  if (!highlights.length) return null;

  const accentGradients = {
    emerald:
      "from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30",
    indigo:
      "from-indigo-500/20 via-indigo-500/10 to-transparent border-indigo-500/30",
    slate:
      "from-slate-500/20 via-slate-500/10 to-transparent border-slate-500/30",
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {highlights.map((block) => (
        <Link
          key={block.id}
          href={block.href}
          className="group relative overflow-hidden rounded-[32px] border-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
          style={{
            borderColor:
              block.accent === "emerald"
                ? "rgba(16, 185, 129, 0.3)"
                : block.accent === "indigo"
                ? "rgba(99, 102, 241, 0.3)"
                : "rgba(148, 163, 184, 0.3)",
          }}
        >
          {/* Animated Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              accentGradients[block.accent as keyof typeof accentGradients]
            } opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
          />

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-2xl">
                {block.accent === "emerald"
                  ? "⚡"
                  : block.accent === "indigo"
                  ? "🎮"
                  : "💎"}
              </div>
              <h3 className="text-xl font-black text-white">{block.title}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {block.description}
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <span>مشاهده</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />
        </Link>
      ))}
    </section>
  );
};

const ProductShowcase = ({ games }: { games: BackendGame[] }) => {
  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-400 mb-1">
            🎯 انتخاب ویژه
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            ویترین بازی‌های برتر
          </h2>
        </div>
        <Link
          href="/games"
          className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40"
        >
          <span>مرور همه</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {games.slice(0, 3).map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.slug}`}
            className="group relative overflow-hidden rounded-[36px] border-2 border-white/10 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
          >
            {/* Image Section */}
            <div className="relative h-64 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10" />
              <Image
                src={
                  game.coverUrl ||
                  "https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp"
                }
                alt={game.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Badges */}
              <div className="absolute left-4 top-4 z-20 flex gap-2">
                <span className="rounded-full bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-white border border-white/10">
                  {game.platform}
                </span>
                <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-black text-slate-900">
                  {game.regionOptions[0] || "R2"}
                </span>
              </div>

              {game.safeAccountAvailable && (
                <span className="absolute right-4 top-4 z-20 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                  SAFE
                </span>
              )}
            </div>

            {/* Content Section */}
            <div className="relative z-10 p-6 text-white">
              <h3 className="text-2xl font-black text-white mb-2 line-clamp-1">
                {game.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {game.description}
              </p>

              {/* Price */}
              <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-white/10 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {formatToman(game.basePrice)}
                  </span>
                  <span className="text-sm font-medium text-slate-300">
                    تومان
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {game.genre.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-300 border border-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-center text-sm font-black text-white transition-all duration-300 group-hover:from-emerald-400 group-hover:to-emerald-500">
                مشاهده و خرید
              </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
};
