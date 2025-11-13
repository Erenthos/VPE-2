"use client";

import { useEffect, useState } from "react";

export default function VendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVendors(query = "") {
    setLoading(true);
    const res = await fetch(`/api/vendors?search=${query}`);
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadVendors(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="w-full">
      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by vendor name or company..."
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Vendor Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-white/10 text-left">
            <th className="p-2">Vendor Name</th>
            <th className="p-2">Company</th>
            <th className="p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="p-3 text-center" colSpan={3}>Searching...</td>
            </tr>
          ) : vendors.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-3 text-center">No vendors found</td>
            </tr>
          ) : (
            vendors.map((v) => (
              <tr key={v.id} className="border-t border-white/10">
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.company}</td>
                <td className="p-2">{v.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
