'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/icons/Icon';

const steps = [
  {
    number: 1,
    title: 'ثبت‌نام کنید',
    description: 'یک حساب کاربری رایگان بسازید و پروفایل خود را تکمیل کنید',
    icon: 'user',
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: 2,
    title: 'تورنمنت انتخاب کنید',
    description: 'از بین تورنمنت‌های مختلف، مسابقه مورد علاقه خود را پیدا کنید',
    icon: 'search',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    number: 3,
    title: 'ورودی پرداخت کنید',
    description: 'هزینه ورودی را پرداخت کنید و در تورنمنت ثبت‌نام شوید',
    icon: 'credit-card',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    number: 4,
    title: 'بازی کنید',
    description: 'در زمان مقرر وارد لابی شوید و با حریفان خود رقابت کنید',
    icon: 'game',
    color: 'from-orange-500 to-red-500'
  },
  {
    number: 5,
    title: 'نتیجه ارسال کنید',
    description: 'اسکرین‌شات نتیجه بازی خود را آپلود کنید',
    icon: 'upload',
    color: 'from-pink-500 to-rose-500'
  },
  {
    number: 6,
    title: 'جایزه بگیرید',
    description: 'در صورت برنده شدن، جایزه نقدی خود را دریافت کنید',
    icon: 'award',
    color: 'from-yellow-500 to-amber-500'
  }
];

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4"
        >
          <Icon name="info" size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">راهنما</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          چگونه <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">شرکت کنیم؟</span>
        </h2>
        <p className="text-slate-400 text-lg">شش قدم ساده تا کسب جایزه</p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Connection Lines (Desktop) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="relative group h-full">
              {/* Card */}
              <div className="relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all p-8 h-full">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4">
                  <div className={`
                    w-12 h-12 rounded-full bg-gradient-to-br ${step.color}
                    flex items-center justify-center font-black text-white text-xl
                    shadow-lg
                  `}>
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-2xl
                  bg-gradient-to-br ${step.color} bg-opacity-10 mb-6
                `}>
                  <Icon name={step.icon} size={32} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Glow */}
                <div className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color}
                  opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none
                `} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <a
          href="#tournaments"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
        >
          <Icon name="rocket" size={20} />
          همین الان شروع کنید
        </a>
      </motion.div>
    </div>
  );
}
