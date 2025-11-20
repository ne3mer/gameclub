'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { API_BASE_URL, ADMIN_API_KEY, adminHeaders } from '@/lib/api';
import type { HomeContentState } from '@/types/admin';
import { defaultHomeContent } from '@/data/homeContent';

const emptyMessage = 'برای ذخیره تغییرات، NEXT_PUBLIC_ADMIN_API_KEY باید تنظیم شود.';

const fallback = (value: string | undefined, def: string) => (value && value.trim().length ? value : def);

const sanitizeHomeContent = (payload: HomeContentState): HomeContentState => {
  const heroStats = payload.hero.stats
    .map((stat, index) => ({
      id: stat.id || crypto.randomUUID(),
      label: fallback(stat.label, `آمار ${index + 1}`),
      value: fallback(stat.value, '---')
    }))
    .filter((stat) => stat.label && stat.value);

  const stats = heroStats.length ? heroStats : defaultHomeContent.hero.stats;

  const spotlights = payload.spotlights
    .map((spotlight, index) => ({
      id: spotlight.id || crypto.randomUUID(),
      title: fallback(spotlight.title, `CTA ${index + 1}`),
      description: fallback(spotlight.description, 'توضیحات CTA'),
      href: fallback(spotlight.href, '/games'),
      accent: fallback(spotlight.accent, 'emerald')
    }))
    .filter((spotlight) => spotlight.title && spotlight.href);

  const trustSignals = payload.trustSignals
    .map((signal, index) => ({
      id: signal.id || crypto.randomUUID(),
      title: fallback(signal.title, `مزیت ${index + 1}`),
      description: fallback(signal.description, 'توضیحات مزیت'),
      icon: fallback(signal.icon, '✨')
    }))
    .filter((signal) => signal.title && signal.description);

  const testimonials = payload.testimonials.map((testimonial, index) => ({
    id: testimonial.id || crypto.randomUUID(),
    name: fallback(testimonial.name, `کاربر ${index + 1}`),
    handle: fallback(testimonial.handle, '@gameclub'),
    text: fallback(testimonial.text, 'تجربه مشتری...'),
    avatar: fallback(testimonial.avatar, defaultHomeContent.testimonials[0].avatar),
    highlight: testimonial.highlight ?? false
  }));

  return {
    hero: {
      badge: fallback(payload.hero.badge, defaultHomeContent.hero.badge),
      title: fallback(payload.hero.title, defaultHomeContent.hero.title),
      subtitle: fallback(payload.hero.subtitle, defaultHomeContent.hero.subtitle),
      primaryCta: {
        label: fallback(payload.hero.primaryCta.label, defaultHomeContent.hero.primaryCta.label),
        href: fallback(payload.hero.primaryCta.href, defaultHomeContent.hero.primaryCta.href)
      },
      secondaryCta: {
        label: fallback(payload.hero.secondaryCta.label, defaultHomeContent.hero.secondaryCta.label),
        href: fallback(payload.hero.secondaryCta.href, defaultHomeContent.hero.secondaryCta.href)
      },
      stats
    },
    spotlights: spotlights.length ? spotlights : defaultHomeContent.spotlights,
    trustSignals: trustSignals.length ? trustSignals : defaultHomeContent.trustSignals,
    testimonials: testimonials.length ? testimonials : defaultHomeContent.testimonials
  };
};

