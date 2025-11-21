import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/filters/SearchBar";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CreativeBanner } from "@/components/sections/CreativeBanner";
import { DynamicBanner } from "@/components/banners/DynamicBanner";
import { NewArrivalsSection } from "@/components/sections/NewArrivalsSection";
import { PopularGamesSection } from "@/components/sections/PopularGamesSection";
import { CategoriesSection, type CategoryHighlight } from "@/components/sections/CategoriesSection";
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
import { categories as defaultCategories } from "@/data/home";
import { formatToman } from "@/lib/format";
import { API_BASE_URL } from "@/lib/api";
import { Icon } from "@/components/icons/Icon";

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

const fetchCategories = async (): Promise<CategoryHighlight[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories?active=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error("Failed to load categories");
    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];
    return data.map((category: any) => ({
      id: category.id ?? category._id ?? category.slug,
      name: category.name ?? category.title ?? category.nameEn ?? "دسته‌بندی",
      slug: category.slug ?? "",
      description: category.description ?? "",
      icon: category.icon ?? "🎮",
      color: category.color ?? "blue",
    }));
  } catch (error) {
    console.warn("Categories unavailable:", error);
    return defaultCategories;
  }
};

type Spotlight = {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
};

function SpotlightTiles({ highlights }: { highlights: Spotlight[] }) {
  const accentColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-500/30'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      glow: 'shadow-indigo-500/30'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-200',
      glow: 'shadow-purple-500/30'
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-700 to-slate-800',
      text: 'text-slate-700',
      border: 'border-slate-200',
      glow: 'shadow-slate-500/30'
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {highlights.map((highlight) => {
        const colors = accentColors[highlight.accent] || accentColors.emerald;
        return (
          <Link
            key={highlight.id}
            href={highlight.href}
            className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 transition hover:shadow-2xl"
          >
            <div className={`absolute top-0 right-0 h-32 w-32 rounded-full ${colors.bg} opacity-10 blur-3xl transition group-hover:opacity-20`} />
            <div className="relative">
              <h3 className="mb-3 text-2xl font-black text-slate-900">
                {highlight.title}
              </h3>
              <p className="mb-4 text-slate-600 leading-relaxed">
                {highlight.description}
              </p>
              <div className={`inline-flex items-center gap-2 text-sm font-bold ${colors.text} transition group-hover:gap-3`}>
                <span>مشاهده بیشتر</span>
                <Icon name="arrow-left" size={16} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProductShowcase({ games }: { games: BackendGame[] }) {
  if (!games || games.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900">جدیدترین بازی‌ها</h2>
          <p className="mt-2 text-slate-600">تازه‌ترین بازی‌های اضافه شده به کاتالوگ</p>
        </div>
        <Link
          href="/games"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {games.map((game, index) => {
          const gradients = [
            'from-purple-500/10 to-pink-500/10',
            'from-blue-500/10 to-cyan-500/10',
            'from-emerald-500/10 to-teal-500/10'
          ];
          
          return (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:shadow-2xl"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${gradients[index % 3]}">
                {game.coverUrl ? (
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`flex h-full items-center justify-center bg-gradient-to-br ${gradients[index % 3]}`}>
                    <Icon name="game" size={48} className="text-slate-400" />
                  </div>
                )}
                
                {/* Platform Badge */}
                <div className="absolute top-4 right-4 rounded-full border border-white/20 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-slate-900">
                  {game.platform}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-2 text-xl font-black text-slate-900 line-clamp-1">
                  {game.title}
                </h3>
                <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                  {game.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-600">
                    {formatToman(game.basePrice)}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 transition group-hover:text-emerald-600">
                    <span>خرید</span>
                    <Icon name="arrow-left" size={16} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [marketingSnapshot, homeSettings, featuredGames, categories] = await Promise.all([
    fetchMarketingSnapshot(),
    fetchHomeSettings(),
    fetchFeaturedGames(),
    fetchCategories(),
  ]);

  const bannerContent = marketingSnapshot?.settings?.bannerContent ?? defaultBannerContent;
  const homeContent = homeSettings ?? defaultHomeContent;
  const categoriesDisplay = categories.length > 0 ? categories : defaultCategories;

  const heroSlides: HeroContent[] =
    homeContent.heroSlides && homeContent.heroSlides.length > 0
      ? homeContent.heroSlides
      : [homeContent.hero];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl space-y-20 px-6 py-12 md:px-8">
          
          {/* Hero Carousel */}
          <section className="w-full">
            <HeroCarousel slides={heroSlides} />
          </section>

          {/* Dynamic Banners */}
          <section className="w-full">
            <DynamicBanner page="home" />
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
            <CategoriesSection categories={categoriesDisplay} />
          </section>

          {/* Trust Signals */}
          <section className="w-full">
            <TrustSection signals={homeContent.trustSignals} />
          </section>

          {/* Testimonials */}
          <section className="w-full">
            <TestimonialsSection testimonials={homeContent.testimonials} />
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
