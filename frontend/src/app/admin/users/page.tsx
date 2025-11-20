'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, adminHeaders, ADMIN_API_KEY } from '@/lib/api';
import { Icon } from '@/components/icons/Icon';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegram?: string;
  role: 'user' | 'admin';
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!ADMIN_API_KEY) {
      setError('کلید ادمین تنظیم نشده است');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Fetch users from the new API endpoint
      const usersRes = await fetch(`${API_BASE_URL}/api/users`, {
        headers: adminHeaders()
      });

      if (!usersRes.ok) {
        throw new Error('خطا در دریافت اطلاعات کاربران');
      }

      const usersData = await usersRes.json();
      const usersList = Array.isArray(usersData?.data) ? usersData.data : [];

      // Also fetch orders to calculate order count and total spent
      try {
        const ordersRes = await fetch(`${API_BASE_URL}/api/orders/admin?limit=1000`, {
          headers: adminHeaders()
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];

          // Create a map of user email to order stats
          const userStatsMap = new Map<string, { orderCount: number; totalSpent: number }>();

          orders.forEach((order: any) => {
            const email = order.customerInfo?.email;
            if (!email) return;

            if (!userStatsMap.has(email)) {
              userStatsMap.set(email, { orderCount: 0, totalSpent: 0 });
            }

            const stats = userStatsMap.get(email)!;
            stats.orderCount += 1;
            if (order.paymentStatus === 'paid') {
              stats.totalSpent += order.totalAmount || 0;
            }
          });

          // Merge stats with users
          const usersWithStats = usersList.map((user: User) => {
            const stats = userStatsMap.get(user.email) || { orderCount: 0, totalSpent: 0 };
            return { ...user, ...stats };
          });

          setUsers(usersWithStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          setUsers(usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        // If orders fetch fails, just use users without stats
        setUsers(usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (!ADMIN_API_KEY) {
      setError('کلید ادمین تنظیم نشده است');
      return;
    }

    setUpdatingRoles((prev) => new Set(prev).add(userId));
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در تغییر نقش کاربر');
      }

      const data = await response.json();
      
      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      setSuccess(data.message || `نقش کاربر به ${newRole === 'admin' ? 'مدیر' : 'کاربر عادی'} تغییر یافت`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر نقش کاربر');
    } finally {
      setUpdatingRoles((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch {
      return dateString;
    }
  };

  const formatToman = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت کاربران</h1>
          <p className="text-sm text-slate-500 mt-1">مشاهده و مدیریت کاربران سیستم</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Icon name="refresh" size={16} />
          بروزرسانی
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs text-slate-500 mb-2">کل کاربران</p>
          <p className="text-3xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs text-slate-500 mb-2">کاربران فعال</p>
          <p className="text-3xl font-black text-emerald-600">{users.filter(u => u.orderCount && u.orderCount > 0).length}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs text-slate-500 mb-2">مدیران</p>
          <p className="text-3xl font-black text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">جستجو</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، ایمیل یا شماره تلفن..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">نوع کاربر</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            >
              <option value="all">همه</option>
              <option value="user">کاربر عادی</option>
              <option value="admin">مدیر</option>
            </select>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
              <p className="text-sm text-slate-500 mt-3">در حال بارگذاری...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {searchQuery || roleFilter !== 'all' ? 'کاربری با این فیلترها یافت نشد' : 'هنوز کاربری ثبت نشده است'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">کاربر</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">اطلاعات تماس</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">نوع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">سفارشات</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">کل خرید</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">تاریخ عضویت</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {user.phone && <p>{user.phone}</p>}
                        {user.telegram && <p className="text-xs text-slate-500">Telegram: {user.telegram}</p>}
                        {!user.phone && !user.telegram && <p className="text-xs text-slate-400">---</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                        disabled={updatingRoles.has(user.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        } ${updatingRoles.has(user.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                      >
                        <option value="user">کاربر</option>
                        <option value="admin">مدیر</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{user.orderCount || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-emerald-600">
                        {user.totalSpent ? `${formatToman(user.totalSpent)} تومان` : '---'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {updatingRoles.has(user.id) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500"></div>
                          <span>در حال تغییر...</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
            <p className="text-xs text-slate-500">
              نمایش {filteredUsers.length} از {users.length} کاربر
            </p>
          </div>
        )}
      </section>

      {!ADMIN_API_KEY && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p className="font-semibold">⚠️ توجه:</p>
          <p className="mt-1">برای مدیریت کاربران، لازم است کلید ادمین (NEXT_PUBLIC_ADMIN_API_KEY) تنظیم شود.</p>
        </div>
      )}
    </div>
  );
}
