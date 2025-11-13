"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Components
import VendorList from "@/components/vendors/VendorList";
import VendorEvaluationList from "@/components/vendors/VendorEvaluationList";
import VendorReportList from "@/components/vendors/VendorReportList";
import SegmentManager from "@/components/admin/SegmentManager";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  // Modal states
  const [showVendors, setShowVendors] = useState(false);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
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
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Welcome, {user.name}
      </h1>

      <p className="text-white/80 mb-12 text-center max-w-xl">
        Logged in as{" "}
        <span className={`font-semibold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
          {user.role}
        </span>
        .
      </p>

      {/* Dashboard Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 w-full max-w-5xl">

        {/* Add/View Vendors */}
        <Card
          title="Add / View Vendors"
          desc="Add new vendors or view existing ones."
          onClick={() => setShowVendors(true)}
        />

        {/* Evaluate Vendors */}
        <Card
          title="Evaluate Vendors"
          desc="Rate vendors and add comments segment-wise."
          onClick={() => setShowEvaluate(true)}
        />

        {/* View Reports */}
        <Card
          title="View Reports"
          desc="Download performance PDF reports."
          onClick={() => setShowReports(true)}
        />

        {/* Admin Panel (only for ADMIN) */}
        {user.role === "ADMIN" && (
          <Card
            title="Admin Panel"
            desc="Manage segments, weights, and evaluation structure."
            onClick={() => setShowAdmin(true)}
          />
        )}

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

      {/* Vendor Modal */}
      {showVendors && (
        <Modal title="Vendor Management" onClose={() => setShowVendors(false)}>
          <VendorList />
        </Modal>
      )}

      {/* Evaluate Vendors Modal */}
      {showEvaluate && (
        <Modal title="Evaluate Vendors" onClose={() => setShowEvaluate(false)}>
          <VendorEvaluationList />
        </Modal>
      )}

      {/* Reports Modal */}
      {showReports && (
        <Modal title="Vendor Reports" onClose={() => setShowReports(false)}>
          <VendorReportList />
        </Modal>
      )}

      {/* Admin Modal */}
      {showAdmin && (
        <Modal title="Admin Panel — Segment Management" onClose={() => setShowAdmin(false)}>
          <SegmentManager />
        </Modal>
      )}

    </div>
  );
}

/* Card Component */
function Card({ title, desc, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all shadow-xl"
    >
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-sm text-white/70">{desc}</p>
    </div>
  );
}

/* Reusable Modal Component */
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 max-h-[80vh] overflow-y-auto w-full max-w-5xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>

        {children}

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
