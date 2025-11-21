import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";
import { CartProvider } from "@/contexts/CartContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn"
});

export const metadata: Metadata = {
  title: {
    default: "GameClub Iran | اکانت قانونی PS5 با تحویل فوری",
    template: "%s | GameClub Iran"
  },
  description: "خرید اکانت Safe و استاندارد پلی‌استیشن با گارانتی تعویض، پرداخت ریالی و پشتیبانی لحظه‌ای. بهترین قیمت‌ها برای بازی‌های PS5 و PS4",
  keywords: ["خرید اکانت ps5", "اکانت قانونی پلی استیشن", "safe account", "خرید بازی ps5", "اکانت ظرفیتی", "گیم کلاب ایران"],
  authors: [{ name: "GameClub Iran" }],
  creator: "GameClub Iran",
  publisher: "GameClub Iran",
  metadataBase: new URL("https://gameclub-iran.local"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://gameclub-iran.local",
    siteName: "GameClub Iran",
    title: "GameClub Iran | اکانت قانونی PS5 با تحویل فوری",
    description: "خرید اکانت Safe و استاندارد پلی‌استیشن با گارانتی تعویض، پرداخت ریالی و پشتیبانی لحظه‌ای",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GameClub Iran - خرید اکانت قانونی PS5",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GameClub Iran | اکانت قانونی PS5",
    description: "خرید اکانت Safe و استاندارد پلی‌استیشن با گارانتی تعویض",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased`} suppressHydrationWarning>
        <CartProvider>
          <AnalyticsProvider>
            <MainNav />
            {children}
          </AnalyticsProvider>
        </CartProvider>
      </body>
    </html>
  );
}

