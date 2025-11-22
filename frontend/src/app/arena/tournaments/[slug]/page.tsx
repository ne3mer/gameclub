import { Metadata } from 'next';
import TournamentDetailsClient from './TournamentDetailsClient';

export const metadata: Metadata = {
  title: 'جزئیات تورنمنت | آرنا',
  description: 'مشاهده جزئیات تورنمنت و ثبت‌نام',
};

export default function TournamentDetailsPage({ params }: { params: { slug: string } }) {
  return <TournamentDetailsClient slug={params.slug} />;
}
