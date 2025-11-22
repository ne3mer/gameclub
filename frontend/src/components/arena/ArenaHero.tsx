'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';

export default function ArenaHero() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-sm"
          >
            <Icon name="award" size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-white">آرنا رسمی NextPlay</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-black">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              آرنا بازی
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            در تورنمنت‌های آنلاین شرکت کنید، مهارت‌های خود را به نمایش بگذارید
            <br />
            و جوایز نقدی واقعی ببرید 🏆
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                1,234
              </div>
              <div className="text-sm text-slate-400 mt-1">بازیکن فعال</div>
            </div>
            <div className="w-px h-16 bg-slate-700" />
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                48
              </div>
              <div className="text-sm text-slate-400 mt-1">تورنمنت فعال</div>
            </div>
            <div className="w-px h-16 bg-slate-700" />
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ۵۰M+
              </div>
              <div className="text-sm text-slate-400 mt-1">جوایز پرداختی</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-8"
          >
            <Link
              href="#tournaments"
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon name="game" size={20} />
                مشاهده تورنمنت‌ها
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl border-2 border-slate-700 font-bold text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
            >
              <span className="flex items-center gap-2">
                <Icon name="user" size={20} />
                ثبت‌نام رایگان
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-10 w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30"
      />
    </div>
  );
}
