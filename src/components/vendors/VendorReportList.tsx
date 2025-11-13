"use client";

import { useEffect, useState } from "react";

export default function VendorReportList() {
  const [vendors, setVendors] = useState<any[]>([]);
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-xl text-white font-bold mb-4">Vendor Reports</h2>

      <div className="bg-white/10 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden">
        <table className="w-full text-white/90">
          <thead>
            <tr className="bg-white/10">
              <th className="p-3 text-left">Vendor Name</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Download</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">Loading...</td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">No vendors found</td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="border-t border-white/10">
                  <td className="p-3">{vendor.name}</td>
                  <td className="p-3">{vendor.company || "-"}</td>
                  <td className="p-3">{vendor.email || "-"}</td>
                  <td className="p-3 text-center">
                    <a
                      href={`/api/reports?vendorId=${vendor.id}`}
                      target="_blank"
                      className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
                    >
                      Download
                    </a>
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
