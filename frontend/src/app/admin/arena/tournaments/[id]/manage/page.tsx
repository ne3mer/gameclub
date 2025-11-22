import { Metadata } from 'next';
import TournamentManageClient from './TournamentManageClient';

export const metadata: Metadata = {
  title: 'مدیریت تورنمنت | پنل ادمین',
  description: 'مدیریت شرکت‌کنندگان، براکت و نتایج تورنمنت',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function TournamentManagePage({ params }: PageProps) {
  return <TournamentManageClient tournamentId={params.id} />;
}
