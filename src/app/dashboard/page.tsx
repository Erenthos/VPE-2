"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if JWT token exists
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    // Decode token (only name, email, role)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        name: payload.name,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      router.push("/auth/signin");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const roleColor =
    user.role === "ADMIN"
      ? "from-amber-400 to-orange-500"
      : user.role === "EVALUATOR"
      ? "from-indigo-400 to-cyan-400"
      : "from-green-400 to-emerald-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex flex-col items-center py-16 px-6">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Welcome, {user.name || "User"}
      </h1>

      <p className="text-white/80 mb-10 text-center max-w-xl">
        You are logged in as{" "}
        <span
          className={`font-semibold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}
        >
          {user.role}
        </span>
        . Use the tools below to manage vendors and evaluations.
      </p>

      {/* Dashboard Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 w-full max-w-5xl">
        {/* Add Vendor */}
        <div
          onClick={() => router.push("/api/vendors")}
          className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-3">Add Vendor</h3>
          <p className="text-sm text-white/70">
            Add a new vendor to the performance evaluation system.
          </p>
        </div>

        {/* Evaluate Vendor */}
        <div
          onClick={() => router.push("/api/evaluations")}
          className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-3">Evaluate Vendors</h3>
          <p className="text-sm text-white/70">
            Rate vendors segment-wise and provide performance comments.
          </p>
        </div>

        {/* Generate Report */}
        <div
          onClick={() => router.push("/api/reports")}
          className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-3">View Reports</h3>
          <p className="text-sm text-white/70">
            Download vendor performance reports with segment-wise ratings.
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/auth/signin");
        }}
        className="mt-12 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-medium"
      >
        Logout
      </button>
    </div>
  );
}

