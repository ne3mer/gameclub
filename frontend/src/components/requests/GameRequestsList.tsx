'use client';

import { Icon } from '@/components/icons/Icon';
import type { GameRequest } from '@/lib/api/game-requests';

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار بررسی',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'clock' as const,
    iconColor: 'text-amber-500'
  },
  approved: {
    label: 'تایید شده',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'check' as const,
    iconColor: 'text-blue-500'
  },
  rejected: {
    label: 'رد شده',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: 'x' as const,
    iconColor: 'text-red-500'
  },
  fulfilled: {
    label: 'موجود شد! 🎉',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: 'gift' as const,
    iconColor: 'text-emerald-500'
  }
};

interface GameRequestsListProps {
  requests: GameRequest[];
  onDelete?: (id: string) => void;
}

export function GameRequestsList({ requests, onDelete }: GameRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Icon name="game" size={32} className="text-slate-400" />
        </div>
        <h3 className="mb-2 text-xl font-black text-slate-900">هنوز درخواستی نداری</h3>
        <p className="text-slate-600">بازی مورد نظرت رو پیدا نکردی؟ درخواست بده!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const statusConfig = STATUS_CONFIG[request.status];
        
        return (
          <div
            key={request._id}
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Game Name */}
                <h3 className="mb-2 text-xl font-black text-slate-900">{request.gameName}</h3>
                
                {/* Platform & Region */}
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                    <Icon name="layers" size={12} />
                    {request.platform}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                    <Icon name="globe" size={12} />
                    {request.region}
                  </span>
                </div>

                {/* Description */}
                {request.description && (
                  <p className="mb-3 text-sm text-slate-600 line-clamp-2">{request.description}</p>
                )}

                {/* Admin Response */}
                {request.adminResponse && (
                  <div className="mb-3 rounded-2xl border border-purple-100 bg-purple-50 p-4">
                    <div className="mb-1 flex items-center gap-2 text-xs font-bold text-purple-700">
                      <Icon name="message" size={14} />
                      پاسخ ادمین:
                    </div>
                    <p className="text-sm text-purple-900">{request.adminResponse}</p>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    ثبت شده: {new Date(request.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                  {request.respondedAt && (
                    <span>
                      پاسخ داده شده: {new Date(request.respondedAt).toLocaleDateString('fa-IR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col items-end gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${statusConfig.color}`}>
                  <Icon name={statusConfig.icon} size={14} className={statusConfig.iconColor} />
                  {statusConfig.label}
                </span>

                {request.status === 'pending' && onDelete && (
                  <button
                    onClick={() => onDelete(request._id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <Icon name="trash" size={14} className="inline ml-1" />
                    حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
