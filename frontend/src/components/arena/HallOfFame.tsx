'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/icons/Icon';

const winners = [
  { name: 'محمدرضا احمدی', prize: '۵,۰۰۰,۰۰۰', game: 'Warzone', placement: 1, avatar: '🏆' },
  { name: 'علی کریمی', prize: '۳,۰۰۰,۰۰۰', game: 'Fortnite', placement: 1, avatar: '🥇' },
  { name: 'سارا محمدی', prize: '۲,۵۰۰,۰۰۰', game: 'EA FC 24', placement: 1, avatar: '⭐' },
  { name: 'حسین رضایی', prize: '۲,۰۰۰,۰۰۰', game: 'Apex Legends', placement: 1, avatar: '🎮' },
  { name: 'فاطمه نوری', prize: '۱,۵۰۰,۰۰۰', game: 'Tekken 8', placement: 1, avatar: '👑' },
];

export default function HallOfFame() {
  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4"
        >
          <Icon name="award" size={16} className="text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">تالار مشاهیر</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          برندگان <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">اخیر</span>
        </h2>
        <p className="text-slate-400 text-lg">قهرمانان تورنمنت‌های گذشته</p>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winners.map((winner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-yellow-500/50 transition-all p-6">
              {/* Rank Badge */}
              {index < 3 && (
                <div className="absolute top-4 right-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' : ''}
                    ${index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900' : ''}
                    ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' : ''}
                  `}>
                    {index + 1}
                  </div>
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                  {winner.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{winner.name}</h3>
                  <p className="text-sm text-slate-400">{winner.game}</p>
                </div>
              </div>

              {/* Prize */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="text-xs text-slate-400 mb-1">جایزه دریافتی</div>
                <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {winner.prize} تومان
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
