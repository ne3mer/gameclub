import { defaultHomeContent } from '@/data/homeContent';
import type { HomeTrustSignal } from '@/types/admin';

type Props = {
  signals?: HomeTrustSignal[];
};

export const TrustSection = ({ signals = defaultHomeContent.trustSignals }: Props) => (
  <section className="rounded-[32px] bg-slate-900 px-8 py-10 text-white">
    <p className="text-sm text-emerald-300">چرا گیمرها به ما اعتماد می‌کنند؟</p>
    <h2 className="mt-2 text-2xl font-semibold">گارانتی واقعی برای اکانت قانونی</h2>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {signals.map((item) => (
        <article key={item.id} className="rounded-2xl bg-white/10 p-5">
          <div className="text-3xl">{item.icon}</div>
          <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-200">{item.description}</p>
        </article>
      ))}
    </div>
  </section>
);
