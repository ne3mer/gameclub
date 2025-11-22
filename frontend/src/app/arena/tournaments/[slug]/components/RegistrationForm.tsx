import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

interface RegistrationFormProps {
  tournamentId: string;
  initialGameTag?: string;
  onSuccess?: (paymentUrl: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ tournamentId, initialGameTag = '', onSuccess }) => {
  const [gameTag, setGameTag] = useState(initialGameTag);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arena/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming JWT token is stored in localStorage
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ gameTag }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      if (onSuccess) {
        onSuccess(data.paymentUrl);
      } else {
        // Redirect to payment page by default
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Icon name="award" className="text-primary" /> ثبت‌نام در تورنمنت
      </h3>
      <input
        type="text"
        placeholder="Game Tag (e.g., PSN, Epic)"
        value={gameTag}
        onChange={(e) => setGameTag(e.target.value)}
        required
        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-primary text-black font-semibold rounded hover:bg-primary/80 transition"
      >
        {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>
    </form>
  );
};
