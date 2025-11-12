"use client";

import { useEffect, useState } from "react";
import VendorEvaluationForm from "./VendorEvaluationForm";
import VendorReportCard from "./VendorReportCard";

export default function VendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  // Fetch vendors
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then(setVendors)
      .catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Vendor List</h2>

      {/* Vendor Table */}
      <div className="overflow-x-auto rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/10 text-white">
              <th className="p-3">Vendor Name</th>
              <th className="p-3">Company</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
              vendors.map((v) => (
                <tr key={v.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-3">{v.name}</td>
                  <td className="p-3">{v.company || "-"}</td>
                  <td className="p-3">{v.email || "-"}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => setSelectedVendor(v)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs"
                    >
                      Evaluate
                    </button>
                    <VendorReportCard vendorId={v.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-4 text-white/60">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedVendor && (
        <VendorEvaluationForm
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
