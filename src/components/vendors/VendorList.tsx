"use client";

import { useEffect, useState } from "react";

export default function VendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Vendor UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  // Fetch vendors
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

  // Add Vendor
  async function addVendor() {
    if (!name.trim()) return alert("Vendor name is required");

    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, email }),
    });

    if (res.ok) {
      setName("");
      setCompany("");
      setEmail("");
      setModalOpen(false);
      loadVendors();
    } else {
      alert("Failed to add vendor");
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Vendor List</h2>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold shadow-md"
        >
          + Add Vendor
        </button>
      </div>

      {/* Vendor Table */}
      <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-white/90">
          <thead>
            <tr className="bg-white/10">
              <th className="p-3 text-left">Vendor Name</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Email</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-white/60">
                  Loading...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-white/60">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-3">{vendor.name}</td>
                  <td className="p-3">{vendor.company || "-"}</td>
                  <td className="p-3">{vendor.email || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vendor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl w-full max-w-md">

            <h3 className="text-2xl font-semibold text-white mb-4">
              Add New Vendor
            </h3>

            <div className="space-y-4">
              <input
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                placeholder="Vendor Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

              <input
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                Cancel
              </button>

              <button
                onClick={addVendor}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
