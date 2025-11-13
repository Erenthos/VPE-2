"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VendorList from "@/components/vendors/VendorList";
import VendorSearchList from "@/components/vendors/VendorSearchList";
import VendorEvaluationForm from "@/components/vendors/VendorEvaluationForm";
import SegmentManager from "@/components/admin/SegmentManager";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  // Modal states
  const [showVendors, setShowVendors] = useState(false);
  const [showEvaluate, setShowEvaluate] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  // Decode JWT stored in localStorage
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
      localStorage.removeItem("token");
      router.push("/auth/signin");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
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
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Welcome, {user.name}
      </h1>

      <p className="text-white/80 mb-12 text-center max-w-xl">
        Logged in as{" "}
        <span className={`font-semibold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
          {user.role}
        </span>
      </p>

      {/* Dashboard Cards */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 w-full max-w-5xl">

        {/* Add/View Vendors */}
        <div
          onClick={() => setShowVendors(true)}
          className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 
          backdrop-blur-md hover:bg-white/20 transition-all shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-3">Add / View Vendors</h3>
          <p className="text-sm text-white/70">Search, add or view vendors.</p>
        </div>

        {/* Evaluate Vendors — ONLY ADMIN + EVALUATOR */}
        {(user.role === "ADMIN" || user.role === "EVALUATOR") && (
          <div
            onClick={() => {
              setSelectedVendor(null);
              setShowEvaluate(true);
            }}
            className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 
            backdrop-blur-md hover:bg-white/20 transition-all shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-3">Evaluate Vendors</h3>
            <p className="text-sm text-white/70">Search vendor and evaluate.</p>
          </div>
        )}

        {/* View Reports */}
        <div
          onClick={() => setShowReports(true)}
          className="cursor-pointer p-6 rounded-2xl bg-white/10 border border-white/20 
          backdrop-blur-md hover:bg-white/20 transition-all shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-3">View Reports</h3>
          <p className="text-sm text-white/70">Search vendor and download report.</p>
        </div>

        {/* ADMIN PANEL */}
        {user.role === "ADMIN" && (
          <div
            onClick={() => setShowAdmin(true)}
            className="cursor-pointer p-6 rounded-2xl bg-red-500/20 border border-red-400/30 
            backdrop-blur-md hover:bg-red-500/30 transition-all shadow-xl md:col-span-3"
          >
            <h3 className="text-xl font-semibold mb-3">
              Admin Panel — Manage Segments & Questions
            </h3>
            <p className="text-sm text-white/70">
              Add/Edit/Delete segments, change weightage, and manage questions.
            </p>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        className="mt-12 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-medium"
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/auth/signin");
        }}
      >
        Logout
      </button>

      {/* --------------------- MODALS --------------------- */}

      {/* Add / View Vendors */}
      {showVendors && (
        <Modal onClose={() => setShowVendors(false)}>
          <h2 className="text-2xl font-bold mb-4 text-center">Vendor Management</h2>
          <VendorList />
        </Modal>
      )}

      {/* Evaluate Vendors — only for admin/evaluator */}
      {(user.role === "ADMIN" || user.role === "EVALUATOR") && showEvaluate && (
        <Modal onClose={() => { setShowEvaluate(false); setSelectedVendor(null); }}>
          <h2 className="text-2xl font-bold mb-4 text-center">Evaluate Vendors</h2>

          <VendorSearchList
            mode="evaluate"
            onSelect={(vendor: any) => setSelectedVendor(vendor)}
          />

          {selectedVendor && (
            <div className="mt-8">
              <VendorEvaluationForm
                vendor={selectedVendor}
                onClose={() => setSelectedVendor(null)}
              />
            </div>
          )}
        </Modal>
      )}

      {/* View Reports */}
      {showReports && (
        <Modal onClose={() => setShowReports(false)}>
          <h2 className="text-2xl font-bold mb-4 text-center">Download Vendor Reports</h2>
          <VendorSearchList mode="report" />
        </Modal>
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <Modal onClose={() => setShowAdmin(false)}>
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Panel — Manage Segments & Questions</h2>
          <SegmentManager />
        </Modal>
      )}

    </div>
  );
}

/* ---------------- SHARED MODAL COMPONENT ---------------- */

function Modal({ onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20
       w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-xl">
        
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
