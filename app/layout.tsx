import type { Metadata } from 'next';
import './globals.css';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { Scale, FileText, ArrowRightLeft, FileCheck, History } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LexAI — Legal Document Intelligence for Everyone',
  description:
    'Understand before you sign. Know before you act. AI-powered legal document decode, comparison, and lawyer preparation for India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-base text-text-primary min-h-screen flex flex-col antialiased">
        {/* Skip to Content link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none shadow-xl"
        >
          Skip to main content
        </a>

        {/* Legal Disclaimer Header */}
        <DisclaimerBanner />

        {/* Global Navigation Bar */}
        <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
          <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-serif-legal font-bold text-xl tracking-tight text-text-primary">
                Lex<span className="text-primary">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-4 text-xs font-medium">
              <Link
                href="/decode"
                className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Decode</span>
              </Link>

              <Link
                href="/compare"
                className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 text-warning" />
                <span className="hidden sm:inline">Compare</span>
              </Link>

              <Link
                href="/prepare"
                className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-safe" />
                <span className="hidden sm:inline">Prepare</span>
              </Link>

              <Link
                href="/#history"
                className="px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors flex items-center gap-1.5 border border-border-subtle"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-border py-6 text-center text-xs text-text-muted bg-surface/50">
          <p>© {new Date().getFullYear()} LexAI. Built for legal clarity and accessibility in India.</p>
        </footer>
      </body>
    </html>
  );
}
