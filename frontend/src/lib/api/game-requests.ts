import { API_BASE_URL, adminHeaders } from '@/lib/api';

export interface GameRequest {
  _id: string;
  userId: string;
  gameName: string;
  platform: string;
  region: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  adminResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface GameRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  fulfilled: number;
}

export const createGameRequest = async (data: {
  gameName: string;
  platform: string;
  region: string;
  description: string;
}): Promise<GameRequest> => {
  const token = localStorage.getItem('gc_token');
  const response = await fetch(`${API_BASE_URL}/api/game-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'خطا در ثبت درخواست');
  }

  const result = await response.json();
  return result.data;
};

export const getUserGameRequests = async (): Promise<GameRequest[]> => {
  const token = localStorage.getItem('gc_token');
  const response = await fetch(`${API_BASE_URL}/api/game-requests`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('خطا در دریافت درخواست‌ها');
  }

  const result = await response.json();
  return result.data;
};

export const getAllGameRequests = async (status?: string): Promise<{ data: GameRequest[]; statistics: GameRequestStats }> => {
  const token = localStorage.getItem('gc_token');
  const url = status && status !== 'all' 
    ? `${API_BASE_URL}/api/game-requests/all?status=${status}`
    : `${API_BASE_URL}/api/game-requests/all`;
    
  const response = await fetch(url, {
    headers: adminHeaders(false, {
      Authorization: `Bearer ${token}`
    })
  });

  if (!response.ok) {
    throw new Error('خطا در دریافت درخواست‌ها');
  }

  return await response.json();
};

export const updateGameRequestStatus = async (
  id: string,
  status: string,
  adminResponse?: string
): Promise<GameRequest> => {
  const token = localStorage.getItem('gc_token');
  const response = await fetch(`${API_BASE_URL}/api/game-requests/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(true, {
      Authorization: `Bearer ${token}`
    }),
    body: JSON.stringify({ status, adminResponse })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'خطا در به‌روزرسانی درخواست');
  }

  const result = await response.json();
  return result.data;
};

export const deleteGameRequest = async (id: string): Promise<void> => {
  const token = localStorage.getItem('gc_token');
  const response = await fetch(`${API_BASE_URL}/api/game-requests/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'خطا در حذف درخواست');
  }
};
