"use client";

import { useEffect, useState } from "react";
import VendorEvaluationForm from "./VendorEvaluationForm";

export default function VendorEvaluationList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadVendors() {
    setLoading(true);
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  if (selectedVendor) {
    return (
      <VendorEvaluationForm 
        vendor={selectedVendor} 
        onClose={() => setSelectedVendor(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Evaluate Vendors</h2>

      <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl overflow-hidden">
        <table className="w-full text-white/90">
          <thead>
            <tr className="bg-white/10">
              <th className="p-3 text-left">Vendor Name</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">Loading…</td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">No vendors found</td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="border-t border-white/20">
                  <td className="p-3">{vendor.name}</td>
                  <td className="p-3">{vendor.company}</td>
                  <td className="p-3">{vendor.email}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
                    >
                      Evaluate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
