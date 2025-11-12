"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-20 space-y-8">
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Vendor Performance Evaluator 2
      </h1>

      <p className="max-w-2xl text-white/80 text-lg">
        A modern platform to evaluate vendor performance with precision, transparency, and collaboration.  
        Role-based access for Admins, Evaluators, and Viewers — all in a beautiful, intuitive dashboard.
      </p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => router.push("/auth/signup")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/auth/signin")}
          className="px-6 py-3 border border-indigo-400 text-indigo-300 rounded-xl hover:bg-indigo-600/30 transition"
        >
          Sign In
        </button>
      </div>
    </section>
  );
}