export default function AdminHomePage() {
  const [content, setContent] = useState<HomeContentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchHomeContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/home`);
        if (!response.ok) {
          throw new Error('دریافت تنظیمات صفحه با خطا مواجه شد.');
        }
        const payload = await response.json();
        const settings = payload?.data?.settings;
        setContent(settings ?? defaultHomeContent);
      } catch (error) {
        console.error(error);
        setContent(defaultHomeContent);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  const updateSection = <K extends keyof HomeContentState>(section: K, value: HomeContentState[K]) => {
    setContent((prev) => (prev ? { ...prev, [section]: value } : prev));
  };

  const handleHeroField = (field: keyof HomeContentState['hero'], value: string) => {
    if (!content) return;
    updateSection('hero', { ...content.hero, [field]: value });
  };

  const handleHeroStatChange = (index: number, field: 'label' | 'value', value: string) => {
    if (!content) return;
    const stats = [...content.hero.stats];
    stats[index] = { ...stats[index], [field]: value };
    updateSection('hero', { ...content.hero, stats });
  };

  const addHeroStat = () => {
    if (!content) return;
    const stats = [
      ...content.hero.stats,
      { id: crypto.randomUUID(), label: 'آیتم جدید', value: '---' }
    ];
    updateSection('hero', { ...content.hero, stats });
  };

  const removeHeroStat = (index: number) => {
    if (!content) return;
    const stats = content.hero.stats.filter((_, i) => i !== index);
    updateSection('hero', { ...content.hero, stats });
  };

  const updateArrayItem = <K extends 'spotlights' | 'trustSignals' | 'testimonials'>(
    section: K,
    index: number,
    payload: Partial<HomeContentState[K][number]>
  ) => {
    if (!content) return;
    const next = [...content[section]];
    next[index] = { ...next[index], ...payload } as (typeof next)[number];
    updateSection(section, next);
  };

  const addArrayItem = <K extends 'spotlights' | 'trustSignals' | 'testimonials'>(
    section: K,
    template: HomeContentState[K][number]
  ) => {
    if (!content) return;
    const next = [...content[section], template];
    updateSection(section, next);
  };

  const removeArrayItem = <K extends 'spotlights' | 'trustSignals' | 'testimonials'>(section: K, index: number) => {
    if (!content) return;
    const next = content[section].filter((_, i) => i !== index);
    updateSection(section, next);
  };

  const handleSave = async () => {
    if (!content) return;
    if (!ADMIN_API_KEY) {
      setStatus(emptyMessage);
      return;
    }
    setSaving(true);
    setStatus('');
    const payload = sanitizeHomeContent(content);
    try {
      const response = await fetch(`${API_BASE_URL}/api/home`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'ذخیره تغییرات با مشکل روبه‌رو شد.');
      }
      setStatus('تغییرات با موفقیت ذخیره شد.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ذخیره ممکن نیست.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        در حال بارگذاری تنظیمات صفحه اصلی...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">مدیریت محتوای صفحه اصلی</h1>
        <p className="text-sm text-slate-500">
          متن، CTA‌ها و بلاک‌های اعتماد/تجربه کاربری را به‌صورت زنده تغییر دهید.
        </p>
      </header>

      {status && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${status.includes('موفق') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {status}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Hero Section</h2>
          <div className="mt-4 space-y-4 text-sm">
            <label className="block">
              برچسب
              <input
                value={content.hero.badge}
                onChange={(e) => handleHeroField('badge', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block">
              عنوان اصلی
              <input
                value={content.hero.title}
                onChange={(e) => handleHeroField('title', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <label className="block">
              توضیح
              <textarea
                value={content.hero.subtitle}
                onChange={(e) => handleHeroField('subtitle', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                rows={3}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                CTA اصلی
                <input
                  value={content.hero.primaryCta.label}
                  onChange={(e) =>
                    updateSection('hero', {
                      ...content.hero,
                      primaryCta: { ...content.hero.primaryCta, label: e.target.value }
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={content.hero.primaryCta.href}
                  onChange={(e) =>
                    updateSection('hero', {
                      ...content.hero,
                      primaryCta: { ...content.hero.primaryCta, href: e.target.value }
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <label className="block">
                CTA ثانویه
                <input
                  value={content.hero.secondaryCta.label}
                  onChange={(e) =>
                    updateSection('hero', {
                      ...content.hero,
                      secondaryCta: { ...content.hero.secondaryCta, label: e.target.value }
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={content.hero.secondaryCta.href}
                  onChange={(e) =>
                    updateSection('hero', {
                      ...content.hero,
                      secondaryCta: { ...content.hero.secondaryCta, href: e.target.value }
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">آمار نمایش داده‌شده</span>
                <button
                  type="button"
                  onClick={addHeroStat}
                  className="text-xs font-bold text-emerald-600"
                >
                  + افزودن
                </button>
              </div>
              {content.hero.stats.map((stat, index) => (
                <div key={stat.id} className="grid gap-2 rounded-xl bg-white p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>بلاک #{index + 1}</span>
                    <button type="button" className="text-rose-500" onClick={() => removeHeroStat(index)}>
                      حذف
                    </button>
                  </div>
                  <input
                    value={stat.label}
                    onChange={(e) => handleHeroStatChange(index, 'label', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  />
                  <input
                    value={stat.value}
                    onChange={(e) => handleHeroStatChange(index, 'value', e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <SectionHeader
            title="کال‌تو‌اکشن‌ها"
            description="سه بلاک CTA که در صفحه اصلی نمایش داده می‌شود."
            onAdd={() =>
              addArrayItem('spotlights', {
                id: crypto.randomUUID(),
                title: 'تیتر جدید',
                description: 'توضیح کوتاه...',
                href: '/games',
                accent: 'emerald'
              })
            }
          />
          <div className="space-y-3 text-sm">
            {content.spotlights.map((spotlight, index) => (
              <div key={spotlight.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>بلاک #{index + 1}</span>
                  <button className="text-rose-500" onClick={() => removeArrayItem('spotlights', index)}>
                    حذف
                  </button>
                </div>
                <input
                  value={spotlight.title}
                  onChange={(e) => updateArrayItem('spotlights', index, { title: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
                />
                <textarea
                  value={spotlight.description}
                  onChange={(e) => updateArrayItem('spotlights', index, { description: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
                  rows={2}
                />
                <input
                  value={spotlight.href}
                  onChange={(e) => updateArrayItem('spotlights', index, { href: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
                />
                <select
                  value={spotlight.accent}
                  onChange={(e) => updateArrayItem('spotlights', index, { accent: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs"
                >
                  <option value="emerald">سبز</option>
                  <option value="indigo">بنفش</option>
                  <option value="slate">خاکستری</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ContentListEditor
          title="دلایل اعتماد"
          description="این آیتم‌ها در بخش Trust نمایش داده می‌شود."
          items={content.trustSignals}
          onAdd={() =>
            addArrayItem('trustSignals', {
              id: crypto.randomUUID(),
              title: 'عنوان جدید',
              description: 'توضیح کوتاه...',
              icon: '✨'
            })
          }
          onChange={(index, payload) => updateArrayItem('trustSignals', index, payload)}
          onRemove={(index) => removeArrayItem('trustSignals', index)}
          fields={[
            { key: 'title', label: 'عنوان' },
            { key: 'description', label: 'توضیح', textarea: true },
            { key: 'icon', label: 'آیکن (Emoji)' }
          ]}
        />
        <ContentListEditor
          title="نظرات کاربران"
          description="بلوک تستیمونیال‌ها در صفحه خانه."
          items={content.testimonials}
          onAdd={() =>
            addArrayItem('testimonials', {
              id: crypto.randomUUID(),
              name: 'کاربر جدید',
              handle: '@handle',
              text: 'متن نظر...',
              avatar: 'https://i.pravatar.cc/100?img=1',
              highlight: false
            })
          }
          onChange={(index, payload) => updateArrayItem('testimonials', index, payload)}
          onRemove={(index) => removeArrayItem('testimonials', index)}
          fields={[
            { key: 'name', label: 'نام' },
            { key: 'handle', label: 'هندل' },
            { key: 'text', label: 'متن', textarea: true },
            { key: 'avatar', label: 'URL آواتار' }
          ]}
          extra={(item, index) => (
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={item.highlight ?? false}
                onChange={(e) => updateArrayItem('testimonials', index, { highlight: e.target.checked })}
              />
              نمایش به‌صورت Highlight
            </label>
          )}
        />
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره کل تغییرات'}
        </button>
      </div>
    </div>
  );
}

const SectionHeader = ({
  title,
  description,
  onAdd
}: {
  title: string;
  description: string;
  onAdd?: () => void;
}) => (
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    {onAdd && (
      <button onClick={onAdd} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
        + آیتم جدید
      </button>
    )}
  </div>
);

type GenericContentItem = { id: string } & Record<string, unknown>;

const ContentListEditor = ({
  title,
  description,
  items,
  onAdd,
  onChange,
  onRemove,
  fields,
  extra
}: {
  title: string;
  description: string;
  items: GenericContentItem[];
  onAdd: () => void;
  onChange: (index: number, payload: Record<string, unknown>) => void;
  onRemove: (index: number) => void;
  fields: Array<{ key: string; label: string; textarea?: boolean }>;
  extra?: (item: GenericContentItem, index: number) => ReactNode;
}) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    <SectionHeader title={title} description={description} onAdd={onAdd} />
    <div className="space-y-3 text-sm">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>آیتم #{index + 1}</span>
            <button className="text-rose-500" onClick={() => onRemove(index)}>
              حذف
            </button>
          </div>
          {fields.map((field) =>
            field.textarea ? (
              <textarea
                key={field.key}
                value={String(item[field.key] ?? '')}
                onChange={(e) => onChange(index, { [field.key]: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
                rows={2}
              />
            ) : (
              <input
                key={field.key}
                value={String(item[field.key] ?? '')}
                onChange={(e) => onChange(index, { [field.key]: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2"
              />
            )
          )}
          {extra && <div className="mt-2">{extra(item, index)}</div>}
        </div>
      ))}
    </div>
  </div>
);
