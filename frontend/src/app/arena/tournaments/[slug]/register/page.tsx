import { Metadata } from 'next';
import TournamentRegisterClient from './TournamentRegisterClient';

export const metadata: Metadata = {
  title: 'ثبت‌نام در تورنمنت | آرنا',
  description: 'ثبت‌نام در تورنمنت و پرداخت هزینه ورودی',
};

export default function TournamentRegisterPage({ params }: { params: { slug: string } }) {
  return <TournamentRegisterClient slug={params.slug} />;
}
