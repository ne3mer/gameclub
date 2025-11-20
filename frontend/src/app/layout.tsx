import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";
import { CartProvider } from "@/contexts/CartContext";

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
  title: "GameClub Iran | اکانت قانونی PS5 با تحویل فوری",
  description: "خرید اکانت Safe و استاندارد پلی‌استیشن با گارانتی تعویض، پرداخت ریالی و پشتیبانی لحظه‌ای.",
  metadataBase: new URL("https://gameclub-iran.local")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased`} suppressHydrationWarning>
        <CartProvider>
          <MainNav />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

