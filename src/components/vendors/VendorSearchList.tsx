"use client";

import { useEffect, useState } from "react";

export default function VendorSearchList({ mode, onSelect }: any) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVendors(q = "") {
    setLoading(true);
    const res = await fetch(`/api/vendors?search=${q}`);
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    loadVendors();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadVendors(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="w-full">
      
      {/* Search Box */}
      <input
        className="w-full p-2 mb-4 rounded bg-white/10 border border-white/20 text-white"
        placeholder="Search vendor or company..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Vendor Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-white/10">
            <th className="p-2">Vendor</th>
            <th className="p-2">Company</th>
            <th className="p-2">Email</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                Searching...
              </td>
            </tr>
          ) : vendors.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No vendors found
              </td>
            </tr>
          ) : (
            vendors.map((v) => (
              <tr
                key={v.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.company}</td>
                <td className="p-2">{v.email}</td>

                <td className="p-2 text-center">
                  {mode === "evaluate" && (
                    <button
                      onClick={() => onSelect(v)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded"
                    >
                      Evaluate
                    </button>
                  )}

                  {mode === "report" && (
                    <a
                      href={`/api/reports?vendorId=${v.id}`}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
