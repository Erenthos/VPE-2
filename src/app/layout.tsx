import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Performance Evaluator 2",
  description: "Rate, evaluate, and monitor vendor performance with stunning UI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
        <header className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5 backdrop-blur-lg">
          <h1 className="text-xl font-semibold tracking-wide">VPE-2</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="hover:text-indigo-300 transition">
              Home
            </a>
            <a href="/auth/signin" className="hover:text-indigo-300 transition">
              Sign In
            </a>
            <a href="/auth/signup" className="hover:text-indigo-300 transition">
              Sign Up
            </a>
          </nav>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center">
          {children}
        </main>

        <footer className="text-xs text-center py-4 text-white/60">
          © {new Date().getFullYear()} Vendor Performance Evaluator 2. All rights reserved.
        </footer>
      </body>
    </html>
  );
}

