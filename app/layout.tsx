import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TangmoGoLearn - Learn English for Everyday Life",
  description: "AI-powered English learning app with vocabulary, grammar, dialogue practice, and speaking exercises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
              <span className="text-2xl">🍉</span>
              <span>TangmoGoLearn</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/vocabulary" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                📚 Vocabulary
              </Link>
              <Link href="/grammar" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                ✏️ Grammar
              </Link>
              <Link href="/dialogue" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                💬 Dialogue
              </Link>
              <Link href="/speaking" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                🎤 Speaking
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-sm text-slate-500">
          TangmoGoLearn — Practice English for Everyday Life 🍉
        </footer>
      </body>
    </html>
  );
}
