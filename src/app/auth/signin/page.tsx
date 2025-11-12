"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      // store JWT for session
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Sign In
        </h2>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-white/70">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-indigo-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

