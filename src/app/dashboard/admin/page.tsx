"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SegmentManager from "@/components/admin/SegmentManager";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setUser(payload);
    } catch {
      router.push("/auth/signin");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white flex flex-col items-center py-16 px-6">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
        Admin Control Panel
      </h1>

      <SegmentManager />

      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/auth/signin");
        }}
        className="mt-10 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-medium"
      >
        Logout
      </button>
    </div>
  );
}
